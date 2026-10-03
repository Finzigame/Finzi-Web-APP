import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import BarraProgreso from '../../assets/Images/Nivel_Bellota/barraprogrso';
import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import StarSparkle from '../../assets/Images/ordena_bosque/StarSparkle';
import { Fonts } from '../../Utils/Fonts';
import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { startClassify, answerClassify } from '../../api/game';
import { DEV_USER_ID, USE_DEV_USER } from '../../api/config/env';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';
import LoadingQuestion from '../../Components/LoadingQuestion';
import DraggableBlock, { GameItem } from './components/DraggableBlock';
import { useVideoPlayer, VideoView } from 'expo-video';

// ── Types ─────────────────────────────────────────────────────────────────────

type AfterStatus = 'active' | 'finished' | 'failed';
type BinBounds = { x: number; y: number; width: number; height: number };
type Category = { id: string; name: string };

const ITEMS_PER_ROUND = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    levelId: string | null;
    onBackToLevel: () => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus, opts?: { repasoNeeded?: boolean; repasoWrongCount?: number; sessionId?: string }) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
    onGoToLivesShop?: () => void;
    skipIntroVideo?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function JuegoClassify({ levelId, onBackToLevel, onShowCongrats, onShowIncorrect, onGoToLivesShop, skipIntroVideo }: Props) {
    const { session, initializing } = useContext(AuthContext);
    const { isReviewMode, repasoStartData, setRepasoStartData } = useGame();

    const levelConfig = LEVELS_CONFIG.find(l => l.id === levelId);
    const levelSlug = levelConfig?.levelSlug ?? 'arbol-financiero';
    const micro = levelConfig?.micro ?? 2;

    const [loading, setLoading] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [allItems, setAllItems] = useState<GameItem[]>([]);
    const [roundIndex, setRoundIndex] = useState(0);
    const [totalRounds, setTotalRounds] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [classifiedCount, setClassifiedCount] = useState(0);
    // itemId → categoryId (where it was correctly placed)
    const [placedMap, setPlacedMap] = useState<Record<string, string>>({});
    const [livesLeft, setLivesLeft] = useState(4);
    const [overCategory, setOverCategory] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [incorrectPanel, setIncorrectPanel] = useState<{ feedback: string; livesLeft: number } | null>(null);
    const incorrectPanelAnim = useRef(new Animated.Value(300)).current;
    const incorrectContentOpacity = useRef(new Animated.Value(0)).current;
    const [showVideo, setShowVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

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
        try { player.pause(); } catch (e) {}
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
            try { if (player && typeof player.pause === 'function') player.pause(); } catch (e) {}
            tSub.remove(); dSub.remove(); fSub.remove(); eSub.remove();
        };
    }, [player]);

    useEffect(() => {
        if (videoUrl) {
            player.replace({ uri: videoUrl });
            player.play();
        }
    }, [videoUrl]);

    useEffect(() => {
        if (!showVideo) {
            try { if (player && typeof player.pause === 'function') player.pause(); } catch (e) {}
        }
    }, [showVideo, player]);

    const sessionIdRef = useRef<string | null>(null);
    const lessonItemIdRef = useRef<string | null>(null);
    const binBoundsRef = useRef<Record<string, BinBounds>>({});
    const binViewRefs = useRef<Record<string, View | null>>({});
    const submittingItems = useRef<Set<string>>(new Set());
    const totalEarnedRef = useRef(0);
    const finalBalanceRef = useRef(0);
    const showResultsTriggeredRef = useRef(false);
    const repasoNeededRef = useRef(false);
    const repasoWrongCountRef = useRef(0);
    const nextQuestionRef = useRef<{
        lesson_item_id: string;
        prompt: string;
        categories: Category[];
        items: Array<{ id: string; text: string }>;
    } | null>(null);

    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    // ── Start session ─────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            if (initializing) return;
            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
            if (!userId) return;
            try {
                // Si hay datos de repaso pendientes para classify, usarlos en vez de iniciar sesión nueva
                if (repasoStartData && repasoStartData.game_type === 'classify') {
                    const rd = repasoStartData;
                    setRepasoStartData(null);
                    sessionIdRef.current = rd.session_id;
                    const q = rd.question as {
                        lesson_item_id?: string;
                        prompt?: string;
                        categories?: Category[];
                        items?: Array<{ id: string; text: string }>;
                    };
                    lessonItemIdRef.current = q.lesson_item_id ?? null;
                    setLivesLeft(rd.lives_left);
                    setPrompt(q.prompt ?? '');
                    setCategories(q.categories ?? []);
                    const raw: Array<{ id: string; text: string }> = q.items ?? [];
                    const shuffled = shuffle(raw.map(i => ({ id: i.id, label: i.text, correctCategory: '' })));
                    setAllItems(shuffled);
                    setTotalRounds(Math.ceil(shuffled.length / ITEMS_PER_ROUND));
                    setTotalItems(raw.length);
                    setShowVideo(false);
                    setLoading(false);
                    return;
                }

                const res = await startClassify(levelSlug, micro, userId, isReviewMode);
                sessionIdRef.current = res.session_id;
                lessonItemIdRef.current = res.question?.lesson_item_id ?? null;
                setLivesLeft(res.lives_left);
                setPrompt(res.question?.prompt ?? '');
                setCategories(res.question?.categories ?? []);
                const raw: Array<{ id: string; text: string }> = res.question?.items ?? [];
                const shuffled = shuffle(raw.map(i => ({ id: i.id, label: i.text, correctCategory: '' })));
                setAllItems(shuffled);
                setTotalRounds(Math.ceil(shuffled.length / ITEMS_PER_ROUND));
                setTotalItems(res.total_items ?? raw.length);

                const url = res.videos?.[0]?.url ?? null;
                if (url && !skipIntroVideo) {
                    setVideoUrl(url);
                    setShowVideo(true);
                } else {
                    setShowVideo(false);
                }
            } catch (err: any) {
                const msg: string = err?.message ?? '';
                if (msg.toLowerCase().includes('vidas')) {
                    onGoToLivesShop ? onGoToLivesShop() : onBackToLevel();
                } else {
                    Alert.alert('Error', msg || 'No se pudo iniciar el juego');
                    onBackToLevel();
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [initializing, session?.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Derived ───────────────────────────────────────────────────────────────

    const roundStart = roundIndex * ITEMS_PER_ROUND;
    const roundItems = allItems.slice(roundStart, roundStart + ITEMS_PER_ROUND);
    const unplacedInRound = roundItems.filter(i => !placedMap[i.id]);
    const roundAllPlaced = roundItems.length > 0 && unplacedInRound.length === 0;

    // ── Show results when round complete ──────────────────────────────────────

    useEffect(() => {
        if (roundAllPlaced && !showResults && !showResultsTriggeredRef.current) {
            showResultsTriggeredRef.current = true;
            setShowResults(true);
            contentOpacity.setValue(0);
            Animated.timing(panelAnim, {
                toValue: 0, duration: 200, useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start(() => {
                Animated.timing(contentOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
            });
        }
    }, [roundAllPlaced, showResults]);

    // ── Bin measurement ───────────────────────────────────────────────────────

    const measureBins = useCallback(() => {
        for (const catId of Object.keys(binViewRefs.current)) {
            binViewRefs.current[catId]?.measureInWindow((x, y, width, height) => {
                binBoundsRef.current[catId] = { x, y, width, height };
            });
        }
    }, []);

    // ── Drag handlers ─────────────────────────────────────────────────────────

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
        if (submittingItems.current.has(item.id)) return;
        if (!sessionIdRef.current || !lessonItemIdRef.current) return;

        const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
        if (!userId) return;

        submittingItems.current.add(item.id);
        try {
            const res = await answerClassify(
                levelSlug, micro,
                sessionIdRef.current,
                userId,
                lessonItemIdRef.current,
                item.id,
                droppedCatId,
            );

            const newLives = res.lives_left ?? livesLeft;
            setLivesLeft(newLives);

            if (res.is_correct) {
                totalEarnedRef.current += res.bellotas_earned ?? 0;
                finalBalanceRef.current = res.bellotas_balance ?? 0;
                if (res.repaso_needed) {
                    repasoNeededRef.current = true;
                    repasoWrongCountRef.current = res.repaso_wrong_count ?? 0;
                }
                nextQuestionRef.current = res.next_question ?? null;
                setClassifiedCount(prev => prev + 1);
                setPlacedMap(prev => ({ ...prev, [item.id]: droppedCatId! }));
            } else {
                const statusAfter: AfterStatus = res.status === 'failed' ? 'failed' : 'active';
                if (statusAfter === 'failed') {
                    onShowIncorrect(res.feedback ?? 'Inténtalo de nuevo.', newLives, 'failed');
                } else {
                    setIncorrectPanel({ feedback: res.feedback ?? 'Inténtalo de nuevo.', livesLeft: newLives });
                    incorrectPanelAnim.setValue(300);
                    incorrectContentOpacity.setValue(0);
                    Animated.timing(incorrectPanelAnim, {
                        toValue: 0, duration: 200, useNativeDriver: true,
                        easing: Easing.out(Easing.quad),
                    }).start(() => {
                        Animated.timing(incorrectContentOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
                    });
                }
            }
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Error al enviar respuesta');
        } finally {
            submittingItems.current.delete(item.id);
        }
    }, [session?.user_id, livesLeft, levelSlug, micro]);

    const handleDismissIncorrect = () => {
        Animated.timing(incorrectPanelAnim, {
            toValue: 300, duration: 180, useNativeDriver: true,
            easing: Easing.in(Easing.quad),
        }).start(() => {
            incorrectPanelAnim.setValue(300);
            incorrectContentOpacity.setValue(0);
            setIncorrectPanel(null);
        });
    };

    // ── Continue to next round ────────────────────────────────────────────────

    const handleContinuar = () => {
        Animated.timing(panelAnim, {
            toValue: 300, duration: 180, useNativeDriver: true,
            easing: Easing.in(Easing.quad),
        }).start(() => {
            panelAnim.setValue(300);
            contentOpacity.setValue(0);
            showResultsTriggeredRef.current = false;
            setShowResults(false);
            const nextRound = roundIndex + 1;
            if (nextRound >= totalRounds) {
                const nq = nextQuestionRef.current;
                if (nq) {
                    nextQuestionRef.current = null;
                    lessonItemIdRef.current = nq.lesson_item_id;
                    setPrompt(nq.prompt);
                    setCategories(nq.categories);
                    const newItems = shuffle(nq.items.map(i => ({ id: i.id, label: i.text, correctCategory: '' })));
                    setAllItems(newItems);
                    setTotalRounds(Math.ceil(newItems.length / ITEMS_PER_ROUND));
                    setRoundIndex(0);
                    setPlacedMap({});
                    binBoundsRef.current = {};
                } else {
                    onShowCongrats(totalEarnedRef.current, finalBalanceRef.current, 'finished', {
                        sessionId: sessionIdRef.current ?? undefined,
                        repasoNeeded: repasoNeededRef.current,
                        repasoWrongCount: repasoWrongCountRef.current,
                    });
                }
            } else {
                setRoundIndex(nextRound);
                binBoundsRef.current = {};
            }
        });
    };

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

    const isLastRound = roundIndex + 1 >= totalRounds;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerBox} />

            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            <BarraProgreso current={classifiedCount} total={totalItems} style={styles.progressBar} />

            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{livesLeft}</Text>
            </View>

            {/* Decorativos */}
            <View style={[styles.glowDot, { right: responsiveWidth(8), top: responsiveHeight(28) }]} pointerEvents="none" />
            <View style={[styles.glowDot, { left: responsiveWidth(6), top: responsiveHeight(45) }]} pointerEvents="none" />
            <View style={[styles.glowDot, { left: responsiveWidth(3), top: responsiveHeight(65) }]} pointerEvents="none" />
            <View style={[styles.glowDot, { right: responsiveWidth(4), top: responsiveHeight(68) }]} pointerEvents="none" />
            <View style={styles.starContainer} pointerEvents="none">
                <StarSparkle size={22} />
            </View>

            {/* Main — sin ScrollView como OrdenaBosque */}
            <View style={styles.mainContent}>
                <Text style={styles.title}>{prompt || 'Clasifica los elementos'}</Text>
                <Text style={styles.subtitle}>Arrastra cada bloque a su categoría</Text>

                {/* Banco de bloques */}
                {unplacedInRound.length > 0 && (
                    <View style={styles.wordBank}>
                        <Text style={styles.wordBankLabel}>ARRASTRA UN BLOQUE</Text>
                        <View style={styles.itemsGrid}>
                            {unplacedInRound.map(item => (
                                <DraggableBlock
                                    key={item.id}
                                    item={item}
                                    disabled={showResults || submittingItems.current.has(item.id)}
                                    onDragStart={handleDragStart}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Bins */}
                <View style={styles.binsArea}>
                    {categories.map(cat => {
                        const placedInCat = roundItems.filter(i => placedMap[i.id] === cat.id);
                        const isOver = overCategory === cat.id;
                        return (
                            <View
                                key={cat.id}
                                ref={ref => { binViewRefs.current[cat.id] = ref; }}
                                onLayout={measureBins}
                                style={[styles.bin, isOver && styles.binActive]}
                            >
                                <Text style={styles.binTitle}>{cat.name}</Text>
                                {placedInCat.length === 0 && (
                                    <Text style={styles.binHint}>SUÉLTALO AQUÍ</Text>
                                )}
                                {placedInCat.length > 0 && (
                                    <View style={styles.chipsGrid}>
                                        {placedInCat.map(i => (
                                            <View key={i.id} style={styles.placedChip}>
                                                <Text style={styles.chipText}>✓ {i.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Panel resultados */}
            {showResults && (
                <Animated.View
                    style={[styles.resultsPanel, styles.resultsPanelPerfect, { transform: [{ translateY: panelAnim }] }]}
                >
                    <View style={styles.resultsIconCircle}>
                        <Text style={styles.resultsIconCorrect}>✓</Text>
                    </View>
                    <Animated.View style={[styles.resultsTextArea, { opacity: contentOpacity }]}>
                        <Text style={styles.resultsTitlePerfect}>¡Perfecto!</Text>
                        <Text style={styles.resultsSubtitle}>
                            {!isLastRound ? `Ronda ${roundIndex + 1} de ${totalRounds}` : '¡Última ronda!'}
                        </Text>
                    </Animated.View>
                    <TouchableOpacity
                        style={[styles.continuarButton, styles.continuarButtonCorrect]}
                        onPress={handleContinuar}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.continuarText}>{isLastRound ? '¡Terminar!' : 'Continuar'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Panel incorrecto inline */}
            {incorrectPanel && (
                <Animated.View
                    style={[styles.resultsPanel, styles.resultsPanelIncorrect, { transform: [{ translateY: incorrectPanelAnim }] }]}
                >
                    <View style={styles.resultsIconCircle}>
                        <Text style={styles.resultsIconIncorrect}>✗</Text>
                    </View>
                    <Animated.View style={[styles.resultsTextArea, { opacity: incorrectContentOpacity }]}>
                        <Text style={styles.resultsTitleIncorrect}>Incorrecto</Text>
                        <Text style={styles.resultsSubtitle}>{incorrectPanel.feedback}</Text>
                    </Animated.View>
                    <TouchableOpacity
                        style={[styles.continuarButton, styles.continuarButtonIncorrect]}
                        onPress={handleDismissIncorrect}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.continuarText}>Continuar</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0C7E8A' },

    headerBox: {
        width: responsiveWidth(110),
        height: responsiveHeight(12),
        backgroundColor: '#0D494F',
        borderRadius: 33,
        alignSelf: 'center',
    },

    backButton: {
        position: 'absolute',
        top: responsiveHeight(4.5),
        left: responsiveWidth(2),
        zIndex: 10000,
        padding: 10,
    },

    progressBar: {
        position: 'absolute',
        top: responsiveHeight(6),
        zIndex: 9999,
        alignSelf: 'center',
    },

    livesContainer: {
        position: 'absolute',
        top: responsiveHeight(6),
        right: responsiveWidth(4),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 10000,
    },

    livesText: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 4,
    },

    glowDot: {
        position: 'absolute',
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#FEE23B',
        opacity: 0.85,
        zIndex: 5,
    },

    starContainer: {
        position: 'absolute',
        right: responsiveWidth(8),
        top: responsiveHeight(32),
        zIndex: 5,
    },

    mainContent: {
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
        paddingTop: responsiveHeight(1),
        paddingBottom: responsiveHeight(2),
    },

    title: {
        color: '#FCFCFC',
        fontSize: moderateScale(22),
        fontFamily: Fonts.Bold,
        textAlign: 'center',
        marginBottom: 2,
        lineHeight: moderateScale(27),
    },

    subtitle: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(13),
        textAlign: 'center',
        marginBottom: responsiveHeight(1),
    },

    wordBank: { marginBottom: responsiveHeight(1) },

    wordBankLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(9),
        letterSpacing: 1.5,
        textAlign: 'center',
        marginBottom: 6,
    },

    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    binsArea: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
        alignContent: 'flex-start',
    },

    bin: {
        width: '47%',
        minHeight: verticalScale(64),
        borderRadius: 20,
        borderWidth: 2.5,
        borderStyle: 'dashed',
        borderColor: '#70F2E0',
        backgroundColor: 'rgba(112, 242, 224, 0.15)',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },

    binActive: {
        backgroundColor: 'rgba(112, 242, 224, 0.40)',
        borderStyle: 'solid',
    },

    binTitle: {
        color: '#005950',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(13),
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 2,
    },

    binHint: {
        color: 'rgba(255,255,255,0.45)',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(8),
        letterSpacing: 1.2,
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    chipsGrid: {
        gap: 4,
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },

    placedChip: {
        backgroundColor: 'rgba(0, 212, 114, 0.18)',
        borderWidth: 1.5,
        borderColor: '#00D472',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 10,
    },

    chipText: {
        color: '#00D472',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(10),
    },

    resultsPanel: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        paddingBottom: verticalScale(28),
        zIndex: 20000,
    },

    resultsPanelPerfect: { backgroundColor: '#0A3D28' },

    resultsIconCircle: {
        width: scale(56), height: scale(56),
        borderRadius: scale(28),
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: scale(12), flexShrink: 0,
    },

    resultsIconCorrect: { color: '#00D472', fontSize: moderateScale(26), fontWeight: '700' },

    resultsTextArea: { flex: 1 },

    resultsTitlePerfect: { color: '#00D472', fontFamily: Fonts.Bold, fontSize: moderateScale(18), marginBottom: 2 },

    resultsSubtitle: { color: 'rgba(255,255,255,0.65)', fontFamily: Fonts.Bold, fontSize: 11 },

    continuarButton: {
        borderRadius: scale(11),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },

    continuarButtonCorrect: {
        backgroundColor: '#00D472',
        shadowColor: '#0A6F43',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },

    continuarText: { color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(14), fontWeight: '600' },

    resultsPanelIncorrect: { backgroundColor: '#3D1010' },
    resultsIconIncorrect: { color: '#FF6060', fontSize: moderateScale(26), fontWeight: '700' },
    resultsTitleIncorrect: { color: '#FF6060', fontFamily: Fonts.Bold, fontSize: moderateScale(18), marginBottom: 2 },
    continuarButtonIncorrect: {
        backgroundColor: '#CC3333',
        shadowColor: '#6F0A0A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },

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
        color: '#fff',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        marginBottom: verticalScale(8),
        textAlign: 'center',
    },
    progressBarBackground: {
        height: verticalScale(8),
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: scale(4),
        overflow: 'hidden',
    },
    progressBarForeground: { height: '100%', backgroundColor: '#FFD700' },
});
