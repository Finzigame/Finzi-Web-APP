import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Fonts } from '../../Utils/Fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const S = SCREEN_WIDTH / 393;

export interface Goal {
    id: number;
    emoji: string;
    name: string;
    total: number;
    saved: number;
    color: string;
}

interface GoalCardProps {
    goal: Goal;
    index: number;
    onPress: () => void;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

const GoalCard: React.FC<GoalCardProps> = ({ goal, index, onPress }) => {
    const barTotal = SCREEN_WIDTH - 32 * S - 28 * S - 52 * S - 12 * S;
    const progress = goal.total > 0 ? Math.min(1, goal.saved / goal.total) : 0;
    const label = `META ${index + 1}`;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: goal.color }]}>
                <Text style={styles.emoji}>{goal.emoji}</Text>
            </View>
            <View style={styles.info}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.pct}>{Math.round(progress * 100)}%</Text>
                </View>
                <Text style={styles.name}>{goal.name}</Text>
                <View style={[styles.barBg, { width: barTotal }]}>
                    <View style={[styles.barFill, {
                        width: barTotal * progress,
                        backgroundColor: index === 0 ? '#00675D' : '#755700',
                    }]} />
                </View>
                <Text style={styles.amounts}>{fmt(goal.saved)} / {fmt(goal.total)}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default GoalCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F5F6F6',
        borderRadius: 24 * S,
        padding: 14 * S,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12 * S,
        marginBottom: 10 * S,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 4,
    },
    iconCircle: {
        width: 52 * S,
        height: 52 * S,
        borderRadius: 26 * S,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: { fontSize: 26 * S },
    info: { flex: 1 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontFamily: Fonts.One, fontSize: 15 * S, color: '#004068' },
    pct: { fontFamily: Fonts.One, fontSize: 15 * S, color: '#004068' },
    name: { fontFamily: Fonts.Regular, fontSize: 13 * S, color: '#04616C', marginBottom: 6 * S },
    barBg: { height: 14 * S, borderRadius: 7 * S, backgroundColor: '#BBE4E9' },
    barFill: { height: '100%', borderRadius: 7 * S },
    amounts: { fontFamily: Fonts.Regular, fontSize: 11 * S, color: '#456063', marginTop: 4 * S },
});
