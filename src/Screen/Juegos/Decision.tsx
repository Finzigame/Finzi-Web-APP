import React, { useContext, useRef, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LoadingQuestion from '../../Components/LoadingQuestion';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import BarraProgreso from '../../assets/Images/Nivel_Bellota/barraprogrso';

import GlowDotDecision from '../../assets/Images/decision/GlowDotDecision';
import StarDecision from '../../assets/Images/decision/StarDecision';
import ForestDecoDecision from '../../assets/Images/decision/ForestDecoDecision';
import PersonajeDecision from '../../assets/Images/decision/PersonajeDecision';
import ChevronRightDecision from '../../assets/Images/decision/ChevronRightDecision';
import CoinPlantDecision from '../../assets/Images/decision/CoinPlantDecision';
import TrendUpDecision from '../../assets/Images/decision/TrendUpDecision';
import PlaneDecision from '../../assets/Images/decision/PlaneDecision';
import ShoppingDecision from '../../assets/Images/decision/ShoppingDecision';
import PersonDecision from '../../assets/Images/decision/PersonDecision';
import PiggyDecision from '../../assets/Images/decision/PiggyDecision';

import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { startDecision, answerDecision } from '../../api/game';
import { USE_DEV_USER, DEV_USER_ID } from '../../api/config/env';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';
import { Fonts } from '../../Utils/Fonts';
import { useVideoPlayer, VideoView } from 'expo-video';

// ── Types ─────────────────────────────────────────────────────────────────────

type AfterStatus = 'active' | 'finished' | 'failed';

type ApiOption = {
    option_id: string;
    text: string;
    icon: string;
    position: number;
    key: string;
};

type QuestionState = {
    session_id: string;
    lives_left: number;
    total_items: number;
    lesson_item_id: string;
    position: number;
    prompt: string;
    options: ApiOption[];
};

type AnswerResult = {
    isCorrect: boolean;
    feedback: string;
    nextState: QuestionState | null;
    earned: number;
    balance: number;
    statusAfter: AfterStatus;
    repasoNeeded?: boolean;
    repasoWrongCount?: number;
    sessionId?: string;
};

type Props = {
    levelId: string | null;
    onBackToLevel: () => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus, opts?: { repasoNeeded?: boolean; repasoWrongCount?: number; sessionId?: string }) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
};

// ── Button Icon ───────────────────────────────────────────────────────────────

function ButtonIcon({ icon }: { icon: string }) {
    switch (icon) {
        case 'trend':    return <TrendUpDecision size={36} />;
        case 'plane':    return <PlaneDecision size={36} />;
        case 'shopping': return <ShoppingDecision size={36} />;
        case 'person':   return <PersonDecision size={36} />;
        case 'piggy':    return <PiggyDecision size={36} />;
        default:         return <TrendUpDecision size={36} />;
    }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Decision({ levelId, onBackToLevel, onShowCongrats, onShowIncorrect }: Props) {
    const { session, initializing } = useContext(AuthContext);
    const { isReviewMode } = useGame();

    const levelConfig = LEVELS_CONFIG.find(l => l.id === levelId);
    const level = levelConfig?.levelSlug ?? 'bellota';
    const micro = levelConfig?.micro ?? 7;

    const [q, setQ] = useState<QuestionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const isSubmitting = useRef(false);

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
        if (videoUrl) { player.replace({ uri: videoUrl }); player.play(); }
    }, [videoUrl]);

    useEffect(() => {
        if (!showVideo) {
            try { if (player && typeof player.pause === 'function') player.pause(); } catch (e) {}
        }
    }, [showVideo, player]);

    const totalEarnedRef = useRef(0);

    // Animations
    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const cardEntryAnim = useRef(new Animated.Value(0)).current;
    const scaleAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;

    // Staggered option entry anims
    const optionY0 = useRef(new Animated.Value(50)).current;
    const optionY1 = useRef(new Animated.Value(50)).current;
    const optionY2 = useRef(new Animated.Value(50)).current;
    const optionY3 = useRef(new Animated.Value(50)).current;
    const optionOp0 = useRef(new Animated.Value(0)).current;
    const optionOp1 = useRef(new Animated.Value(0)).current;
    const optionOp2 = useRef(new Animated.Value(0)).current;
    const optionOp3 = useRef(new Animated.Value(0)).current;
    const optionEntryAnims = [
        { y: optionY0, op: optionOp0 },
        { y: optionY1, op: optionOp1 },
        { y: optionY2, op: optionOp2 },
        { y: optionY3, op: optionOp3 },
    ];

    // ── Load question ──────────────────────────────────────────────────────────

    const runEntryAnimations = () => {
        cardEntryAnim.setValue(0);
        Animated.spring(cardEntryAnim, {
            toValue: 1, useNativeDriver: true, tension: 80, friction: 8,
        }).start();

        optionEntryAnims.forEach(({ y, op }) => { y.setValue(50); op.setValue(0); });
        optionEntryAnims.forEach(({ y, op }, i) => {
            Animated.parallel([
                Animated.timing(y, {
                    toValue: 0, duration: 320, delay: 100 + i * 75,
                    useNativeDriver: true, easing: Easing.out(Easing.back(1.4)),
                }),
                Animated.timing(op, {
                    toValue: 1, duration: 260, delay: 100 + i * 75, useNativeDriver: true,
                }),
            ]).start();
        });
    };

    useEffect(() => {
        (async () => {
            if (initializing) return;

            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
            if (!userId) {
                Alert.alert('Sesion requerida', 'Inicia sesion para jugar.');
                setLoading(false);
                onBackToLevel();
                return;
            }

            try {
                setLoading(true);
                const res = await startDecision(level, micro, userId, isReviewMode);
                const state: QuestionState = {
                    session_id: res.session_id,
                    lives_left: res.lives_left,
                    total_items: res.total_items,
                    lesson_item_id: res.question.lesson_item_id,
                    position: res.question.position,
                    prompt: res.question.prompt,
                    options: res.question.options,
                };
                setQ(state);
                setSelectedOptionId(null);
                setAnswerResult(null);
                resetPanel();
                const url = res.videos?.[0]?.url ?? null;
                if (url) { setVideoUrl(url); setShowVideo(true); } else { setShowVideo(false); }
            } catch (err: any) {
                Alert.alert('Error', err?.message ?? 'No se pudo iniciar el juego');
                onBackToLevel();
            } finally {
                setLoading(false);
            }
        })();
    }, [initializing]);

    useEffect(() => {
        if (q) runEntryAnimations();
    }, [q?.lesson_item_id]);

    // ── Animation helpers ──────────────────────────────────────────────────────

    const animateBtn = (index: number, toValue: number) => {
        Animated.spring(scaleAnims[index], { toValue, useNativeDriver: true, friction: 3 }).start();
    };

    const showPanel = () => {
        contentOpacity.setValue(0);
        Animated.timing(panelAnim, {
            toValue: 0, duration: 220, useNativeDriver: true,
            easing: Easing.out(Easing.back(1.2)),
        }).start();
    };

    const showContent = (isCorrect: boolean) => {
        Animated.timing(contentOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
        if (!isCorrect) {
            shakeAnim.setValue(0);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
            ]).start();
        }
    };

    const resetPanel = () => {
        panelAnim.setValue(300);
        contentOpacity.setValue(0);
        shakeAnim.setValue(0);
    };

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleSelect = async (option: ApiOption) => {
        if (!q || sending || answerResult !== null || isSubmitting.current) return;

        isSubmitting.current = true;
        setSelectedOptionId(option.option_id);
        setSending(true);
        showPanel();

        try {
            const res = await answerDecision(level, micro, q.session_id, q.lesson_item_id, option.option_id);

            const statusAfter: AfterStatus = (res.status as AfterStatus) ?? 'active';
            const newLives = typeof res.lives_left === 'number' ? res.lives_left : q.lives_left;
            const earned = typeof res.bellotas_earned === 'number' ? res.bellotas_earned : 0;
            const balance = typeof res.bellotas_balance === 'number' ? res.bellotas_balance : 0;
            totalEarnedRef.current += earned;
            const feedback = typeof res.feedback === 'string' ? res.feedback : '';

            const nextState: QuestionState | null =
                statusAfter === 'active' && res.next_question
                    ? {
                        session_id: q.session_id,
                        lives_left: newLives,
                        total_items: q.total_items,
                        lesson_item_id: res.next_question.lesson_item_id,
                        position: res.next_question.position,
                        prompt: res.next_question.prompt,
                        options: res.next_question.options,
                    }
                    : null;

            const result: AnswerResult = {
                isCorrect: res.is_correct === true,
                feedback,
                nextState,
                earned,
                balance,
                statusAfter,
                repasoNeeded: res.repaso_needed === true,
                repasoWrongCount: typeof res.repaso_wrong_count === 'number' ? res.repaso_wrong_count : 0,
                sessionId: q?.session_id,
            };

            setAnswerResult(result);
            showContent(result.isCorrect);
        } catch (err: any) {
            isSubmitting.current = false;
            resetPanel();
            setSelectedOptionId(null);
            Alert.alert('Error', err?.message ?? 'Error al enviar respuesta');
        } finally {
            setSending(false);
        }
    };

    const handleContinuar = () => {
        if (!answerResult) return;

        Animated.timing(panelAnim, {
            toValue: 300, duration: 180, useNativeDriver: true,
            easing: Easing.in(Easing.quad),
        }).start(() => {
            const { isCorrect, feedback, nextState, earned, balance, statusAfter } = answerResult;
            isSubmitting.current = false;
            resetPanel();
            setAnswerResult(null);
            setSelectedOptionId(null);

            if (statusAfter === 'active' && nextState) {
                setQ(nextState);
            } else {
                if (isCorrect || statusAfter === 'finished') {
                    onShowCongrats(totalEarnedRef.current, balance, statusAfter, {
                        repasoNeeded: answerResult?.repasoNeeded,
                        repasoWrongCount: answerResult?.repasoWrongCount,
                        sessionId: answerResult?.sessionId,
                    });
                } else {
                    onShowIncorrect(feedback, nextState?.lives_left ?? 0, statusAfter);
                }
            }
        });
    };

    // ── Option style ────────────────────────────────────────────────────────────

    const getOptionStyle = (optionId: string) => {
        if (!answerResult || selectedOptionId !== optionId) return {};
        return answerResult.isCorrect
            ? { backgroundColor: '#00A355', shadowColor: '#00D472' }
            : { backgroundColor: '#B02010', shadowColor: '#F03010' };
    };

    // ── Loading ─────────────────────────────────────────────────────────────────

    if (loading || !q) {
        return <LoadingQuestion />;
    }

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

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            <View style={styles.headerBox} />

            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            <BarraProgreso current={q.position - 1} total={q.total_items} style={styles.progressBar} />

            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{q.lives_left}</Text>
            </View>

            <View style={[styles.glowDot, { right: responsiveWidth(8), top: responsiveHeight(17) }]} pointerEvents="none">
                <GlowDotDecision />
            </View>
            <View style={[styles.glowDot, { left: responsiveWidth(4), top: responsiveHeight(38) }]} pointerEvents="none">
                <GlowDotDecision />
            </View>
            <View style={[styles.glowDot, { right: responsiveWidth(4), top: responsiveHeight(52) }]} pointerEvents="none">
                <GlowDotDecision />
            </View>
            <View style={[styles.glowDot, { left: responsiveWidth(2), top: responsiveHeight(66) }]} pointerEvents="none">
                <GlowDotDecision />
            </View>
            <View style={styles.forestDeco} pointerEvents="none">
                <ForestDecoDecision />
            </View>
            <View style={styles.coinPlant} pointerEvents="none">
                <CoinPlantDecision />
            </View>
            <View style={styles.starTopRight} pointerEvents="none">
                <StarDecision size={32} rotate={42} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>¿Que harias tu?</Text>
                <Text style={styles.subtitle}>Elige la mejor decision financiera</Text>

                <Animated.View
                    style={[
                        styles.characterSection,
                        answerResult && !answerResult.isCorrect
                            ? { transform: [{ translateX: shakeAnim }] }
                            : {
                                opacity: cardEntryAnim,
                                transform: [{
                                    scale: cardEntryAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.92, 1],
                                    }),
                                }],
                            },
                    ]}
                >
                    <PersonajeDecision width={120} height={120} style={styles.avatar} />
                    <View style={styles.speechBubble}>
                        <View style={styles.speechArrow} />
                        <Text style={styles.scenarioText}>{q.prompt}</Text>
                    </View>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {q.options.map((option, index) => {
                        const { y, op } = optionEntryAnims[index] ?? { y: optionY0, op: optionOp0 };
                        return (
                            <Animated.View
                                key={option.option_id}
                                style={{ opacity: op, transform: [{ translateY: y }] }}
                            >
                                <TouchableOpacity
                                    style={[styles.optionButton, getOptionStyle(option.option_id)]}
                                    onPressIn={() => animateBtn(index, 0.96)}
                                    onPressOut={() => animateBtn(index, 1)}
                                    onPress={() => handleSelect(option)}
                                    disabled={answerResult !== null || sending}
                                    activeOpacity={0.9}
                                >
                                    <Animated.View
                                        style={[
                                            styles.optionInner,
                                            { transform: [{ scale: scaleAnims[index] ?? new Animated.Value(1) }] },
                                        ]}
                                    >
                                        <View style={styles.iconWrap}>
                                            <ButtonIcon icon={option.icon} />
                                        </View>
                                        <Text style={styles.optionText} numberOfLines={2}>
                                            {option.text}
                                        </Text>
                                        <ChevronRightDecision />
                                    </Animated.View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            {(sending || answerResult !== null) && (
                <Animated.View
                    style={[
                        styles.feedbackPanel,
                        answerResult
                            ? (answerResult.isCorrect ? styles.feedbackPanelCorrect : styles.feedbackPanelIncorrect)
                            : styles.feedbackPanelLoading,
                        { transform: [{ translateY: panelAnim }] },
                    ]}
                >
                    <View style={styles.feedbackIconCircle}>
                        {answerResult === null ? (
                            <ActivityIndicator size="small" color="#7AABB0" />
                        ) : answerResult.isCorrect ? (
                            <Text style={styles.feedbackIconCorrect}>✓</Text>
                        ) : (
                            <Text style={styles.feedbackIconIncorrect}>✕</Text>
                        )}
                    </View>

                    <Animated.View style={[styles.feedbackTextArea, { opacity: contentOpacity }]}>
                        {answerResult !== null && (
                            <Text style={answerResult.isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect}>
                                {answerResult.isCorrect ? '¡Perfecto!' : 'Respuesta incorrecta'}
                            </Text>
                        )}
                        {answerResult?.feedback ? (
                            <Text
                                style={answerResult.isCorrect ? styles.feedbackExplanationCorrect : styles.feedbackExplanationIncorrect}
                                numberOfLines={3}
                            >
                                {answerResult.feedback}
                            </Text>
                        ) : null}
                    </Animated.View>

                    <TouchableOpacity
                        style={[
                            styles.continuarButton,
                            answerResult === null
                                ? styles.continuarButtonLoading
                                : answerResult.isCorrect
                                ? styles.continuarButtonCorrect
                                : styles.continuarButtonIncorrect,
                        ]}
                        onPress={handleContinuar}
                        disabled={answerResult === null}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.continuarText, answerResult === null && { opacity: 0.4 }]}>
                            Continuar
                        </Text>
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
        width: responsiveWidth(110), height: responsiveHeight(12),
        backgroundColor: '#0D494F', borderRadius: 33, alignSelf: 'center',
    },

    backButton: {
        position: 'absolute', top: responsiveHeight(4.5), left: responsiveWidth(2),
        zIndex: 10000, padding: 10,
    },

    progressBar: { position: 'absolute', top: responsiveHeight(6), zIndex: 9999, alignSelf: 'center' },

    livesContainer: {
        position: 'absolute', top: responsiveHeight(6), right: responsiveWidth(4),
        flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 10000,
    },

    livesText: {
        color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(16),
        textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 4,
    },

    glowDot: { position: 'absolute', zIndex: 5 },

    forestDeco: {
        position: 'absolute', right: responsiveWidth(2), top: responsiveHeight(17), zIndex: 2, opacity: 0.8,
    },

    coinPlant: {
        position: 'absolute', right: responsiveWidth(4), bottom: responsiveHeight(10), zIndex: 2,
    },

    starTopRight: {
        position: 'absolute', right: responsiveWidth(8), top: responsiveHeight(12), zIndex: 6,
    },

    scroll: { flex: 1 },

    scrollContent: {
        paddingHorizontal: responsiveWidth(5), paddingTop: responsiveHeight(1), paddingBottom: responsiveHeight(14),
    },

    title: { color: '#FCFCFC', fontFamily: Fonts.Bold, fontSize: moderateScale(32), textAlign: 'center', marginBottom: 4 },

    subtitle: {
        color: '#C0FFF4', fontFamily: Fonts.Bold, fontSize: moderateScale(16), textAlign: 'center',
        marginBottom: responsiveHeight(2), opacity: 0.9,
    },

    characterSection: { alignItems: 'center', marginBottom: responsiveHeight(2.5) },
    avatar: { marginBottom: 0, zIndex: 5 },

    speechBubble: {
        width: '100%', backgroundColor: '#D6F7FB', borderRadius: 32,
        borderWidth: scale(3), borderColor: '#184C4F', paddingVertical: verticalScale(20), paddingHorizontal: scale(24),
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05, shadowRadius: 0, elevation: 4,
    },

    speechArrow: {
        position: 'absolute', top: -scale(12), width: scale(24), height: scale(24), backgroundColor: '#D6F7FB',
        transform: [{ rotate: '45deg' }], borderTopWidth: 3, borderLeftWidth: 3,
        borderColor: '#184C4F', zIndex: 1,
    },

    scenarioText: { color: '#183336', fontFamily: Fonts.Bold, fontSize: moderateScale(20), textAlign: 'center', lineHeight: moderateScale(28) },

    optionsContainer: { gap: responsiveHeight(1.5) },

    optionButton: {
        borderRadius: scale(9999), backgroundColor: '#32A0A7', shadowColor: '#005A51',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
        paddingVertical: verticalScale(14), paddingHorizontal: 20,
    },

    optionInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: { flexShrink: 0 },

    optionText: { flex: 1, color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(17), textAlign: 'center' },

    feedbackPanel: {
        position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: scale(16), paddingVertical: verticalScale(14), paddingBottom: verticalScale(28), zIndex: 20000,
    },

    feedbackPanelCorrect: { backgroundColor: '#0A3D28' },
    feedbackPanelIncorrect: { backgroundColor: '#3E1010' },
    feedbackPanelLoading: { backgroundColor: '#0D5961' },

    feedbackIconCircle: {
        width: scale(56), height: scale(56), borderRadius: scale(28), backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center', justifyContent: 'center', marginRight: scale(12), flexShrink: 0,
    },

    feedbackIconCorrect: { color: '#00D472', fontSize: moderateScale(28), fontWeight: '700' },
    feedbackIconIncorrect: { color: '#F03010', fontSize: moderateScale(28), fontWeight: '700' },

    feedbackTextArea: { flex: 1 },

    feedbackTitleCorrect: { color: '#00D472', fontFamily: Fonts.Bold, fontSize: moderateScale(18), marginBottom: 4 },
    feedbackTitleIncorrect: { color: '#F05050', fontFamily: Fonts.Bold, fontSize: moderateScale(16), marginBottom: 4 },

    feedbackExplanationCorrect: { color: '#00D472', fontFamily: Fonts.Bold, fontSize: moderateScale(11), opacity: 0.85 },
    feedbackExplanationIncorrect: { color: '#F05050', fontFamily: Fonts.Bold, fontSize: moderateScale(11), opacity: 0.85 },

    continuarButton: {
        borderRadius: scale(11), paddingVertical: verticalScale(10), paddingHorizontal: scale(16),
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },

    continuarButtonLoading: {
        backgroundColor: '#1C5F68', shadowColor: '#0A3B42',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },

    continuarButtonCorrect: {
        backgroundColor: '#00D472', shadowColor: '#0A6F43',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },

    continuarButtonIncorrect: {
        backgroundColor: '#D04747', shadowColor: '#853434',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },

    continuarText: { color: '#FFFFFF', fontFamily: Fonts.Bold, fontSize: moderateScale(14), fontWeight: '600' },

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
