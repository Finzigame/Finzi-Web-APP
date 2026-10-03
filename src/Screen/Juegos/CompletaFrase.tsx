import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import Ramagrande from '../../assets/Images/quizbellota/ramagrande';
import BarraProgreso from '../../assets/Images/Nivel_Bellota/barraprogrso';
import PersonajeCF from '../../assets/Images/completa_frase/PersonajeCF';
import StarCF from '../../assets/Images/completa_frase/StarCF';
import GlowDotCF from '../../assets/Images/completa_frase/GlowDotCF';
import LoadingQuestion from '../../Components/LoadingQuestion';
import { Fonts } from '../../Utils/Fonts';
import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { startOm, answerOm } from '../../api/game';
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompletaFrase({
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
    const micro = levelConfig?.micro ?? 5;

    const [q, setQ] = useState<QuestionState | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
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
            (async () => {
                try {
                    await player.replaceAsync({ uri: videoUrl });
                    player.play();
                } catch (e) {}
            })();
        }
    }, [videoUrl]);

    useEffect(() => {
        if (!showVideo) {
            try { if (player && typeof player.pause === 'function') player.pause(); } catch (e) {}
        }
    }, [showVideo, player]);
    const wordScale = useRef(new Animated.Value(0.3)).current;
    const wordOpacity = useRef(new Animated.Value(0)).current;

    const scaleAnims = useRef([
        new Animated.Value(1),
        new Animated.Value(1),
        new Animated.Value(1),
        new Animated.Value(1),
    ]).current;

    // ── Animation helpers ──────────────────────────────────────────────────────

    const animateButton = (index: number, toValue: number) => {
        Animated.spring(scaleAnims[index], {
            toValue,
            useNativeDriver: true,
            friction: 3,
        }).start();
    };

    const animateWordIn = () => {
        wordScale.setValue(0.3);
        wordOpacity.setValue(0);
        Animated.parallel([
            Animated.spring(wordScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
            Animated.timing(wordOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
    };

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
                Animated.timing(shakeAnim, { toValue: 9, duration: 55, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 5, duration: 55, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
            ]).start();
        }
    };

    const resetPanel = () => {
        panelAnim.setValue(300);
        contentOpacity.setValue(0);
        shakeAnim.setValue(0);
        wordScale.setValue(0.3);
        wordOpacity.setValue(0);
    };

    const parsePrompt = (prompt: string): { before: string; after: string } | null => {
        const m = /_{2,}|\[.*?\]/.exec(prompt);
        if (!m) return null;
        return {
            before: prompt.slice(0, m.index).trim(),
            after: prompt.slice(m.index + m[0].length).trim(),
        };
    };

    // ── API ───────────────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            if (initializing) return;

            if (initialState) {
                setQ(initialState);
                setSelectedOption(null);
                setAnswerResult(null);
                if (initialState.skipIntroVideo) {
                    setShowVideo(false);
                }
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
                const res = await startOm(level, micro, userId, isReviewMode);
                const state: QuestionState | null = {
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

    const handlePress = async (option: McOption) => {
        if (!q || sending || answerResult !== null) return;

        setSelectedOption(option.option_id);
        setSending(true);
        animateWordIn();
        showFeedbackPanel();

        try {
            const res = await answerOm(level, micro, q.session_id, q.lesson_item_id, option.option_id);
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
            showResultContent(result.isCorrect);
        } catch (err: any) {
            resetPanel();
            setSelectedOption(null);
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

    // ── Style helpers ──────────────────────────────────────────────────────────

    const getOptionStyle = (optionId: string) => {
        if (selectedOption === optionId && answerResult !== null) {
            return answerResult.isCorrect
                ? { backgroundColor: '#00D472', borderColor: '#1A7A45' }
                : { backgroundColor: '#F03010', borderColor: '#8B2010' };
        }
        return { backgroundColor: '#00646D', borderColor: '#32A0A7' };
    };

    const getBlankBorderColor = () => {
        if (!answerResult) return '#00675D';
        return answerResult.isCorrect ? '#00D472' : '#F03010';
    };

    const getBlankTextColor = () => {
        if (!answerResult) return '#183336';
        return answerResult.isCorrect ? '#007A40' : '#BF2000';
    };

    // ── Render ─────────────────────────────────────────────────────────────────

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

    const parts = parsePrompt(q.prompt);
    const selectedText = q.options.find(o => o.option_id === selectedOption)?.text;

    return (
        <View style={styles.container}>
            {/* Header box */}
            <View style={styles.headerBox} />

            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            {/* Progress bar */}
            <BarraProgreso
                current={q.position}
                total={q.total_items}
                style={styles.progressBar}
            />

            {/* Lives */}
            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{q.lives_left}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Completa la frase</Text>

            {/* Decorative glow dots */}
            <View style={[styles.glowDot, { right: responsiveWidth(8), top: responsiveHeight(22) }]} pointerEvents="none">
                <GlowDotCF />
            </View>
            <View style={[styles.glowDot, { left: responsiveWidth(6), top: responsiveHeight(38) }]} pointerEvents="none">
                <GlowDotCF />
            </View>
            <View style={[styles.glowDot, { right: responsiveWidth(5), top: responsiveHeight(52) }]} pointerEvents="none">
                <GlowDotCF />
            </View>
            <View style={[styles.glowDot, { left: responsiveWidth(3), top: responsiveHeight(64) }]} pointerEvents="none">
                <GlowDotCF />
            </View>

            {/* Star decoration */}
            <View style={styles.starTopRight} pointerEvents="none">
                <StarCF size={28} rotate={41} />
            </View>

            {/* Businessman character */}
            <View style={styles.personajeContainer} pointerEvents="none">
                <PersonajeCF width={90} height={135} />
            </View>

            {/* Sentence card */}
            <Animated.View
                style={[
                    styles.sentenceCard,
                    { transform: [{ translateX: selectedOption && answerResult && !answerResult.isCorrect ? shakeAnim : 0 }] },
                ]}
            >
                {parts ? (
                    <>
                        <Text style={styles.sentenceLine1}>{parts.before}</Text>
                        <View style={styles.blankRow}>
                            <View style={[styles.blank, { borderBottomColor: getBlankBorderColor() }]}>
                                {selectedText ? (
                                    <Animated.Text
                                        style={[
                                            styles.blankFilledText,
                                            { color: getBlankTextColor() },
                                            { opacity: wordOpacity, transform: [{ scale: wordScale }] },
                                        ]}
                                    >
                                        {selectedText}
                                    </Animated.Text>
                                ) : (
                                    <Text style={styles.blankDashes}>{'________'}</Text>
                                )}
                            </View>
                        </View>
                        <Text style={styles.sentenceRest}>{parts.after}</Text>
                    </>
                ) : (
                    <Text style={styles.sentenceLine1}>{q.prompt}</Text>
                )}
            </Animated.View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {q.options.map((option, index) => (
                    <TouchableOpacity
                        key={option.option_id}
                        onPressIn={() => animateButton(index, 0.96)}
                        onPressOut={() => animateButton(index, 1)}
                        onPress={() => handlePress(option)}
                        disabled={sending || answerResult !== null}
                        activeOpacity={0.85}
                    >
                        <Animated.View
                            style={[
                                styles.optionButton,
                                getOptionStyle(option.option_id),
                                {
                                    transform: [
                                        { scale: scaleAnims[index] },
                                        {
                                            translateX:
                                                selectedOption === option.option_id && answerResult && !answerResult.isCorrect
                                                    ? shakeAnim
                                                    : 0,
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.optionText} numberOfLines={2}>
                                {option.text.toUpperCase()}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Decorative branches */}
            <Ramagrande style={styles.ramagrande} />

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

    // ── Header ─────────────────────────────────────────────────────────────────

    headerBox: {
        width: responsiveWidth(110),
        height: responsiveHeight(12),
        backgroundColor: '#0D494F',
        borderRadius: scale(33),
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

    title: {
        position: 'absolute',
        top: responsiveHeight(13.5),
        alignSelf: 'center',
        color: '#FCFCFC',
        fontSize: moderateScale(30),
        fontFamily: Fonts.Bold,
        zIndex: 10,
        textAlign: 'center',
    },

    // ── Decorative ─────────────────────────────────────────────────────────────

    glowDot: {
        position: 'absolute',
        zIndex: 5,
    },

    starTopRight: {
        position: 'absolute',
        right: responsiveWidth(6),
        top: responsiveHeight(33),
        zIndex: 5,
    },

    ramagrande: {
        position: 'absolute',
        bottom: responsiveHeight(-1),
        left: responsiveWidth(15) - 100,
        width: 200,
        height: 160,
        zIndex: 1,
    },

    // ── Personaje ──────────────────────────────────────────────────────────────

    personajeContainer: {
        position: 'absolute',
        top: responsiveHeight(21),
        alignSelf: 'center',
        left: responsiveWidth(50) - 45,
        zIndex: 8,
    },

    // ── Sentence card ──────────────────────────────────────────────────────────

    sentenceCard: {
        width: responsiveWidth(82),
        backgroundColor: '#C9EFF2',
        borderRadius: scale(28),
        alignSelf: 'center',
        marginTop: responsiveHeight(27),
        paddingVertical: verticalScale(20),
        paddingHorizontal: scale(20),
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },

    sentenceLine1: {
        color: '#183336',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(24),
        textAlign: 'center',
        marginBottom: verticalScale(2),
    },

    blankRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: verticalScale(4),
        flexWrap: 'wrap',
        justifyContent: 'center',
    },

    blank: {
        minWidth: scale(140),
        borderBottomWidth: 4,
        borderBottomColor: '#00675D',
        borderStyle: 'dashed',
        minHeight: verticalScale(36),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(8),
        marginRight: scale(4),
    },

    blankFilledText: {
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(20),
        textAlign: 'center',
        color: '#183336',
    },

    blankDashes: {
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(20),
        color: '#4A9BA0',
        letterSpacing: 2,
        textAlign: 'center',
    },

    connectorText: {
        color: '#183336',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(24),
        alignSelf: 'flex-end',
        paddingBottom: 4,
    },

    sentenceRest: {
        color: '#183336',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(22),
        textAlign: 'center',
        lineHeight: moderateScale(30),
    },

    // ── Options ────────────────────────────────────────────────────────────────

    optionsContainer: {
        marginTop: responsiveHeight(3),
        paddingHorizontal: responsiveWidth(5.5),
        gap: responsiveHeight(1.5),
        zIndex: 10,
    },

    optionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(29),
        borderWidth: 4,
        minHeight: verticalScale(59),
        paddingVertical: responsiveHeight(1.2),
        paddingHorizontal: responsiveWidth(4),
    },

    optionText: {
        color: '#FFFFFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(18),
        textAlign: 'center',
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
        marginBottom: verticalScale(4),
    },

    feedbackTitleIncorrect: {
        color: '#F05050',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        marginBottom: verticalScale(4),
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
