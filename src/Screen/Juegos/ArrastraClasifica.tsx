import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import LoadingQuestion from '../../Components/LoadingQuestion';
import { Fonts } from '../../Utils/Fonts';
import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { startClassify, answerClassify } from '../../api/game';
import { USE_DEV_USER, DEV_USER_ID } from '../../api/config/env';
import DraggableBlock, { GameItem } from './components/DraggableBlock';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';
import { useVideoPlayer, VideoView } from 'expo-video';

// ── Types ────────────────────────────────────────────────────────────────────

type AfterStatus = 'active' | 'finished' | 'failed';
type BinBounds = { x: number; y: number; width: number; height: number };

type Category = { id: string; name: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function hitTest(x: number, y: number, b: BinBounds): boolean {
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
    levelId: string | null;
    onBackToLevel: () => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ArrastraClasifica({ levelId, onBackToLevel, onShowCongrats, onShowIncorrect }: Props) {
    const { session, initializing } = useContext(AuthContext);
    const { isReviewMode } = useGame();

    const levelConfig = LEVELS_CONFIG.find(l => l.id === levelId);
    const levelSlug = levelConfig?.levelSlug ?? 'arbol-financiero';
    const micro = levelConfig?.micro ?? 2;

    const [loading, setLoading] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [prompt, setPrompt] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<GameItem[]>([]);
    // itemId → categoryId, solo ítems correctamente clasificados
    const [correctlyPlaced, setCorrectlyPlaced] = useState<Record<string, string>>({});
    const [livesLeft, setLivesLeft] = useState(4);
    const [overCategory, setOverCategory] = useState<string | null>(null);

    const sessionIdRef = useRef<string | null>(null);
    const lessonItemIdRef = useRef<string | null>(null);
    const binBoundsRef = useRef<Record<string, BinBounds>>({});
    const binViewRefs = useRef<Record<string, View | null>>({});
    // Previene envíos dobles mientras se procesa un ítem
    const submittingItems = useRef<Set<string>>(new Set());

    const player = useVideoPlayer(null, (p) => {
        p.loop = false;
        p.timeUpdateEventInterval = 0.1;
    });

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVideoFinish = () => {
        try { player.pause(); } catch (e) { }
        setShowVideo(false);
    };

    useEffect(() => {
        const tSub = player.addListener('timeUpdate', (p: { currentTime: number }) => setCurrentTime(p.currentTime));
        const dSub = player.addListener('sourceLoad', (p: { duration: number }) => setDuration(p.duration));
        const fSub = player.addListener('playToEnd', handleVideoFinish);
        const eSub = player.addListener('statusChange', (s: { status: string }) => {
            if (s.status === 'error') setShowVideo(false);
        });
        return () => {
            try { if (player && typeof player.pause === 'function') player.pause(); } catch (e) { }
            tSub.remove(); dSub.remove(); fSub.remove(); eSub.remove();
        };
    }, [player]);

    useEffect(() => {
        if (videoUrl) { player.replace({ uri: videoUrl }); player.play(); }
    }, [videoUrl]);

    useEffect(() => {
        if (!showVideo) {
            try { if (player && typeof player.pause === 'function') player.pause(); } catch (e) { }
        }
    }, [showVideo, player]);

    // ── Start session ────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            if (initializing) return;
            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
            if (!userId) return;
            try {
                const res = await startClassify(levelSlug, micro, userId, isReviewMode);
                sessionIdRef.current = res.session_id;
                lessonItemIdRef.current = res.question?.lesson_item_id ?? null;
                setLivesLeft(res.lives_left ?? 4);
                setPrompt(res.question?.prompt ?? '');
                setCategories(res.question?.categories ?? []);
                const rawItems: Array<{ id: string; text: string }> = res.question?.items ?? [];
                setItems(shuffle(rawItems.map(i => ({ id: i.id, label: i.text, correctCategory: '' }))));
                const url = res.videos?.[0]?.url ?? null;
                if (url) { setVideoUrl(url); setShowVideo(true); } else { setShowVideo(false); }
            } catch (err: any) {
                Alert.alert('Error', err?.message ?? 'No se pudo iniciar el juego');
                onBackToLevel();
            } finally {
                setLoading(false);
            }
        })();
    }, [initializing, session?.user_id]);

    // ── Bin measurement ──────────────────────────────────────────────────────

    const measureBins = useCallback(() => {
        for (const catId of Object.keys(binViewRefs.current)) {
            binViewRefs.current[catId]?.measureInWindow((x, y, width, height) => {
                binBoundsRef.current[catId] = { x, y, width, height };
            });
        }
    }, []);

    // ── Drag handlers ────────────────────────────────────────────────────────

    const handleDragStart = useCallback((_id: string) => {
        measureBins();
        setOverCategory(null);
    }, [measureBins]);

    const handleDragMove = useCallback((absoluteX: number, absoluteY: number) => {
        let found: string | null = null;
        for (const [catId, bounds] of Object.entries(binBoundsRef.current)) {
            if (hitTest(absoluteX, absoluteY, bounds)) { found = catId; break; }
        }
        setOverCategory(found);
    }, []);

    const handleDragEnd = useCallback(async (item: GameItem, absoluteX: number, absoluteY: number) => {
        setOverCategory(null);

        let droppedCatId: string | null = null;
        for (const [catId, bounds] of Object.entries(binBoundsRef.current)) {
            if (hitTest(absoluteX, absoluteY, bounds)) { droppedCatId = catId; break; }
        }
        if (!droppedCatId) return;

        // Evitar envío doble para el mismo ítem
        if (submittingItems.current.has(item.id)) return;
        if (!sessionIdRef.current || !lessonItemIdRef.current) return;

        const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
        if (!userId) return;

        submittingItems.current.add(item.id);
        try {
            const res = await answerClassify(
                levelSlug,
                micro,
                sessionIdRef.current,
                userId,
                lessonItemIdRef.current,
                item.id,
                droppedCatId,
            );

            const newLives = res.lives_left ?? livesLeft;
            setLivesLeft(newLives);

            if (res.is_correct) {
                setCorrectlyPlaced(prev => ({ ...prev, [item.id]: droppedCatId! }));

                if (res.status === 'finished') {
                    onShowCongrats(res.bellotas_earned ?? 0, res.bellotas_balance ?? 0, 'finished');
                }
            } else {
                // Ítem incorrecto — permanece en el banco (no se agrega a correctlyPlaced)
                onShowIncorrect(
                    res.feedback ?? 'Inténtalo de nuevo.',
                    newLives,
                    res.status === 'failed' ? 'failed' : 'active',
                );
            }
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Error al enviar respuesta');
        } finally {
            submittingItems.current.delete(item.id);
        }
    }, [session?.user_id, livesLeft, levelSlug, micro]);

    // ── UI ────────────────────────────────────────────────────────────────────

    if (initializing || loading) return <LoadingQuestion />;

    if (showVideo) {
        const progress = duration > 0 ? currentTime / duration : 0;
        return (
            <View style={styles.videoContainer}>
                <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
                <View style={styles.videoOverlay}>
                    <TouchableOpacity style={styles.skipButton} onPress={handleVideoFinish}>
                        <Text style={styles.skipText}>Omitir</Text>
                    </TouchableOpacity>
                    <View style={styles.videoControls}>
                        <Text style={styles.timeText}>
                            {formatTime(currentTime * 1000)} / {formatTime(duration * 1000)}
                        </Text>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    const unplacedItems = items.filter(i => !correctlyPlaced[i.id]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerBox} />
            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>
            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{livesLeft}</Text>
            </View>

            {/* Contenido */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Prompt */}
                <Text style={styles.promptText}>{prompt}</Text>

                {/* Banco de bloques */}
                {unplacedItems.length > 0 && (
                    <View style={styles.wordBank}>
                        <Text style={styles.wordBankLabel}>ARRASTRA UN BLOQUE</Text>
                        <View style={styles.itemsGrid}>
                            {unplacedItems.map(item => (
                                <DraggableBlock
                                    key={item.id}
                                    item={item}
                                    disabled={submittingItems.current.has(item.id)}
                                    onDragStart={handleDragStart}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Categorías */}
                <View style={styles.binsGrid}>
                    {categories.map(cat => {
                        const placedHere = items.filter(i => correctlyPlaced[i.id] === cat.id);
                        const isOver = overCategory === cat.id;
                        return (
                            <View
                                key={cat.id}
                                ref={ref => { binViewRefs.current[cat.id] = ref; }}
                                onLayout={measureBins}
                                style={[styles.bin, isOver && styles.binActive]}
                            >
                                <Text style={styles.binTitle}>{cat.name}</Text>
                                {placedHere.length === 0 && (
                                    <Text style={styles.binHint}>SUÉLTALO AQUÍ</Text>
                                )}
                                {placedHere.length > 0 && (
                                    <View style={styles.chipsContainer}>
                                        {placedHere.map(i => (
                                            <View key={i.id} style={styles.placedChip}>
                                                <Text style={styles.chipText}>{i.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#00646D' },
    headerBox: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: responsiveHeight(14), backgroundColor: '#004D54', zIndex: 1,
    },
    backButton: {
        position: 'absolute', top: responsiveHeight(5.5), left: scale(16), zIndex: 10, padding: scale(8),
    },
    livesContainer: {
        position: 'absolute', top: responsiveHeight(5.5), right: scale(16), zIndex: 10,
        flexDirection: 'row', alignItems: 'center', gap: scale(4),
    },
    livesText: { color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(16) },
    scroll: { flex: 1, marginTop: responsiveHeight(13) },
    scrollContent: {
        paddingHorizontal: scale(16), paddingTop: verticalScale(16), paddingBottom: verticalScale(40),
    },
    promptText: {
        color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(17),
        textAlign: 'center', marginBottom: verticalScale(20), lineHeight: moderateScale(24),
    },
    wordBank: { marginBottom: verticalScale(20) },
    wordBankLabel: {
        color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.Bold, fontSize: moderateScale(11),
        letterSpacing: 1.2, marginBottom: verticalScale(8), textAlign: 'center',
    },
    itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(8), justifyContent: 'center' },
    binsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: scale(10),
        justifyContent: 'space-between', marginBottom: verticalScale(24),
    },
    bin: {
        width: '47%', minHeight: verticalScale(80),
        backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: scale(14),
        borderWidth: scale(2), borderColor: 'rgba(255,255,255,0.15)', padding: scale(10),
    },
    binActive: { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.12)' },
    binTitle: {
        color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(14),
        textAlign: 'center', marginBottom: verticalScale(4),
    },
    binHint: {
        color: 'rgba(255,255,255,0.4)', fontFamily: Fonts.Bold, fontSize: moderateScale(9),
        letterSpacing: 0.8, textAlign: 'center', marginBottom: verticalScale(6),
    },
    chipsContainer: { gap: verticalScale(4), marginTop: verticalScale(4) },
    placedChip: {
        backgroundColor: '#2ECC71', borderRadius: scale(8),
        paddingVertical: verticalScale(6), paddingHorizontal: scale(8),
    },
    chipText: { color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(11), textAlign: 'center' },

    videoContainer: { flex: 1, backgroundColor: '#000' },
    video: { flex: 1 },
    videoOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'space-between',
        padding: scale(20),
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    skipButton: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(16),
        borderRadius: scale(20),
        marginTop: responsiveHeight(5),
    },
    skipText: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 14 },
    videoControls: { marginBottom: responsiveHeight(5) },
    timeText: {
        color: '#fff', fontFamily: Fonts.Bold, fontSize: moderateScale(16),
        marginBottom: verticalScale(8), textAlign: 'center',
    },
    progressBarBackground: {
        height: verticalScale(8), backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: scale(4), overflow: 'hidden',
    },
    progressBarForeground: { height: '100%', backgroundColor: '#FFD700' },
});
