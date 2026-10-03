import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type ButtonValue =
    | '7' | '8' | '9' | '/'
    | '4' | '5' | '6' | 'x'
    | '1' | '2' | '3' | '-'
    | '.' | '0' | '+' | '=';

const BUTTONS: ButtonValue[][] = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', 'x'],
    ['1', '2', '3', '-'],
    ['.', '0', '+', '='],
];

const C = {
    cardBg:     '#2e9aaa',
    cardBorder: '#1d6e7a',
    dispBg:     '#163e47',
    dispBorder: '#0e2a30',
    padBg:      '#2a8a99',
    padBorder:  '#1d6470',
    btnBg:      '#2fa8bc',
    btnBorder:  '#1d7080',
    eqBg:       '#f5a623',
    eqBorder:   '#b87010',
    confirmBg:  '#00D472',
    confirmBorder: '#0A6F43',
    text:       '#ffffff',
    delText:    '#80ccd8',
    disabledBg: '#1d6e7a',
};

function evaluate(expr: string): string {
    try {
        const sanitized = expr.replace(/x/g, '*');
        if (!/^[\d\s+\-*/.\s]+$/.test(sanitized)) return 'Error';
        const result = Function('"use strict"; return (' + sanitized + ')')();
        if (!isFinite(result) || isNaN(result)) return 'Error';
        return String(Math.round(result * 100) / 100);
    } catch {
        return 'Error';
    }
}

interface CalculatorProps {
    onSubmit: (answer: string) => void;
    disabled?: boolean;
}

const Calculator: React.FC<CalculatorProps> = ({ onSubmit, disabled = false }) => {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('');

    const handlePress = useCallback((value: ButtonValue) => {
        if (disabled) return;

        if (value === '=') {
            if (!expression) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const res = evaluate(expression);
            setResult(res);
            return;
        }

        Haptics.selectionAsync();
        setResult('');
        setExpression(prev => prev + value);
    }, [expression, disabled]);

    const handleDelete = useCallback(() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setResult('');
        setExpression(prev => prev.slice(0, -1));
    }, [disabled]);

    const handleClear = useCallback(() => {
        if (disabled) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setExpression('');
        setResult('');
    }, [disabled]);

    const handleConfirm = useCallback(() => {
        if (disabled || !result || result === 'Error') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onSubmit(result);
    }, [disabled, result, onSubmit]);

    const { width } = Dimensions.get('window');
    const CARD_BORDER = 4;
    const CARD_PAD    = 10;
    const PAD_BORDER  = 3;
    const PAD_PAD     = 8;
    const BTN_GAP     = 6;
    const BTN_ROW_GAP = 6;

    const cardWidth = Math.min(width * 0.88, 340);
    const availableForBtns =
        cardWidth - CARD_BORDER * 2 - CARD_PAD * 2 - PAD_BORDER * 2 - PAD_PAD * 2 - BTN_GAP * 3;
    const btnSize = Math.floor(availableForBtns / 4);

    const hasValidResult = result !== '' && result !== 'Error';

    return (
        <View style={[styles.card, { width: cardWidth, padding: CARD_PAD, borderWidth: CARD_BORDER }]}>

            {/* Display */}
            <View style={styles.display}>
                <View style={styles.exprRow}>
                    <Text style={styles.exprText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                        {expression || ' '}
                    </Text>
                    {expression.length > 0 && !disabled && (
                        <TouchableOpacity onPress={handleDelete} onLongPress={handleClear} activeOpacity={0.7}>
                            <Text style={styles.delText}>⌫</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text
                    style={[styles.resultText, result === 'Error' && styles.resultError]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                >
                    {result}
                </Text>
            </View>

            {/* Teclado */}
            <View style={[styles.keypad, { padding: PAD_PAD, borderWidth: PAD_BORDER, gap: BTN_ROW_GAP }]}>
                {BUTTONS.map((row, rIdx) => (
                    <View key={rIdx} style={[styles.row, { gap: BTN_GAP }]}>
                        {row.map(val => {
                            const isEq = val === '=';
                            return (
                                <TouchableOpacity
                                    key={`${rIdx}-${val}`}
                                    activeOpacity={0.75}
                                    onPress={() => handlePress(val)}
                                    disabled={disabled}
                                    style={[
                                        styles.btn,
                                        {
                                            width:           btnSize,
                                            height:          btnSize,
                                            borderRadius:    btnSize * 0.28,
                                            backgroundColor: disabled ? C.disabledBg : isEq ? C.eqBg : C.btnBg,
                                            borderColor:     isEq ? C.eqBorder : C.btnBorder,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.btnText, { fontSize: btnSize * 0.38 }]}>
                                        {val}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* Botón Confirmar */}
            {hasValidResult && (
                <TouchableOpacity
                    style={[styles.confirmBtn, disabled && styles.confirmBtnDisabled]}
                    onPress={handleConfirm}
                    disabled={disabled}
                    activeOpacity={0.85}
                >
                    <Text style={styles.confirmText}>Confirmar respuesta: {result}</Text>
                </TouchableOpacity>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: C.cardBg,
        borderRadius: 26,
        borderColor: C.cardBorder,
    },
    display: {
        backgroundColor: C.dispBg,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: C.dispBorder,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        marginBottom: 8,
        minHeight: 90,
        justifyContent: 'space-between',
    },
    exprRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    exprText: {
        flex: 1,
        color: C.text,
        fontSize: 20,
        fontWeight: '800',
    },
    resultText: {
        color: C.text,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'right',
        marginTop: 4,
    },
    resultError: {
        color: '#F05050',
    },
    delText: {
        color: C.delText,
        fontSize: 18,
        marginLeft: 8,
    },
    keypad: {
        backgroundColor: C.padBg,
        borderRadius: 18,
        borderColor: C.padBorder,
    },
    row: {
        flexDirection: 'row',
    },
    btn: {
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: C.text,
        fontWeight: '800',
    },
    confirmBtn: {
        marginTop: 10,
        backgroundColor: C.confirmBg,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: C.confirmBorder,
        paddingVertical: 12,
        alignItems: 'center',
    },
    confirmBtnDisabled: {
        opacity: 0.4,
    },
    confirmText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
});

export default Calculator;
