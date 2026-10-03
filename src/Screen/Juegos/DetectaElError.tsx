import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';

import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import BarraProgreso from '../../assets/Images/Nivel_Bellota/barraprogrso';
import Empleado from '../../assets/Images/quizbellota/empleado';
import StarDE from '../../assets/Images/detecta_error/StarDE';
import GlowDotDE from '../../assets/Images/detecta_error/GlowDotDE';
import LeafDE from '../../assets/Images/detecta_error/LeafDE';
import LoadingQuestion from '../../Components/LoadingQuestion';
import { Fonts } from '../../Utils/Fonts';
import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { startDetecta, answerDetecta } from '../../api/game';
import { DEV_USER_ID, USE_DEV_USER } from '../../api/config/env';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';
import { useVideoPlayer, VideoView } from 'expo-video';

// ── Types ─────────────────────────────────────────────────────────────────────

type AfterStatus = 'active' | 'finished' | 'failed';

type McOption = {
    option_id: string;
    text: string;
};

type QuestionState = {
    session_id: string;
    lives_left: number;
    total_items: number;
    lesson_item_id: string;
    position: number;
    prompt: string;
    options: McOption[];
    skipIntroVideo: boolean;
};

type AnswerResult = {
    isCorrect: boolean;
    feedback: string;
    nextState: QuestionState | null;
    earned: number;
    balance: number;
    statusAfter: AfterStatus;
    livesLeft: number;
    repasoNeeded?: boolean;
    repasoWrongCount?: number;
    sessionId?: string;
};

type Props = {
    levelId: string | null;
    onBackToLevel: () => void;
    onNext: () => void;
    initialState: QuestionState | null;
    setInitialState: (s: QuestionState | null) => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus, opts?: { repasoNeeded?: boolean; repasoWrongCount?: number; sessionId?: string }) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckCircleIcon({ color = '#C0FFF4', size = 22 }: { color?: string; size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <Path
                d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6M10 20C4.48 20 0 15.52 0 10C0 4.48 4.48 0 10 0C15.52 0 20 4.48 20 10C20 15.52 15.52 20 10 20M10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18Z"
                fill={color}
            />
        </Svg>
    );
}

function LightbulbIcon({ color = '#A8E6EF', size = 16 }: { color?: string; size?: number }) {
    return (
        <Svg width={size} height={(size * 20) / 15} viewBox="0 0 15 20" fill="none">
            <Path
                d="M7.5 20C6.95 20 6.47917 19.8042 6.0875 19.4125C5.69583 19.0208 5.5 18.55 5.5 18H9.5C9.5 18.55 9.30417 19.0208 8.9125 19.4125C8.52083 19.8042 8.05 20 7.5 20ZM3.5 17V15H11.5V17H3.5ZM3.75 14C2.6 13.3167 1.6875 12.4 1.0125 11.25C0.3375 10.1 0 8.85 0 7.5C0 5.41667 0.729167 3.64583 2.1875 2.1875C3.64583 0.729167 5.41667 0 7.5 0C9.58333 0 11.3542 0.729167 12.8125 2.1875C14.2708 3.64583 15 5.41667 15 7.5C15 8.85 14.6625 10.1 13.9875 11.25C13.3125 12.4 12.4 13.3167 11.25 14H3.75Z"
                fill={color}
            />
        </Svg>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DetectaElError({
    levelId,
    onBackToLevel,
    onNext,
    initialState,
    setInitialState,
    onShowCongrats,
    onShowIncorrect,
}: Props) {
    const { session, initializing } = useContext(AuthContext);
    const { lives, setLives, refreshLives, isReviewMode } = useGame();

    const levelConfig = LEVELS_CONFIG.find(l => l.id === levelId);
    const level = levelConfig?.levelSlug ?? 'bellota';
    const micro = levelConfig?.micro ?? 6;

    const [q, setQ] = useState<QuestionState | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const scaleAnims = useRef([...Array(4)].map(() => new Animated.Value(1))).current;

    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const confirmScale = useRef(new Animated.Value(1)).current;
    const mascotBounce = useRef(new Animated.Value(0)).current;
    const totalEarnedRef = useRef(0);

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

    const markSkipIntroVideo = () => {
        if (q) {
            const updated: QuestionState = { ...q, skipIntroVideo: true };
            setQ(updated);
            setInitialState(updated);
        }
    };

    const handleVideoFinish = () => {
        try { player.pause(); } catch (e) {}
        setShowVideo(false);
        markSkipIntroVideo();
    };

    // Mascot idle bounce
    React.useEffect(() => {
        const bounce = Animated.loop(
            Animated.sequence([
                Animated.timing(mascotBounce, { toValue: -5, duration: 750, useNativeDriver: true }),
                Animated.timing(mascotBounce, { toValue: 0, duration: 750, useNativeDriver: true }),
            ])
        );
        bounce.start();
        return () => bounce.stop();
    }, [mascotBounce]);

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

    // ── Animations ──────────────────────────────────────────────────────────────

    const showFeedbackPanel = () => {
        contentOpacity.setValue(0);
        Animated.timing(panelAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }).start();
    };

    const showResultContent = (isCorrect: boolean) => {
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

    const animateConfirm = (toValue: number) => {
        Animated.spring(confirmScale, { toValue, useNativeDriver: true, friction: 3 }).start();
    };

    // ── API ───────────────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            if (initializing) return;

            if (initialState) {
                setQ(initialState);
                setSelectedOption(null);
                setAnswerResult(null);
                setShowHint(false);
                if (initialState.skipIntroVideo) setShowVideo(false);
                resetPanel();
                setLoading(false);
                return;
            }

            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
            if (!userId) {
                Alert.alert('Sesion requerida', 'Inicia sesion para jugar.');
                setLoading(false);
                onNext();
                return;
            }

            try {
                setLoading(true);
                const res = await startDetecta(level, micro, userId, isReviewMode);
                const state: QuestionState = {
                    session_id: res.session_id,
                    lives_left: res.lives_left,
                    total_items: res.total_items,
                    lesson_item_id: res.question.lesson_item_id,
                    position: res.question.position,
                    prompt: res.question.prompt,
                    options: res.question.options,
                    skipIntroVideo: false,
                };
                setQ(state);
                setInitialState(state);
                setSelectedOption(null);
                setAnswerResult(null);
                setShowHint(false);
                resetPanel();
                const url = res.videos?.[0]?.url ?? null;
                if (url) {
                    setVideoUrl(url);
                    setShowVideo(true);
                } else {
                    setShowVideo(false);
                }
            } catch (err: any) {
                Alert.alert('Error', err?.message ?? 'No se pudo iniciar el juego');
                onBackToLevel();
            } finally {
                setLoading(false);
            }
        })();
    }, [
        initializing,
        initialState,
        level,
        micro,
        session?.user_id,
        levelId,
    ]);

    const handleConfirm = async () => {
        if (!q || !selectedOption || sending || answerResult !== null) return;

        setSending(true);
        showFeedbackPanel();

        try {
            const res = await answerDetecta(level, micro, q.session_id, selectedOption);
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
                        skipIntroVideo: false,
                    }
                    : null;

            const result: AnswerResult = {
                isCorrect: res.is_correct === true,
                feedback,
                nextState,
                earned,
                balance,
                statusAfter,
                livesLeft: newLives,
                repasoNeeded: res.repaso_needed === true,
                repasoWrongCount: typeof res.repaso_wrong_count === 'number' ? res.repaso_wrong_count : 0,
                sessionId: q?.session_id,
            };

            setAnswerResult(result);
            if (!result.isCorrect) {
                setLives(newLives);
                void refreshLives();
            }
            showResultContent(result.isCorrect);
        } catch (err: any) {
            resetPanel();
            Alert.alert('Error', err?.message ?? 'Error al enviar respuesta');
        } finally {
            setSending(false);
        }
    };

    const handleContinuar = () => {
        if (!answerResult) return;
        const { isCorrect, feedback, nextState, earned, balance, statusAfter, livesLeft } = answerResult;

        Animated.timing(panelAnim, {
            toValue: 300,
            duration: 180,
            useNativeDriver: true,
            easing: Easing.in(Easing.quad),
        }).start(() => {
            resetPanel();
            setAnswerResult(null);
            setSelectedOption(null);
            setShowHint(false);

            if (statusAfter === 'active' && nextState) {
                setInitialState(nextState);
            } else {
                // Si falló por vidas (statusAfter === 'failed'), mantenemos el initialState actual 
                // para que pueda reanudar al volver de la tienda.
                if (statusAfter !== 'failed') {
                    setInitialState(null);
                }
                
                if (isCorrect) {
                    onShowCongrats(totalEarnedRef.current, balance, statusAfter, {
                        repasoNeeded: answerResult?.repasoNeeded,
                        repasoWrongCount: answerResult?.repasoWrongCount,
                        sessionId: answerResult?.sessionId,
                    });
                } else {
                    onShowIncorrect(feedback, livesLeft, statusAfter);
                }
            }
        });
    };

    // ── Style helpers ───────────────────────────────────────────────────────────

    const animateButton = (index: number, toValue: number) => {
        Animated.spring(scaleAnims[index], { toValue, useNativeDriver: true, friction: 3 }).start();
    };

    const getOptionStyle = (optionId: string) => {
        if (selectedOption === optionId && answerResult !== null) {
            return answerResult.isCorrect
                ? { backgroundColor: '#00D472', borderColor: '#1A7A45' }
                : { backgroundColor: '#F03010', borderColor: '#8B2010' };
        }
        if (selectedOption === optionId) {
            return { backgroundColor: '#007A85', borderColor: '#FEC20A' };
        }
        return { backgroundColor: '#00646D', borderColor: '#32A0A7' };
    };

    const canConfirm = !!selectedOption && answerResult === null && !sending;

    // ── Render ──────────────────────────────────────────────────────────────────

    if (initializing || loading || !q) {
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

    return (
        <View style={styles.container}>
            {/* Header background */}
            <View style={styles.headerBox} />

            {/* Absolute overlays */}
            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            <BarraProgreso
                current={q.position}
                total={q.total_items}
                style={styles.progressBar}
            />

            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{lives}</Text>
            </View>

            {/* Decorative star */}
            <View style={styles.starContainer} pointerEvents="none">
                <StarDE size={38} rotate={42} />
            </View>

            {/* Glow dots */}
            {[
                { right: responsiveWidth(9), top: responsiveHeight(21) },
                { left: responsiveWidth(5), top: responsiveHeight(37) },
                { right: responsiveWidth(4), top: responsiveHeight(57) },
                { left: responsiveWidth(3), top: responsiveHeight(67) },
                { right: responsiveWidth(7), top: responsiveHeight(75) },
            ].map((pos, i) => (
                <View key={i} style={[styles.glowDot, pos]} pointerEvents="none">
                    <GlowDotDE />
                </View>
            ))}

            {/* Leaf decorations */}
            <View style={styles.leafRight} pointerEvents="none">
                <LeafDE width={52} height={130} rotate={0} />
            </View>
            <View style={styles.leafLeft} pointerEvents="none">
                <LeafDE width={48} height={115} rotate={160} />
            </View>

            {/* Main scrollable content */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Detecta el Error</Text>
                <Text style={styles.subtitle}>{q.prompt}</Text>

                {/* Mascot pequeño */}
                <Animated.View style={[styles.mascotSmall, { transform: [{ translateY: mascotBounce }] }]} pointerEvents="none">
                    <Empleado width={54} height={78} />
                    <View style={styles.mascotLabelSmall}>
                        <Text style={styles.mascotLabelTextSmall}>¿Qué está mal?</Text>
                    </View>
                </Animated.View>

                {/* Opciones como fragmentos de oración */}
                <View style={styles.sentenceBlock}>
                    {q.options.map((option, index) => (
                        <TouchableOpacity
                            key={option.option_id}
                            onPressIn={() => !answerResult && !sending && animateButton(index, 0.97)}
                            onPressOut={() => animateButton(index, 1)}
                            onPress={() => !answerResult && !sending && setSelectedOption(option.option_id)}
                            disabled={!!answerResult || sending}
                            activeOpacity={0.85}
                        >
                            <Animated.View
                                style={[
                                    styles.sentenceChunk,
                                    getOptionStyle(option.option_id),
                                    {
                                        transform: [
                                            { scale: scaleAnims[index] },
                                            { translateX: selectedOption === option.option_id && answerResult && !answerResult.isCorrect ? shakeAnim : 0 },
                                        ],
                                    },
                                ]}
                            >
                                <Text style={styles.sentenceText}>{option.text}</Text>
                            </Animated.View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Hint */}
                <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint(prev => !prev)} activeOpacity={0.7}>
                    <LightbulbIcon color="#A8E6EF" size={16} />
                    <Text style={styles.hintButtonText}>{showHint ? 'Ocultar pista' : 'Necesito una pista'}</Text>
                </TouchableOpacity>
                {showHint && (
                    <View style={styles.hintCard}>
                        <Text style={styles.hintCardText}>Revisa cada fragmento con cuidado y encuentra cuál no coincide con la realidad.</Text>
                    </View>
                )}

                {/* Confirm */}
                <TouchableOpacity
                    onPressIn={() => canConfirm && animateConfirm(0.95)}
                    onPressOut={() => animateConfirm(1)}
                    onPress={handleConfirm}
                    disabled={!canConfirm}
                    activeOpacity={0.85}
                    style={{ marginTop: verticalScale(16) }}
                >
                    <Animated.View style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled, { transform: [{ scale: confirmScale }] }]}>
                        <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>¡Lo encontré!</Text>
                        <CheckCircleIcon color={canConfirm ? '#C0FFF4' : 'rgba(192,255,244,0.35)'} size={22} />
                    </Animated.View>
                </TouchableOpacity>

                <View style={{ height: verticalScale(32) }} />
            </ScrollView>

            {/* Feedback panel */}
            {(sending || answerResult !== null) && (
                <Animated.View
                    style={[
                        styles.feedbackPanel,
                        answerResult?.isCorrect
                            ? styles.feedbackPanelCorrect
                            : answerResult
                            ? styles.feedbackPanelIncorrect
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
                            answerResult.isCorrect ? (
                                <Text style={styles.feedbackTitleCorrect}>¡Perfecto!</Text>
                            ) : (
                                <Text style={styles.feedbackTitleIncorrect}>Respuesta incorrecta</Text>
                            )
                        )}
                        {answerResult?.feedback ? (
                            <Text
                                style={
                                    answerResult.isCorrect
                                        ? styles.feedbackExplanationCorrect
                                        : styles.feedbackExplanationIncorrect
                                }
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
    container: {
        flex: 1,
        backgroundColor: '#0C7E8A',
    },

    headerBox: {
        width: responsiveWidth(110),
        height: responsiveHeight(12),
        backgroundColor: '#0D494F',
        borderRadius: scale(33),
        alignSelf: 'center',
    },

    // ── Absolute overlays ──────────────────────────────────────────────────────

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

    starContainer: {
        position: 'absolute',
        right: responsiveWidth(7),
        top: responsiveHeight(34),
        zIndex: 5,
    },

    glowDot: {
        position: 'absolute',
        zIndex: 5,
    },

    leafRight: {
        position: 'absolute',
        bottom: 0,
        right: responsiveWidth(1),
        zIndex: 1,
    },

    leafLeft: {
        position: 'absolute',
        bottom: 0,
        left: -responsiveWidth(3),
        zIndex: 1,
    },

    // ── Body ───────────────────────────────────────────────────────────────────

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: responsiveWidth(5),
        paddingTop: responsiveHeight(1),
        paddingBottom: verticalScale(16),
    },

    // ── Title / subtitle ───────────────────────────────────────────────────────

    title: {
        color: '#FCFCFC',
        fontSize: moderateScale(28),
        fontFamily: Fonts.Bold,
        textAlign: 'center',
        marginBottom: 4,
    },

    subtitle: {
        color: '#FCFCFC',
        fontSize: moderateScale(14),
        fontFamily: Fonts.Bold,
        textAlign: 'center',
        paddingHorizontal: responsiveWidth(4),
        lineHeight: moderateScale(20),
        opacity: 0.92,
        marginBottom: responsiveHeight(1.5),
    },

    // ── Mascot pequeño ────────────────────────────────────────────────────────

    mascotSmall: {
        alignSelf: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#073E4C',
        borderRadius: scale(20),
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(14),
        marginBottom: responsiveHeight(1.5),
        gap: scale(10),
    },

    mascotLabelSmall: {
        backgroundColor: '#00897B',
        borderRadius: 9999,
        paddingVertical: verticalScale(5),
        paddingHorizontal: scale(12),
    },

    mascotLabelTextSmall: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(13),
    },

    // ── Sentence block ────────────────────────────────────────────────────────

    sentenceBlock: {
        gap: verticalScale(8),
        marginBottom: responsiveHeight(1),
    },

    sentenceChunk: {
        borderRadius: scale(16),
        borderWidth: 3,
        paddingVertical: verticalScale(12),
        paddingHorizontal: responsiveWidth(4),
        alignItems: 'center',
    },

    sentenceText: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        textAlign: 'center',
        lineHeight: moderateScale(22),
    },

    // ── Hint ───────────────────────────────────────────────────────────────────

    hintButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        paddingVertical: verticalScale(6),
    },

    hintButtonText: {
        color: '#A8E6EF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(14),
    },

    hintCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: scale(14),
        padding: scale(11),
        borderWidth: 1,
        borderColor: 'rgba(168, 230, 239, 0.3)',
    },

    hintCardText: {
        color: '#A8E6EF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(13),
        textAlign: 'center',
        lineHeight: moderateScale(20),
    },

    // ── Confirm button ─────────────────────────────────────────────────────────

    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(10),
        marginHorizontal: responsiveWidth(5),
        marginTop: responsiveHeight(1.8),
        borderRadius: 9999,
        paddingVertical: verticalScale(18),
        backgroundColor: '#00897B',
        shadowColor: '#005F55',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
        zIndex: 10,
    },

    confirmButtonDisabled: {
        backgroundColor: 'rgba(0, 137, 123, 0.30)',
        shadowColor: 'transparent',
        elevation: 0,
    },

    confirmText: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(20),
        fontWeight: '900',
    },

    confirmTextDisabled: {
        opacity: 0.45,
    },

    // ── Feedback panel ─────────────────────────────────────────────────────────

    feedbackPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        paddingBottom: verticalScale(28),
        zIndex: 20000,
    },

    feedbackPanelLoading: {
        backgroundColor: '#0D5961',
    },

    feedbackPanelCorrect: {
        backgroundColor: '#0A3D28',
    },

    feedbackPanelIncorrect: {
        backgroundColor: '#3E1010',
    },

    feedbackIconCircle: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
        flexShrink: 0,
    },

    feedbackIconCorrect: {
        color: '#00D472',
        fontSize: moderateScale(28),
        fontWeight: '700',
    },

    feedbackIconIncorrect: {
        color: '#F03010',
        fontSize: moderateScale(28),
        fontWeight: '700',
    },

    feedbackTextArea: {
        flex: 1,
    },

    feedbackTitleCorrect: {
        color: '#00D472',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(18),
        marginBottom: 4,
    },

    feedbackTitleIncorrect: {
        color: '#F05050',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        marginBottom: 4,
    },

    feedbackExplanationCorrect: {
        color: '#00D472',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(11),
        opacity: 0.85,
    },

    feedbackExplanationIncorrect: {
        color: '#F05050',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(11),
        opacity: 0.85,
    },

    continuarButton: {
        borderRadius: scale(11),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    continuarButtonLoading: {
        backgroundColor: '#1C5F68',
        shadowColor: '#0A3B42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },

    continuarButtonCorrect: {
        backgroundColor: '#00D472',
        shadowColor: '#0A6F43',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },

    continuarButtonIncorrect: {
        backgroundColor: '#D04747',
        shadowColor: '#853434',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },

    continuarText: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(14),
        fontWeight: '600',
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
