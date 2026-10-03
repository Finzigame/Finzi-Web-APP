import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Animated,
    Easing,
    Alert,
    ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import SoundManager from '../../Utils/SoundManager';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import Puntitos from '../../Components/NivelBellota/Puntitos';
import LoadingQuestion from '../../Components/LoadingQuestion';
import BarraProgreso from '../../assets/Images/Nivel_Bellota/barraprogrso';
import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import Calculator from '../../Components/Minijuegos/Calculator';
import { Fonts } from '../../Utils/Fonts';
import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { answerCalc, startCalc } from '../../api/game';
import { DEV_USER_ID, USE_DEV_USER } from '../../api/config/env';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';

type AfterStatus = 'active' | 'finished' | 'failed';

type CalcQuestionState = {
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
    nextState: CalcQuestionState | null;
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
    initialState: CalcQuestionState | null;
    setInitialState: (s: CalcQuestionState | null) => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus, opts?: { repasoNeeded?: boolean; repasoWrongCount?: number; sessionId?: string }) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
};

export default function Juegocalc({
    levelId,
    onBackToLevel,
    onNext,
    initialState,
    setInitialState,
    onShowCongrats,
    onShowIncorrect,
}: Props) {
    const { session, initializing } = useContext(AuthContext);
    const { isReviewMode } = useGame();

    const levelConfig = LEVELS_CONFIG.find(l => l.id === levelId);
    const level = levelConfig?.levelSlug ?? 'bellota';
    const micro = levelConfig?.micro ?? 3;

    const [q, setQ] = useState<CalcQuestionState | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const isSubmitting = useRef(false);

    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const totalEarnedRef = useRef(0);

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
        }
    };

    const resetPanel = () => {
        panelAnim.setValue(300);
        contentOpacity.setValue(0);
    };

    useEffect(() => {
        (async () => {
            if (initializing) return;

            if (initialState) {
                setQ(initialState);
                setAnswerResult(null);
                resetPanel();
                setLoading(false);
                return;
            }

            const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;

            if (!userId) {
                Alert.alert('Sesión requerida', 'Inicia sesión para jugar.');
                setLoading(false);
                onNext();
                return;
            }

            try {
                setLoading(true);
                const res = await startCalc(level, micro, userId, isReviewMode);

                const state: CalcQuestionState = {
                    session_id: res.session_id,
                    lives_left: res.lives_left,
                    total_items: res.total_items,
                    lesson_item_id: res.question.lesson_item_id,
                    position: res.question.position,
                    prompt: res.question.prompt,
                    skipIntroVideo: false,
                };

                setQ(state);
                setInitialState(state);
                setAnswerResult(null);
                resetPanel();
            } catch (err: any) {
                Alert.alert('Error', err?.message ?? 'No se pudo iniciar el juego');
                onBackToLevel();
            } finally {
                setLoading(false);
            }
        })();
    }, [initializing, initialState, level, micro, session?.user_id, levelId]);

    const handleSubmit = async (answer: string) => {
        if (!q || sending || answerResult !== null || isSubmitting.current) return;

        isSubmitting.current = true;
        setSending(true);
        showFeedbackPanel();

        try {
            const res = await answerCalc(level, micro, q.session_id, q.lesson_item_id, answer);
            
            const statusAfter: AfterStatus = (res.status as AfterStatus) ?? 'active';
            const newLives = typeof res.lives_left === 'number' ? res.lives_left : q.lives_left;
            const earned = typeof res.bellotas_earned === 'number' ? res.bellotas_earned : 0;
            const balance = typeof res.bellotas_balance === 'number' ? res.bellotas_balance : 0;
            totalEarnedRef.current += earned;
            const feedback = typeof res.feedback === 'string' ? res.feedback : '';

            const nextState: CalcQuestionState | null =
                statusAfter === 'active' && res.next_question
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
            isSubmitting.current = false;
            resetPanel();
            Alert.alert('Error', err?.message ?? 'Error al enviar respuesta');
        } finally {
            setSending(false);
        }
    };

    const handleContinuar = () => {
        if (!answerResult) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const { isCorrect, feedback, nextState, earned, balance, statusAfter, livesLeft } = answerResult;

        Animated.timing(panelAnim, {
            toValue: 300,
            duration: 180,
            useNativeDriver: true,
            easing: Easing.in(Easing.quad),
        }).start(() => {
            isSubmitting.current = false;
            resetPanel();
            setAnswerResult(null);

            if (!isCorrect) {
                if (statusAfter === 'active' && nextState) {
                    setInitialState(nextState);
                } else {
                    // Si falló por vidas (statusAfter === 'failed'), mantenemos el initialState actual 
                    // para que pueda reanudar al volver de la tienda.
                    if (statusAfter !== 'failed') {
                        setInitialState(null);
                    }
                    onShowIncorrect(feedback, livesLeft, statusAfter);
                }
                return;
            }

            if (statusAfter === 'active' && nextState) {
                setInitialState(nextState);
            } else {
                setInitialState(null);
            }
            onShowCongrats(earned, balance, statusAfter, {
                repasoNeeded: answerResult?.repasoNeeded,
                repasoWrongCount: answerResult?.repasoWrongCount,
                sessionId: answerResult?.sessionId,
            });
        });
    };

    if (initializing || loading || !q) {
        return <LoadingQuestion />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.cajaRectangular} />

            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            <BarraProgreso
                current={q.position}
                total={q.total_items}
                style={{
                    position: 'absolute',
                    top: responsiveHeight(6),
                    zIndex: 9999,
                    alignSelf: 'center',
                }}
            />

            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{q.lives_left}</Text>
            </View>

            <Puntitos />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.promptBox}>
                    <Text style={styles.promptText}>{q.prompt}</Text>
                </View>

                <View style={styles.calculatorWrapper}>
                    <Calculator
                        onSubmit={handleSubmit}
                        disabled={sending || answerResult !== null || isSubmitting.current}
                    />
                </View>
            </ScrollView>

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0C7E8A' },

    cajaRectangular: {
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

    scrollContent: {
        paddingTop: responsiveHeight(13),
        paddingBottom: responsiveHeight(12),
        alignItems: 'center',
    },

    promptBox: {
        width: responsiveWidth(85),
        backgroundColor: '#00515A',
        borderRadius: scale(20),
        padding: scale(20),
        marginBottom: responsiveHeight(2.5),
        alignItems: 'center',
    },

    promptText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontFamily: Fonts.Bold,
        textAlign: 'center',
        lineHeight: moderateScale(24),
    },

    calculatorWrapper: {
        alignItems: 'center',
        width: '100%',
    },

    feedbackPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        paddingBottom: verticalScale(24),
        zIndex: 20000,
    },
    feedbackPanelLoading: { backgroundColor: '#0D5961' },
    feedbackPanelCorrect: { backgroundColor: '#0A3D28' },
    feedbackPanelIncorrect: { backgroundColor: '#3E1010' },

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
    feedbackIconCorrect: { color: '#00D472', fontSize: moderateScale(28), fontWeight: '700' },
    feedbackIconIncorrect: { color: '#F03010', fontSize: moderateScale(28), fontWeight: '700' },

    feedbackTextArea: { flex: 1 },

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
});
