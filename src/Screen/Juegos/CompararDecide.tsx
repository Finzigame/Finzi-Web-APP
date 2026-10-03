import React, { useRef, useState, useEffect, useContext } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import Arrow from '../../assets/Images/quizbellota/arrow';
import Heart from '../../assets/Images/quizbellota/heart';
import BarraProgreso from '../../assets/Images/Nivel_Bellota/barraprogrso';
import ShieldCheckCD from '../../assets/Images/compara/ShieldCheckCD';
import XCircleCD from '../../assets/Images/compara/XCircleCD';
import TrendUpCD from '../../assets/Images/compara/TrendUpCD';
import XMarkCD from '../../assets/Images/compara/XMarkCD';
import GlowDotCD from '../../assets/Images/compara/GlowDotCD';
import BoltCD from '../../assets/Images/compara/BoltCD';
import LeafCD from '../../assets/Images/compara/LeafCD';
import AlertCD from '../../assets/Images/compara/AlertCD';
import ClockCD from '../../assets/Images/compara/ClockCD';
import CoinCD from '../../assets/Images/compara/CoinCD';
import TargetCD from '../../assets/Images/compara/TargetCD';
import StarCD from '../../assets/Images/compara/StarCD';
import { Fonts } from '../../Utils/Fonts';

import { AuthContext } from '../../api/context/AuthContext';
import { useGame } from '../../api/context/GameContext';
import { startCompar, answerCompar } from '../../api/game';
import { USE_DEV_USER, DEV_USER_ID } from '../../api/config/env';
import LoadingQuestion from '../../Components/LoadingQuestion';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Types ---

type AfterStatus = 'active' | 'finished' | 'failed';
type RowType = 'value' | 'icon' | 'both';

type IconName = 'trend' | 'shield' | 'bolt' | 'leaf' | 'alert' | 'clock' | 'coin' | 'target' | 'star';

type ComparisonRow = {
    id: string;
    label: string;
    sublabel?: string;
    value_a: string;
    value_b: string;
    a_is_good: boolean;
    b_is_good: boolean;
    row_type: RowType;
    icon: IconName;
};

type QuestionState = {
    session_id: string;
    lives_left: number;
    question_id: string;
    title: string;
    option_a_label: string;
    option_b_label: string;
    rows: ComparisonRow[];
};

interface Props {
    levelId: string | null;
    onBackToLevel: () => void;
    onShowCongrats: (earned: number, balance: number, statusAfter: AfterStatus, opts?: { repasoNeeded?: boolean; repasoWrongCount?: number; sessionId?: string }) => void;
    onShowIncorrect: (feedback: string, livesLeft: number, statusAfter: AfterStatus) => void;
}

// --- Row Icon ---

function RowIcon({ name, color }: { name: IconName; color: string }) {
    const props = { size: 18, color };
    switch (name) {
        case 'trend': return <TrendUpCD {...props} />;
        case 'shield': return <ShieldCheckCD {...props} />;
        case 'bolt': return <BoltCD {...props} />;
        case 'leaf': return <LeafCD {...props} />;
        case 'alert': return <AlertCD {...props} />;
        case 'clock': return <ClockCD {...props} />;
        case 'coin': return <CoinCD {...props} />;
        case 'target': return <TargetCD {...props} />;
        case 'star': return <StarCD {...props} />;
        default: return <ShieldCheckCD {...props} />;
    }
}

// --- Component ---

export default function CompararDecide({ levelId, onBackToLevel, onShowCongrats, onShowIncorrect }: Props) {
    const { session } = useContext(AuthContext);
    const { isReviewMode } = useGame();

    const levelConfig = LEVELS_CONFIG.find(l => l.id === levelId);
    const level = levelConfig?.levelSlug ?? 'bellota';
    const micro = levelConfig?.micro ?? 8;

    const [q, setQ] = useState<QuestionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);
    const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

    // Animations
    const panelAnim = useRef(new Animated.Value(300)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // --- Load Game ---
    useEffect(() => {
        let isMounted = true;

        async function load() {
            if (!session?.user_id || !levelId) return;
            try {
                setLoading(true);
                const uid = USE_DEV_USER ? DEV_USER_ID : session.user_id;
                const res = await startCompar(level, micro, uid, isReviewMode);
                
                if (isMounted) {
                    setQ({
                        session_id: res.session_id,
                        lives_left: res.lives_left,
                        question_id: res.question_id,
                        title: res.title,
                        option_a_label: res.option_a_label,
                        option_b_label: res.option_b_label,
                        rows: res.rows,
                    });
                    resetPanel();
                }
            } catch (err: any) {
                console.error('Error starting Comparar:', err);
                Alert.alert('Error', err.message || 'No se pudo cargar el juego');
                onBackToLevel();
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();
        return () => { isMounted = false; };
    }, [levelId, session]);

    // --- Handlers ---

    const showPanel = () => {
        contentOpacity.setValue(0);
        Animated.timing(panelAnim, {
            toValue: 0, duration: 250, useNativeDriver: true,
            easing: Easing.out(Easing.back(1.2)),
        }).start();
    };

    const showContent = (isCorrect: boolean) => {
        Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        if (!isCorrect) {
            shakeAnim.setValue(0);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start();
        }
    };

    const resetPanel = () => {
        panelAnim.setValue(300);
        contentOpacity.setValue(0);
        shakeAnim.setValue(0);
    };

    const handleAnswer = async (ans: 'A' | 'B') => {
        if (!q || sending || answerResult !== null) return;

        setSelectedAnswer(ans);
        setSending(true);
        showPanel();

        try {
            const res = await answerCompar(levelId || '', 4, q.session_id, q.question_id, ans);

            setAnswerResult({
                isCorrect: res.is_correct,
                feedback: res.feedback,
            });

            showContent(res.is_correct);

            // Redirigir después de un momento para que vean el feedback
            setTimeout(() => {
                if (res.is_correct) {
                    onShowCongrats(res.bellotas_earned, res.bellotas_balance, res.status, {
                        repasoNeeded: res.repaso_needed === true,
                        repasoWrongCount: typeof res.repaso_wrong_count === 'number' ? res.repaso_wrong_count : 0,
                        sessionId: q?.session_id,
                    });
                } else {
                    onShowIncorrect(res.feedback, res.lives_left, res.status);
                }
            }, 1800);

        } catch (err: any) {
            resetPanel();
            setSelectedAnswer(null);
            Alert.alert('Error', err.message || 'Error al enviar respuesta');
        } finally {
            setSending(false);
        }
    };

    if (loading || !q) return <LoadingQuestion />;

    return (
        <View style={styles.container}>
            <View style={styles.headerBox} />

            <TouchableOpacity style={styles.backButton} onPress={onBackToLevel}>
                <Arrow />
            </TouchableOpacity>

            <BarraProgreso current={0} total={1} style={styles.progressBar} />

            <View style={styles.livesContainer}>
                <Heart />
                <Text style={styles.livesText}>{q.lives_left}</Text>
            </View>

            <View style={[styles.glowDot, { right: responsiveWidth(8), top: responsiveHeight(17) }]} pointerEvents="none">
                <GlowDotCD />
            </View>
            <View style={[styles.glowDot, { left: responsiveWidth(4), top: responsiveHeight(38) }]} pointerEvents="none">
                <GlowDotCD />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>¿Cuál prefieres?</Text>
                <Text style={styles.subtitle}>{q.title}</Text>

                <View style={styles.optionsWrapper}>
                    <TouchableOpacity
                        style={[styles.optionCard, selectedAnswer === 'A' && styles.optionCardSelected]}
                        onPress={() => handleAnswer('A')}
                        disabled={!!selectedAnswer}
                    >
                        <Text style={styles.optionLabel}>A</Text>
                        <Text style={styles.optionText}>{q.option_a_label}</Text>
                    </TouchableOpacity>

                    <Text style={styles.vsText}>VS</Text>

                    <TouchableOpacity
                        style={[styles.optionCard, selectedAnswer === 'B' && styles.optionCardSelected]}
                        onPress={() => handleAnswer('B')}
                        disabled={!!selectedAnswer}
                    >
                        <Text style={styles.optionLabel}>B</Text>
                        <Text style={styles.optionText}>{q.option_b_label}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tableContainer}>
                    {q.rows.map((row, idx) => (
                        <View key={row.id} style={[styles.row, idx === q.rows.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.rowInfo}>
                                <View style={styles.iconCircle}>
                                    <RowIcon name={row.icon} color="#0C7E8A" />
                                </View>
                                <View>
                                    <Text style={styles.rowLabel}>{row.label}</Text>
                                    {row.sublabel && <Text style={styles.rowSublabel}>{row.sublabel}</Text>}
                                </View>
                            </View>

                            <View style={styles.valuesContainer}>
                                <View style={[styles.valueBox, row.a_is_good && styles.valueGood]}>
                                    <Text style={[styles.valueText, row.a_is_good && styles.valueTextGood]}>{row.value_a}</Text>
                                </View>
                                <View style={[styles.valueBox, row.b_is_good && styles.valueGood]}>
                                    <Text style={[styles.valueText, row.b_is_good && styles.valueTextGood]}>{row.value_b}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {(sending || answerResult !== null) && (
                <Animated.View style={[
                    styles.feedbackPanel,
                    answerResult?.isCorrect ? styles.feedbackPanelCorrect : styles.feedbackPanelIncorrect,
                    { transform: [{ translateY: panelAnim }] }
                ]}>
                    <View style={styles.feedbackIconCircle}>
                        {sending ? <ActivityIndicator color="#FFF" /> : (answerResult?.isCorrect ? <Text style={styles.feedbackIconText}>✓</Text> : <Text style={styles.feedbackIconText}>✕</Text>)}
                    </View>
                    <Animated.View style={{ flex: 1, opacity: contentOpacity, transform: [{ translateX: shakeAnim }] }}>
                        <Text style={styles.feedbackTitle}>{answerResult?.isCorrect ? '¡Excelente!' : 'Ojo aquí'}</Text>
                        <Text style={styles.feedbackText}>{answerResult?.feedback}</Text>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0C7E8A' },
    headerBox: { width: '110%', height: responsiveHeight(12), backgroundColor: '#0D494F', borderRadius: 33, alignSelf: 'center' },
    backButton: { position: 'absolute', top: responsiveHeight(4.5), left: 10, zIndex: 10 },
    progressBar: { position: 'absolute', top: responsiveHeight(6), alignSelf: 'center' },
    livesContainer: { position: 'absolute', top: responsiveHeight(6), right: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
    livesText: { color: '#FFF', fontFamily: Fonts.Bold, fontSize: 18 },
    glowDot: { position: 'absolute', zIndex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: scale(20), paddingBottom: verticalScale(150) },
    title: { color: '#FFF', fontFamily: Fonts.Bold, fontSize: moderateScale(32), textAlign: 'center', marginTop: verticalScale(20) },
    subtitle: { color: '#C0FFF4', fontFamily: Fonts.Medium, fontSize: moderateScale(16), textAlign: 'center', marginBottom: verticalScale(30) },
    optionsWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: verticalScale(30) },
    optionCard: { flex: 1, backgroundColor: '#184C4F', borderRadius: scale(20), padding: scale(15), alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    optionCardSelected: { borderColor: '#00D472', backgroundColor: '#0D5961' },
    optionLabel: { color: '#00D472', fontFamily: Fonts.Bold, fontSize: moderateScale(24), marginBottom: verticalScale(5) },
    optionText: { color: '#FFF', fontFamily: Fonts.Bold, fontSize: moderateScale(14), textAlign: 'center' },
    vsText: { color: '#C0FFF4', fontFamily: Fonts.Bold, fontSize: 20 },
    tableContainer: { backgroundColor: '#D6F7FB', borderRadius: 32, padding: 10, elevation: 5 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(15), borderBottomWidth: 1, borderBottomColor: 'rgba(12, 126, 138, 0.1)' },
    rowInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: scale(10) },
    iconCircle: { width: scale(36), height: scale(36), borderRadius: scale(18), backgroundColor: 'rgba(12, 126, 138, 0.1)', alignItems: 'center', justifyContent: 'center' },
    rowLabel: { color: '#184C4F', fontFamily: Fonts.Bold, fontSize: 14 },
    rowSublabel: { color: '#184C4F', opacity: 0.6, fontSize: 10 },
    valuesContainer: { flexDirection: 'row', gap: scale(8) },
    valueBox: { width: scale(70), paddingVertical: verticalScale(8), borderRadius: scale(12), backgroundColor: '#FFF', alignItems: 'center' },
    valueGood: { backgroundColor: '#00D472' },
    valueText: { color: '#184C4F', fontSize: moderateScale(11), fontWeight: '700' },
    valueTextGood: { color: '#FFF' },
    feedbackPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: scale(25), flexDirection: 'row', alignItems: 'center', gap: scale(15), borderTopLeftRadius: scale(30), borderTopRightRadius: scale(30) },
    feedbackPanelCorrect: { backgroundColor: '#0A3D28' },
    feedbackPanelIncorrect: { backgroundColor: '#3E1010' },
    feedbackIconCircle: { width: scale(50), height: scale(50), borderRadius: scale(25), backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    feedbackIconText: { color: '#FFF', fontSize: moderateScale(24), fontWeight: 'bold' },
    feedbackTitle: { color: '#FFF', fontFamily: Fonts.Bold, fontSize: moderateScale(20), marginBottom: verticalScale(5) },
    feedbackText: { color: '#FFF', fontSize: moderateScale(14), opacity: 0.9 },
});
