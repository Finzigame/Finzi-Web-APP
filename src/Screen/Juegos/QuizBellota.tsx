import React, { useContext, useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Alert,
    ActivityIndicator,
    Animated,
    Easing,
} from "react-native";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';
import SoundManager from "../../Utils/SoundManager";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

import Estrellita from "../../assets/Images/Nivel_Bellota/Estrellas";
import LoadingQuestion from "../../Components/LoadingQuestion";
import Puntitos from "../../Components/NivelBellota/Puntitos";
import BarraProgreso from "../../assets/Images/Nivel_Bellota/barraprogrso";
import Verdadero from "../../assets/Images/quizbellota/verdadero";
import Falso from "../../assets/Images/quizbellota/falso";
import Ramagrande from "../../assets/Images/quizbellota/ramagrande";
import Empleado from "../../assets/Images/quizbellota/empleado";
import Arrow from "../../assets/Images/quizbellota/arrow";
import Heart from "../../assets/Images/quizbellota/heart";
import { AuthContext } from "../../api/context/AuthContext";
import { startVf, answerVf } from "../../api/game";
import { useGame } from "../../api/context/GameContext";
import { Fonts } from "../../Utils/Fonts";
import { useVideoPlayer, VideoView } from "expo-video";
import { USE_DEV_USER, DEV_USER_ID } from "../../api/config/env";
import { LEVELS_CONFIG } from "../../Navigation/NavegacionJuegos/levelConfig";

type AfterStatus = "active" | "finished" | "failed";

type QuestionState = {
    session_id: string;
    lives_left: number;
    total_items: number;
    lesson_item_id: string;
    position: number;
    prompt: string;
    skipIntroVideo: boolean;
};

type AnswerResult = {
    isCorrect: boolean;
    feedback: string;
    correctAnswer: "Verdadero" | "Falso";
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
    onNext: () => void;
    initialState: QuestionState | null;
    setInitialState: (s: QuestionState | null) => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus, opts?: { repasoNeeded?: boolean; repasoWrongCount?: number; sessionId?: string }) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
};

export default function QuizBellota({
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
    const micro = levelConfig?.micro ?? 1;

    const [q, setQ] = useState<QuestionState | null>(null);
    const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const isSubmitting = useRef(false);
    const currentQuestionIdRef = useRef<string | null>(null);

    const [showVideo, setShowVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const totalEarnedRef = useRef(0);

    const player = useVideoPlayer(null, (player) => {
        player.loop = false;
        player.timeUpdateEventInterval = 0.1;
    });

    useEffect(() => {
        setCurrentTime(player.currentTime);
        setDuration(player.duration);

        const tSub = player.addListener("timeUpdate", (p: { currentTime: number }) => setCurrentTime(p.currentTime));
        const dSub = player.addListener("sourceLoad", (p: { duration: number }) => setDuration(p.duration));
        const fSub = player.addListener("playToEnd", handleVideoFinish);
        const eSub = player.addListener("statusChange", (s: { status: string }) => {
            if (s.status === "error") setShowVideo(false);
        });

        return () => {
            // Fix: Safe pause check before unmount
            try {
                if (player && typeof player.pause === 'function') {
                    player.pause();
                }
            } catch (e) {
                // Ignore native object already gone
            }
            tSub.remove();
            dSub.remove();
            fSub.remove();
            eSub.remove();
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
            try {
                if (player && typeof player.pause === 'function') {
                    player.pause();
                }
            } catch (e) {
                // Ignore
            }
        }
    }, [showVideo, player]);

    const scaleAnimTrue = useRef(new Animated.Value(1)).current;
    const scaleAnimFalse = useRef(new Animated.Value(1)).current;

    const animateButton = (scaleVal: Animated.Value, toValue: number) => {
        Animated.spring(scaleVal, { toValue, useNativeDriver: true, friction: 3 }).start();
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
        Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
        }).start();

        if (isCorrect) {
            SoundManager.play('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            SoundManager.play('incorrect');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `\:\\`;
    };

    const markSkipIntroVideo = () => {
        if (q) {
            const updated: QuestionState = { ...q, skipIntroVideo: true };
            setQ(updated);
            setInitialState(updated);
        }
    };

    const handleVideoFinish = () => {
        try { player.pause(); } catch(e) {}
        setShowVideo(false);
        markSkipIntroVideo();
    };

    useEffect(() => {
        (async () => {
            if (initializing) return;

            if (initialState) {
                currentQuestionIdRef.current = initialState.lesson_item_id;
                setQ(initialState);
                setRespuestaSeleccionada(null);
                setAnswerResult(null);
                resetPanel();
                setLoading(false);
                if (initialState.skipIntroVideo) setShowVideo(false);
                return;
            }

            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;

            if (!userId) {
                Alert.alert("Sesion requerida", "Inicia sesion para jugar.");
                setLoading(false);
                onNext();
                return;
            }

            try {
                setLoading(true);
                const res = await startVf(level, micro, userId, isReviewMode);

                const state: QuestionState = {
                    session_id: res.session_id,
                    lives_left: res.lives_left,
                    total_items: res.total_items,
                    lesson_item_id: res.question.lesson_item_id,
                    position: res.question.position,
                    prompt: res.question.prompt,
                    skipIntroVideo: false,
                };

                currentQuestionIdRef.current = state.lesson_item_id;
                setQ(state);
                setInitialState(state);
                setRespuestaSeleccionada(null);
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
                Alert.alert("Error", err?.message ?? "No se pudo iniciar el quiz");
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

    const handlePress = async (esVerdadero: boolean) => {
        if (!q || sending || answerResult !== null || isSubmitting.current) return;

        const questionId = q.lesson_item_id;
        isSubmitting.current = true;
        SoundManager.play('select_option');
        Haptics.selectionAsync();
        setRespuestaSeleccionada(esVerdadero);
        setSending(true);
        showFeedbackPanel();

        try {
            const res = await answerVf(level, micro, q.session_id, q.lesson_item_id, esVerdadero);

            // Stale response guard: component may have advanced while this request was in flight
            if (currentQuestionIdRef.current !== questionId) return;

            const statusAfter: AfterStatus = (res.status as AfterStatus) ?? "active";
            const newLives = typeof res.lives_left === "number" ? res.lives_left : q.lives_left;
            const earned = typeof res.bellotas_earned === "number" ? res.bellotas_earned : 0;
            const balance = typeof res.bellotas_balance === "number" ? res.bellotas_balance : 0;
            totalEarnedRef.current += earned;
            const feedback = typeof res.feedback === "string" ? res.feedback : "";

            // Idempotency: backend detected a duplicate POST — advance silently, no panel
            if (feedback === "Ya respondido") {
                isSubmitting.current = false;
                setSending(false);
                setRespuestaSeleccionada(null);
                resetPanel();
                const nextState: QuestionState | null =
                    statusAfter === "active" && res.next_question
                        ? {
                            session_id: q.session_id,
                            lives_left: newLives,
                            total_items: q.total_items,
                            lesson_item_id: res.next_question.lesson_item_id,
                            position: res.next_question.position,
                            prompt: res.next_question.prompt,
                            skipIntroVideo: true,
                        }
                        : null;
                if (statusAfter === "active" && nextState) {
                    setInitialState(nextState);
                }
                return;
            }

            const nextState: QuestionState | null =
                statusAfter === "active" && res.next_question
                    ? {
                        session_id: q.session_id,
                        lives_left: newLives,
                        total_items: q.total_items,
                        lesson_item_id: res.next_question.lesson_item_id,
                        position: res.next_question.position,
                        prompt: res.next_question.prompt,
                        skipIntroVideo: true,
                    }
                    : null;

            const correctAnswer: "Verdadero" | "Falso" =
                res.is_correct === true ? (esVerdadero ? "Verdadero" : "Falso") : esVerdadero ? "Falso" : "Verdadero";

            const result: AnswerResult = {
                isCorrect: res.is_correct === true,
                feedback,
                correctAnswer,
                nextState,
                earned,
                balance,
                statusAfter,
                repasoNeeded: res.repaso_needed === true,
                repasoWrongCount: typeof res.repaso_wrong_count === 'number' ? res.repaso_wrong_count : 0,
                sessionId: q?.session_id,
            };

            if (!result.isCorrect) {
                setLives(newLives);
                void refreshLives();
            }

            setAnswerResult(result);
            showResultContent(result.isCorrect);
        } catch (err: any) {
            isSubmitting.current = false;
            resetPanel();
            setRespuestaSeleccionada(null);
            Alert.alert("Error", err?.message ?? "Error al enviar respuesta");
        } finally {
            setSending(false);
        }
    };

    const handleContinuar = () => {
        if (!answerResult) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const { isCorrect, feedback, nextState, earned, balance, statusAfter } = answerResult;

        Animated.timing(panelAnim, {
            toValue: 300,
            duration: 180,
            useNativeDriver: true,
            easing: Easing.in(Easing.quad),
        }).start(() => {
            isSubmitting.current = false;
            resetPanel();
            setAnswerResult(null);
            setRespuestaSeleccionada(null);

            if (!isCorrect) {
                if (statusAfter === "active" && nextState) {
                    setInitialState(nextState);
                } else {
                    // Si falló por vidas (statusAfter === 'failed'), mantenemos el initialState actual 
                    // para que pueda reanudar al volver de la tienda.
                    if (statusAfter !== 'failed') {
                        setInitialState(null);
                    }
                    onShowIncorrect(feedback, nextState?.lives_left ?? 0, statusAfter);
                }
                return;
            }

            if (statusAfter === "active" && nextState) {
                setInitialState(nextState);
            } else {
                setInitialState(null);
            }
            onShowCongrats(earned, balance, statusAfter, {
                repasoNeeded: answerResult.repasoNeeded,
                repasoWrongCount: answerResult.repasoWrongCount,
                sessionId: answerResult.sessionId,
            });
        });
    };

    const getVerdaderoColors = () => {
        if (answerResult === null || respuestaSeleccionada !== true) {
            return { rectFill: "#00646D", rectStroke: "#32A0A7" };
        }
        return answerResult.isCorrect
            ? { rectFill: "#00D472", rectStroke: "#1A7A45" }
            : { rectFill: "#F03010", rectStroke: "#8B2010" };
    };

    const getFalsoColors = () => {
        if (answerResult === null || respuestaSeleccionada !== false) {
            return { rectFill: "#00646D", rectStroke: "#32A0A7" };
        }
        return answerResult.isCorrect
            ? { rectFill: "#00D472", rectStroke: "#1A7A45" }
            : { rectFill: "#F03010", rectStroke: "#8B2010" };
    };

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
                            {formatTime(currentTime * 1000)}
                            {" / "}
                            {formatTime(duration * 1000)}
                        </Text>

                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
    
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    const verdaderoColors = getVerdaderoColors();
    const falsoColors = getFalsoColors();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            <View style={styles.cajaRectangular} />
            <Text style={styles.tituloHeader}>VERDADERO O FALSO</Text>

            <View style={styles.cajaRectangular2}>
                <Text style={styles.textoPregunta}>{q.prompt}</Text>
            </View>

            <Estrellita />
            <Puntitos />
            <BarraProgreso
                current={q.position}
                total={q.total_items}
                style={{
                    position: "absolute",
                    top: responsiveHeight(7),
                    zIndex: 9999,
                    alignSelf: "center",
                }}
            />

            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{lives}</Text>
            </View>

            <Ramagrande style={styles.ramagrande} />
            <Empleado style={styles.empleado} />

            <View style={styles.bottomRow}>
                <TouchableOpacity
                    onPressIn={() => animateButton(scaleAnimTrue, 0.9)}
                    onPressOut={() => animateButton(scaleAnimTrue, 1)}
                    onPress={() => handlePress(true)}
                    disabled={sending || answerResult !== null || isSubmitting.current}
                    activeOpacity={isSubmitting.current ? 1 : 0.8}
                >
                    <Animated.View
                        style={{
                            transform: [
                                { scale: scaleAnimTrue },
                                { translateX: respuestaSeleccionada === true ? shakeAnim : 0 },
                            ],
                        }}
                    >
                        <Verdadero rectFill={verdaderoColors.rectFill} rectStroke={verdaderoColors.rectStroke} />
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPressIn={() => animateButton(scaleAnimFalse, 0.9)}
                    onPressOut={() => animateButton(scaleAnimFalse, 1)}
                    onPress={() => handlePress(false)}
                    disabled={sending || answerResult !== null || isSubmitting.current}
                    activeOpacity={isSubmitting.current ? 1 : 0.8}
                >
                    <Animated.View
                        style={{
                            transform: [
                                { scale: scaleAnimFalse },
                                { translateX: respuestaSeleccionada === false ? shakeAnim : 0 },
                            ],
                        }}
                    >
                        <Falso rectFill={falsoColors.rectFill} rectStroke={falsoColors.rectStroke} />
                    </Animated.View>
                </TouchableOpacity>
            </View>

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
                                <>
                                    <Text style={styles.feedbackTitleIncorrect}>Respuesta correcta:</Text>      
                                    <Text style={styles.feedbackCorrectAnswer}>{answerResult.correctAnswer}</Text>
                                </>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0C7E8A" },
    cajaRectangular: {
        width: responsiveWidth(100),
        height: responsiveHeight(12),
        backgroundColor: "#0D494F",
        borderRadius: scale(10),
        alignSelf: "center",
    },
    cajaRectangular2: {
        width: responsiveWidth(75),
        height: responsiveHeight(17),
        backgroundColor: "#0D494F",
        marginTop: responsiveHeight(15),
        borderRadius: scale(38),
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        padding: scale(20),
    },
    textoPregunta: {
        color: "#FFFFFF",
        fontSize: moderateScale(18),
        textAlign: "center",
        fontWeight: "600",
        fontFamily: Fonts.Bold,
    },
    tituloHeader: {
        position: "absolute",
        top: responsiveHeight(18),
        alignSelf: "center",
        color: "#FFFFFF",
        fontSize: moderateScale(35),
        fontFamily: Fonts.Bold,
        zIndex: 10,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingHorizontal: responsiveWidth(5),
        marginTop: responsiveHeight(10),
        zIndex: 10,
    },
    ramagrande: {
        position: "absolute",
        bottom: responsiveHeight(-1),
        left: responsiveWidth(15) - 200 / 2,
        width: 200,
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    backButton: {
        position: "absolute",
        top: responsiveHeight(5.5),
        left: responsiveWidth(2),
        zIndex: 10000,
        padding: 10,
    },
    livesContainer: {
        position: "absolute",
        top: responsiveHeight(7),
        right: responsiveWidth(4),
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        zIndex: 10000,
    },
    livesText: {
        color: "#FFFFFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        textShadowColor: "rgba(0,0,0,0.25)",
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 4,
    },
    empleado: {
        position: "absolute",
        bottom: responsiveHeight(38),
        left: responsiveWidth(61) - 200 / 2,
        width: 200,
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    videoContainer: { flex: 1, backgroundColor: "#000" },
    video: { flex: 1 },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "space-between",
        padding: scale(20),
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    skipButton: {
        alignSelf: "flex-end",
        backgroundColor: "rgba(255,255,255,0.3)",
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(16),
        borderRadius: scale(20),
        marginTop: responsiveHeight(5),
    },
    skipText: { color: "#fff", fontFamily: Fonts.Bold, fontSize: 14 },
    videoControls: { marginBottom: responsiveHeight(5) },
    timeText: {
        color: "#fff",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        marginBottom: verticalScale(8),
        textAlign: "center",
    },
    progressBarBackground: {
        height: verticalScale(8),
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: scale(4),
        overflow: "hidden",
    },
    progressBarForeground: { height: "100%", backgroundColor: "#FFD700" },

    feedbackPanel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        paddingBottom: verticalScale(24),
        zIndex: 20000,
    },
    feedbackPanelLoading: {
        backgroundColor: "#0D5961",
    },
    feedbackPanelCorrect: {
        backgroundColor: "#0A3D28",
    },
    feedbackPanelIncorrect: {
        backgroundColor: "#3E1010",
    },
    feedbackIconCircle: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        backgroundColor: "rgba(0,0,0,0.25)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: scale(12),
        flexShrink: 0,
    },
    feedbackIconCorrect: {
        color: "#00D472",
        fontSize: moderateScale(28),
        fontWeight: "700",
    },
    feedbackIconIncorrect: {
        color: "#F03010",
        fontSize: moderateScale(28),
        fontWeight: "700",
    },
    feedbackTextArea: {
        flex: 1,
    },
    feedbackTitleCorrect: {
        color: "#00D472",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(18),
        marginBottom: 4,
    },
    feedbackTitleIncorrect: {
        color: "#F05050",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        marginBottom: 2,
    },
    feedbackCorrectAnswer: {
        color: "#F05050",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(14),
        marginBottom: 4,
    },
    feedbackExplanationCorrect: {
        color: "#00D472",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(11),
        opacity: 0.85,
    },
    feedbackExplanationIncorrect: {
        color: "#F05050",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(11),
        opacity: 0.85,
    },
    continuarButton: {
        borderRadius: scale(11),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    continuarButtonLoading: {
        backgroundColor: "#1C5F68",
        shadowColor: "#0A3B42",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    continuarButtonCorrect: {
        backgroundColor: "#00D472",
        shadowColor: "#0A6F43",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    continuarButtonIncorrect: {
        backgroundColor: "#D04747",
        shadowColor: "#853434",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    continuarText: {
        color: "#FFFFFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(14),
        fontWeight: "600",
    },
});
