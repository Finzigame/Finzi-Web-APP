import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Animated,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Fonts } from '../../Utils/Fonts';
import { Goal } from './GoalCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const S = SCREEN_WIDTH / 393;

const EMOJIS = [
    '🏠', '✈️', '🚗', '💻', '📚', '🎓', '💍', '🌎', '🏋️', '🎸',
    '🏖️', '🐕', '🎯', '💎', '🏥', '👶', '🌴', '🎉', '🚀', '⚽',
];

const COLORS = [
    '#70F2E0',
    '#FFCA4D',
    '#FF8A80',
    '#B9F6CA',
    '#82B1FF',
    '#EA80FC',
    '#FFD180',
    '#CCFF90',
];

interface GoalModalProps {
    visible: boolean;
    goal: Goal | null;       // null = create mode
    onSave: (goal: Goal) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
    nextId: number;
}

const GoalModal: React.FC<GoalModalProps> = ({ visible, goal, onSave, onDelete, onClose, nextId }) => {
    const [emoji, setEmoji]   = useState('🏠');
    const [name, setName]     = useState('');
    const [total, setTotal]   = useState('');
    const [saved, setSaved]   = useState('');
    const [color, setColor]   = useState(COLORS[0]);

    const scale = useRef(new Animated.Value(0)).current;
    const isEdit = goal !== null;

    // Sync form when modal opens
    useEffect(() => {
        if (visible) {
            if (goal) {
                setEmoji(goal.emoji);
                setName(goal.name);
                setTotal(String(goal.total));
                setSaved(String(goal.saved));
                setColor(goal.color);
            } else {
                setEmoji(EMOJIS[0]);
                setName('');
                setTotal('');
                setSaved('');
                setColor(COLORS[0]);
            }
            scale.setValue(0);
            Animated.spring(scale, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(scale, { toValue: 0, duration: 160, useNativeDriver: true })
            .start(onClose);
    };

    const handleSave = () => {
        const parsedTotal = parseFloat(total.replace(/[^0-9.]/g, ''));
        const parsedSaved = parseFloat(saved.replace(/[^0-9.]/g, '')) || 0;
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Por favor escribe un nombre para tu meta.');
            return;
        }
        if (isNaN(parsedTotal) || parsedTotal <= 0) {
            Alert.alert('Monto inválido', 'El costo total debe ser mayor a 0.');
            return;
        }
        const updated: Goal = {
            id: goal?.id ?? nextId,
            emoji,
            name: name.trim(),
            total: Math.round(parsedTotal),
            saved: Math.round(Math.min(parsedSaved, parsedTotal)),
            color,
        };
        onSave(updated);
        handleClose();
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar meta',
            `¿Eliminar "${goal?.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => { onDelete(goal!.id); handleClose(); } },
            ],
        );
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} />
                <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                    <Text style={styles.title}>{isEdit ? 'EDITAR META' : 'NUEVA META'}</Text>

                    {/* ── Emoji picker ── */}
                    <Text style={styles.sectionLabel}>ÍCONO</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.emojiScroll}
                        contentContainerStyle={styles.emojiScrollContent}
                    >
                        {EMOJIS.map((e) => (
                            <TouchableOpacity
                                key={e}
                                style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                                onPress={() => setEmoji(e)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.emojiTxt}>{e}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── Color picker ── */}
                    <Text style={styles.sectionLabel}>COLOR</Text>
                    <View style={styles.colorRow}>
                        {COLORS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                                onPress={() => setColor(c)}
                                activeOpacity={0.8}
                            />
                        ))}
                    </View>

                    {/* ── Name ── */}
                    <Text style={styles.sectionLabel}>NOMBRE</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Casa propia"
                        placeholderTextColor="rgba(5,72,77,0.35)"
                        maxLength={30}
                        returnKeyType="next"
                    />

                    {/* ── Amounts ── */}
                    <View style={styles.amountRow}>
                        <View style={styles.amountBlock}>
                            <Text style={styles.sectionLabel}>COSTO TOTAL</Text>
                            <View style={styles.amountInput}>
                                <Text style={styles.currency}>$</Text>
                                <TextInput
                                    style={styles.amountField}
                                    value={total}
                                    onChangeText={setTotal}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="rgba(5,72,77,0.35)"
                                    returnKeyType="next"
                                />
                            </View>
                        </View>
                        <View style={styles.amountBlock}>
                            <Text style={styles.sectionLabel}>YA TENGO</Text>
                            <View style={styles.amountInput}>
                                <Text style={styles.currency}>$</Text>
                                <TextInput
                                    style={styles.amountField}
                                    value={saved}
                                    onChangeText={setSaved}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="rgba(5,72,77,0.35)"
                                    returnKeyType="done"
                                    onSubmitEditing={handleSave}
                                />
                            </View>
                        </View>
                    </View>

                    {/* ── Actions ── */}
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                        <Text style={styles.saveTxt}>Guardar</Text>
                    </TouchableOpacity>

                    {isEdit && (
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
                            <Text style={styles.deleteTxt}>Eliminar meta</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
                        <Text style={styles.cancelTxt}>Cancelar</Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default GoalModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(5,72,77,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#D6F7FB',
        borderRadius: 32 * S,
        padding: 24 * S,
        width: SCREEN_WIDTH - 40 * S,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
    },
    title: {
        fontFamily: Fonts.One,
        fontSize: 20 * S,
        color: '#05484D',
        textAlign: 'center',
        marginBottom: 16 * S,
    },
    sectionLabel: {
        fontFamily: Fonts.Medium,
        fontSize: 10 * S,
        color: '#456063',
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 6 * S,
        marginTop: 12 * S,
    },

    // Emoji
    emojiScroll: { marginHorizontal: -4 * S },
    emojiScrollContent: { paddingHorizontal: 4 * S, gap: 6 * S },
    emojiBtn: {
        width: 40 * S,
        height: 40 * S,
        borderRadius: 12 * S,
        backgroundColor: 'rgba(0,103,93,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiBtnActive: {
        backgroundColor: '#03616C',
        shadowColor: '#03616C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    emojiTxt: { fontSize: 20 * S },

    // Color
    colorRow: { flexDirection: 'row', gap: 10 * S, flexWrap: 'wrap' },
    colorDot: {
        width: 28 * S,
        height: 28 * S,
        borderRadius: 14 * S,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorDotActive: {
        borderColor: '#05484D',
        transform: [{ scale: 1.2 }],
    },

    // Text input
    input: {
        backgroundColor: '#FFF',
        borderRadius: 14 * S,
        borderWidth: 2,
        borderColor: '#479C96',
        paddingHorizontal: 14 * S,
        paddingVertical: 10 * S,
        fontFamily: Fonts.One,
        fontSize: 16 * S,
        color: '#05484D',
    },

    // Amount row
    amountRow: { flexDirection: 'row', gap: 10 * S },
    amountBlock: { flex: 1 },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14 * S,
        borderWidth: 2,
        borderColor: '#479C96',
        paddingHorizontal: 10 * S,
        paddingVertical: 8 * S,
    },
    currency: {
        fontFamily: Fonts.One,
        fontSize: 18 * S,
        color: '#05484D',
        marginRight: 2 * S,
    },
    amountField: {
        flex: 1,
        fontFamily: Fonts.One,
        fontSize: 18 * S,
        color: '#05484D',
        padding: 0,
    },

    // Buttons
    saveBtn: {
        backgroundColor: '#03616C',
        borderRadius: 999,
        paddingVertical: 14 * S,
        alignItems: 'center',
        marginTop: 20 * S,
        borderBottomWidth: 4,
        borderBottomColor: '#005A51',
    },
    saveTxt: { fontFamily: Fonts.One, fontSize: 17 * S, color: '#FFF' },
    deleteBtn: {
        backgroundColor: 'rgba(179,27,37,0.08)',
        borderRadius: 999,
        paddingVertical: 10 * S,
        alignItems: 'center',
        marginTop: 8 * S,
        borderWidth: 1.5,
        borderColor: 'rgba(179,27,37,0.25)',
    },
    deleteTxt: { fontFamily: Fonts.One, fontSize: 14 * S, color: '#B31B25' },
    cancelBtn: { paddingVertical: 10 * S, alignItems: 'center', marginTop: 2 * S },
    cancelTxt: { fontFamily: Fonts.Regular, fontSize: 14 * S, color: '#456063' },
});
