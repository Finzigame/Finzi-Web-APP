import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    Animated,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import TopBar from '../Components/TopBar';
import BottomNav from '../Components/Bottom_Navigator';
import CustomSlider from '../Components/Agendita/CustomSlider';
import GrowthChart from '../Components/Agendita/GrowthChart';
import GoalCard, { Goal } from '../Components/Agendita/GoalCard';
import GoalModal from '../Components/Agendita/GoalModal';
import {
    IconIngresos,
    IconGastos,
    IconAhorro,
    IconBalance,
    IconTrendUp,
    IconHint,
    IconPlus,
    IconArrowRight,
} from '../assets/Images/Agendita/icons';
import { Fonts } from '../Utils/Fonts';
import { useGame } from '../api/context/GameContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const S = SCREEN_WIDTH / 393;

// TopBar visual bottom: outerContainer.top(10) + BAR_TOP(20) + SVG_H * (W/406)
const TOPBAR_TOTAL_H = Math.round(10 + 130 * (SCREEN_WIDTH / 406)) + 4;
const NAVBAR_H = Math.round(76 * S);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

const calcMeta = (
    inversion: number, tasa: number, tiempo: number, tipo: 'años' | 'meses',
) => {
    const t = tipo === 'años' ? tiempo : tiempo / 12;
    return inversion * Math.pow(1 + tasa / 100, t);
};

// ─── Screen ───────────────────────────────────────────────────────────────────

type Props = {
    onBack: () => void;
    onGoToLevels?: () => void;
    onGoToProfile?: () => void;
    onGoToSettings?: () => void;
    onGoToLivesShop?: () => void;
};

const Agendita: React.FC<Props> = ({ onBack, onGoToLevels, onGoToProfile, onGoToSettings, onGoToLivesShop }) => {
    const { score, lives } = useGame();

    const [inversion, setInversion] = useState(15000);
    const [tiempo, setTiempo] = useState(1);
    const [tipoTiempo, setTipoTiempo] = useState<'años' | 'meses'>('años');
    const [tasa, setTasa] = useState(14.5);
    const [animKey, setAnimKey] = useState(0);
    const metaBounceScale = useRef(new Animated.Value(1)).current;

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('15000');
    const modalScale = useRef(new Animated.Value(0)).current;

    const [goals, setGoals] = useState<Goal[]>([
        { id: 1, emoji: '🏠', name: 'Casa propia', total: 500000, saved: 275000, color: '#70F2E0' },
        { id: 2, emoji: '✈️', name: 'Viaje Japón', total: 80000, saved: 30000, color: '#FFCA4D' },
    ]);
    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const nextGoalId = useRef(3);

    // Derived values
    const ingresos = 15000;
    const gastos = 9500;
    const ahorro = ingresos - gastos;
    const meta = calcMeta(inversion, tasa, tiempo, tipoTiempo);
    const tiempoMax = tipoTiempo === 'años' ? 30 : 12;
    const tiempoLabel = tipoTiempo === 'años'
        ? `${tiempo} ${tiempo === 1 ? 'AÑO' : 'AÑOS'}`
        : `${tiempo} ${tiempo === 1 ? 'MES' : 'MESES'}`;
    const chartW = SCREEN_WIDTH - 32 * S;
    const chartH = 148 * S;

    // Modal handlers
    const openModal = () => {
        setInputValue(String(inversion));
        setModalVisible(true);
        modalScale.setValue(0);
        Animated.spring(modalScale, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }).start();
    };

    const closeModal = () => {
        Animated.timing(modalScale, { toValue: 0, duration: 180, useNativeDriver: true })
            .start(() => setModalVisible(false));
    };

    const confirmInversion = () => {
        const parsed = parseFloat(inputValue.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
            setInversion(Math.round(parsed));
            setAnimKey(k => k + 1);
            closeModal();
        } else {
            Alert.alert('Monto inválido', 'Por favor ingresa un número mayor a 0.');
        }
    };

    // Goals
    const openNewGoal = () => { setEditingGoal(null); setGoalModalVisible(true); };
    const openEditGoal = (g: Goal) => { setEditingGoal(g); setGoalModalVisible(true); };
    const handleSaveGoal = (g: Goal) => {
        setGoals(prev => {
            const idx = prev.findIndex(x => x.id === g.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = g;
                return next;
            }
            nextGoalId.current += 1;
            return [...prev, g];
        });
    };
    const handleDeleteGoal = (id: number) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    // Reward: bounce meta value when chart animation completes
    const handleChartComplete = useCallback(() => {
        metaBounceScale.setValue(0.82);
        Animated.spring(metaBounceScale, {
            toValue: 1,
            bounciness: 18,
            speed: 12,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.root}>

            {/* ── Modal: metas ── */}
            <GoalModal
                visible={goalModalVisible}
                goal={editingGoal}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
                onClose={() => setGoalModalVisible(false)}
                nextId={nextGoalId.current}
            />

            {/* ── Modal: editar inversión ── */}
            <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
                    <Animated.View style={[styles.modalCard, { transform: [{ scale: modalScale }] }]}>
                        <Text style={styles.modalTitle}>INVERSIÓN INICIAL</Text>
                        <Text style={styles.modalSub}>Ingresa el monto a invertir</Text>
                        <View style={styles.modalInputRow}>
                            <Text style={styles.modalCurrency}>$</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={inputValue}
                                onChangeText={setInputValue}
                                keyboardType="numeric"
                                autoFocus
                                selectTextOnFocus
                                placeholder="15,000"
                                placeholderTextColor="rgba(5,72,77,0.4)"
                                returnKeyType="done"
                                onSubmitEditing={confirmInversion}
                            />
                            <Text style={styles.modalCurrencySuffix}>MXN</Text>
                        </View>
                        <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmInversion} activeOpacity={0.85}>
                            <Text style={styles.modalConfirmTxt}>Confirmar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancelBtn} onPress={closeModal} activeOpacity={0.7}>
                            <Text style={styles.modalCancelTxt}>Cancelar</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Scroll content ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Agendita</Text>
                <Text style={styles.subtitle}>Simula tu futuro financiero con precisión.</Text>

                {/* Inversión Inicial */}
                <View style={styles.inversionCard}>
                    <Text style={styles.inversionLabel}>INVERSIÓN INICIAL</Text>
                    <View style={styles.inversionAmountRow}>
                        <Text style={styles.inversionBig}>$ {Math.round(inversion).toLocaleString('en-US')}</Text>
                        <Text style={styles.inversionMXN}> MXN</Text>
                    </View>
                    <TouchableOpacity style={styles.invPlusBtn} onPress={openModal} activeOpacity={0.8}>
                        <Text style={styles.invPlusTxt}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Gráfica de crecimiento */}
                <View style={styles.chartCard}>
                    <View style={styles.chartTopLabel}>
                        <Text style={styles.chartTopSub}>META ESTIMADA</Text>
                        <Text style={styles.chartTopVal}>{fmt(meta)}</Text>
                    </View>
                    <GrowthChart width={chartW} height={chartH} animKey={animKey} onComplete={handleChartComplete} />
                    <View style={styles.chartBottomLabel}>
                        <Text style={styles.chartBottomSub}>INICIO</Text>
                        <Text style={styles.chartBottomVal}>{fmt(inversion)}</Text>
                    </View>
                </View>

                {/* Meta estimada pill */}
                <View style={styles.metaCard}>
                    <View>
                        <Text style={styles.metaCardLabel}>META ESTIMADA</Text>
                        <Animated.Text style={[styles.metaCardVal, { transform: [{ scale: metaBounceScale }] }]}>
                            {fmt(meta)}
                        </Animated.Text>
                    </View>
                    <View style={styles.metaCardBtn}>
                        <IconTrendUp size={20 * S} color="white" />
                    </View>
                </View>

                {/* Tiempo */}
                <View style={styles.sectionCard}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleBg}>
                            {(['años', 'meses'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.toggleBtn, tipoTiempo === t && styles.toggleBtnActive]}
                                    onPress={() => { setTipoTiempo(t); setTiempo(t === 'años' ? 1 : 6); setAnimKey(k => k + 1); }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.toggleBtnTxt, tipoTiempo === t && styles.toggleBtnTxtActive]}>
                                        {t.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.sectionLabelRow}>
                        <Text style={styles.sectionLabel}>TIEMPO</Text>
                        <Text style={styles.sectionValue}>{tiempoLabel}</Text>
                    </View>
                    <CustomSlider value={tiempo} min={1} max={tiempoMax} step={1} onChange={setTiempo} />
                </View>

                {/* Interés Anual */}
                <View style={styles.sectionCard}>
                    <View style={styles.interesRow}>
                        <View>
                            <Text style={styles.sectionLabel}>INTERES ANUAL</Text>
                            <View style={styles.interesValRow}>
                                <Text style={styles.interesVal}>{tasa.toFixed(1)}</Text>
                                <Text style={styles.interesPct}>%</Text>
                            </View>
                        </View>
                        <View style={styles.interesBtn}>
                            <IconTrendUp size={20 * S} color="white" />
                        </View>
                    </View>
                    <CustomSlider value={tasa} min={1} max={50} step={0.5} onChange={setTasa} />
                </View>

                {/* Bento financiero */}
                <View style={styles.bentoGrid}>
                    <View style={[styles.bentoCard, { backgroundColor: '#D6F7FB' }]}>
                        <IconIngresos size={18 * S} />
                        <Text style={styles.bentoLabel}>INGRESOS</Text>
                        <Text style={styles.bentoVal}>{fmt(ingresos)}</Text>
                    </View>
                    <View style={[styles.bentoCard, { backgroundColor: '#D6F7FB' }]}>
                        <IconGastos size={18 * S} />
                        <Text style={styles.bentoLabel}>GASTOS</Text>
                        <Text style={[styles.bentoVal, { color: '#B31B25' }]}>{fmt(gastos)}</Text>
                    </View>
                    <View style={[styles.bentoCard, { backgroundColor: 'rgba(255,202,77,0.62)', borderColor: 'rgba(255,202,77,0.8)', borderWidth: 2 }]}>
                        <IconAhorro size={18 * S} />
                        <Text style={[styles.bentoLabel, { color: '#755700' }]}>AHORRO</Text>
                        <Text style={[styles.bentoVal, { color: '#755700' }]}>{fmt(ahorro)}</Text>
                    </View>
                    <View style={[styles.bentoCard, { backgroundColor: '#D6F7FB' }]}>
                        <IconBalance size={18 * S} />
                        <Text style={styles.bentoLabel}>BALANCE</Text>
                        <Text style={[styles.bentoVal, { color: ahorro >= 0 ? '#183336' : '#B31B25' }]}>{fmt(ahorro)}</Text>
                    </View>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={styles.ctaBtn}
                    activeOpacity={0.85}
                    onPress={() => Alert.alert(
                        'Plan de Inversión',
                        `Con ${fmt(inversion)} MXN al ${tasa}% anual durante ${tiempoLabel}, alcanzarías ${fmt(meta)} MXN.`,
                        [{ text: '¡Genial!' }],
                    )}
                >
                    <Text style={styles.ctaBtnText}>Comenzar plan de inversión</Text>
                    <IconArrowRight size={16 * S} />
                </TouchableOpacity>

                {/* Tus Metas */}
                <View style={styles.metasHeader}>
                    <IconHint size={22 * S} />
                    <Text style={styles.metasTitle}>Tus Metas</Text>
                </View>

                {goals.map((g, i) => (
                    <GoalCard key={g.id} goal={g} index={i} onPress={() => openEditGoal(g)} />
                ))}

                <TouchableOpacity
                    style={styles.newGoalBtn}
                    activeOpacity={0.7}
                    onPress={openNewGoal}
                >
                    <View style={styles.newGoalCircle}>
                        <IconPlus size={21 * S} />
                    </View>
                    <Text style={styles.newGoalText}>Nuevo</Text>
                </TouchableOpacity>
            </ScrollView>

            <TopBar score={score} lives={lives} onProfilePress={onGoToProfile} onSettingsPress={onGoToSettings} onLivesPress={onGoToLivesShop} />
            <BottomNav onBackToSettings={onBack} onGoToLevels={onGoToLevels} onGoToAgendita={() => { }} />
        </View>
    );
};

export default Agendita;

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_W = SCREEN_WIDTH - 32 * S;
const BENTO_W = (CARD_W - 12 * S) / 2;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#1DCBD6' },
    scroll: { flex: 1, backgroundColor: '#15232C' },
    scrollContent: {
        flexGrow: 1,
        paddingTop: TOPBAR_TOTAL_H,
        paddingBottom: NAVBAR_H + 24,
        paddingHorizontal: 16 * S,
        backgroundColor: '#1DCBD6',
    },

    // Title
    title: {
        fontFamily: Fonts.One,
        fontSize: 40 * S,
        color: '#2D4453',
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 0,
        marginTop: 8 * S,
    },
    subtitle: {
        fontFamily: Fonts.Regular,
        fontSize: 18 * S,
        color: '#456063',
        marginTop: 2 * S,
        marginBottom: 14 * S,
    },

    // Inversión card
    inversionCard: {
        backgroundColor: '#05484D',
        borderRadius: 32 * S,
        borderWidth: 6 * S,
        borderColor: '#479C96',
        paddingHorizontal: 20 * S,
        paddingTop: 20 * S,
        paddingBottom: 22 * S,
        marginBottom: 12 * S,
    },
    inversionLabel: { fontFamily: Fonts.One, fontSize: 18 * S, color: '#FFF', marginBottom: 6 * S },
    inversionAmountRow: { flexDirection: 'row', alignItems: 'flex-end' },
    inversionBig: { fontFamily: Fonts.One, fontSize: 40 * S, color: '#FFF', lineHeight: 48 * S },
    inversionMXN: { fontFamily: Fonts.One, fontSize: 13 * S, color: '#FFF', marginBottom: 6 * S },
    invPlusBtn: {
        position: 'absolute',
        right: 14 * S,
        bottom: 14 * S,
        width: 42 * S,
        height: 42 * S,
        borderRadius: 21 * S,
        backgroundColor: '#0195A5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#03616C',
        shadowOffset: { width: -2, height: 2 },
        shadowRadius: 1,
        shadowOpacity: 1,
        elevation: 4,
    },
    invPlusTxt: { fontFamily: Fonts.One, fontSize: 30 * S, color: '#FFF', lineHeight: 34 * S },

    // Chart
    chartCard: {
        backgroundColor: '#D6F7FB',
        borderRadius: 28 * S,
        paddingTop: 12 * S,
        paddingBottom: 8 * S,
        marginBottom: 10 * S,
        overflow: 'hidden',
    },
    chartTopLabel: { alignItems: 'flex-end', paddingHorizontal: 16 * S, marginBottom: 4 * S },
    chartTopSub: { fontFamily: Fonts.Medium, fontSize: 10 * S, color: '#00675D', fontWeight: '700', textTransform: 'uppercase' },
    chartTopVal: { fontFamily: Fonts.One, fontSize: 20 * S, color: '#00675D' },
    chartBottomLabel: { paddingHorizontal: 16 * S, marginTop: 4 * S },
    chartBottomSub: { fontFamily: Fonts.Medium, fontSize: 10 * S, color: '#456063', fontWeight: '700', textTransform: 'uppercase' },
    chartBottomVal: { fontFamily: Fonts.One, fontSize: 14 * S, color: '#183336' },

    // Meta estimada pill
    metaCard: {
        backgroundColor: '#EED387',
        borderRadius: 16 * S,
        borderWidth: 2,
        borderColor: '#755700',
        borderStyle: 'dashed',
        padding: 14 * S,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12 * S,
    },
    metaCardLabel: { fontFamily: Fonts.One, fontSize: 15 * S, color: '#755700' },
    metaCardVal: { fontFamily: Fonts.One, fontSize: 32 * S, color: '#755700' },
    metaCardBtn: {
        width: 48 * S,
        height: 48 * S,
        borderRadius: 24 * S,
        backgroundColor: '#755700',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#443100',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 0,
        shadowOpacity: 1,
        elevation: 4,
    },

    // Section cards (tiempo / interés)
    sectionCard: {
        backgroundColor: '#98DAE1',
        borderRadius: 16 * S,
        padding: 14 * S,
        marginBottom: 12 * S,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 4,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10 * S,
        marginTop: 8 * S,
    },
    sectionLabel: { fontFamily: Fonts.One, fontSize: 15 * S, color: '#000' },
    sectionValue: { fontFamily: Fonts.One, fontSize: 20 * S, color: '#004068' },

    // Toggle años / meses
    toggleRow: { alignItems: 'center', marginBottom: 4 * S },
    toggleBg: {
        flexDirection: 'row',
        backgroundColor: '#479C96',
        borderRadius: 14 * S,
        padding: 4 * S,
        shadowColor: '#05484D',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 0,
        shadowOpacity: 1,
        elevation: 4,
    },
    toggleBtn: { paddingHorizontal: 24 * S, paddingVertical: 6 * S, borderRadius: 10 * S },
    toggleBtnActive: { backgroundColor: '#D6F7FB' },
    toggleBtnTxt: { fontFamily: Fonts.One, fontSize: 14 * S, color: '#D6F7FB' },
    toggleBtnTxtActive: { color: '#05484D' },

    // Interés
    interesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 * S },
    interesValRow: { flexDirection: 'row', alignItems: 'flex-end' },
    interesVal: { fontFamily: Fonts.One, fontSize: 36 * S, color: '#000' },
    interesPct: { fontFamily: Fonts.One, fontSize: 16 * S, color: '#208392', marginBottom: 4 * S, marginLeft: 2 * S },
    interesBtn: {
        width: 48 * S,
        height: 48 * S,
        borderRadius: 14 * S,
        backgroundColor: '#03616C',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 4,
        borderBottomColor: '#13808C',
        elevation: 3,
    },

    // Bento financiero
    bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 * S, marginBottom: 16 * S },
    bentoCard: { width: BENTO_W, borderRadius: 24 * S, padding: 14 * S, minHeight: 90 * S, gap: 4 * S },
    bentoLabel: { fontFamily: Fonts.Medium, fontSize: 10 * S, color: '#456063', textTransform: 'uppercase', fontWeight: '700' },
    bentoVal: { fontFamily: Fonts.One, fontSize: 16 * S, color: '#183336' },

    // CTA
    ctaBtn: {
        backgroundColor: '#03616C',
        borderRadius: 999,
        paddingVertical: 18 * S,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8 * S,
        marginBottom: 20 * S,
        borderBottomWidth: 4,
        borderBottomColor: '#005A51',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaBtnText: { fontFamily: Fonts.One, fontSize: 18 * S, color: '#FFF' },

    // Tus Metas
    metasHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 * S, marginBottom: 12 * S },
    metasTitle: { fontFamily: Fonts.One, fontSize: 20 * S, color: '#2D4453' },

    // Nueva meta
    newGoalBtn: {
        backgroundColor: '#F5F6F6',
        borderRadius: 24 * S,
        padding: 14 * S,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12 * S,
        marginBottom: 10 * S,
        borderWidth: 2,
        borderColor: 'rgba(0,103,93,0.15)',
        borderStyle: 'dashed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 2,
    },
    newGoalCircle: {
        width: 52 * S,
        height: 52 * S,
        borderRadius: 26 * S,
        borderWidth: 3,
        borderColor: 'rgba(0,103,93,0.3)',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newGoalText: { fontFamily: Fonts.One, fontSize: 16 * S, color: '#004068' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(5,72,77,0.55)', justifyContent: 'center', alignItems: 'center' },
    modalCard: {
        backgroundColor: '#D6F7FB',
        borderRadius: 32 * S,
        padding: 28 * S,
        width: SCREEN_WIDTH - 48 * S,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
    },
    modalTitle: { fontFamily: Fonts.One, fontSize: 22 * S, color: '#05484D', marginBottom: 4 * S },
    modalSub: { fontFamily: Fonts.Regular, fontSize: 14 * S, color: '#456063', marginBottom: 20 * S },
    modalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16 * S,
        borderWidth: 3,
        borderColor: '#479C96',
        paddingHorizontal: 14 * S,
        paddingVertical: 8 * S,
        width: '100%',
        marginBottom: 20 * S,
    },
    modalCurrency: { fontFamily: Fonts.One, fontSize: 28 * S, color: '#05484D', marginRight: 4 * S },
    modalInput: { flex: 1, fontFamily: Fonts.One, fontSize: 28 * S, color: '#05484D', padding: 0 },
    modalCurrencySuffix: { fontFamily: Fonts.One, fontSize: 13 * S, color: '#456063', alignSelf: 'flex-end', marginBottom: 4 * S },
    modalConfirmBtn: {
        backgroundColor: '#03616C',
        borderRadius: 999,
        paddingVertical: 14 * S,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 4,
        borderBottomColor: '#005A51',
        marginBottom: 10 * S,
    },
    modalConfirmTxt: { fontFamily: Fonts.One, fontSize: 18 * S, color: '#FFF' },
    modalCancelBtn: { paddingVertical: 8 * S },
    modalCancelTxt: { fontFamily: Fonts.Regular, fontSize: 15 * S, color: '#456063' },
});
