import React from 'react';
import {
    Modal, View, Text, TouchableOpacity, ScrollView,
    StyleSheet, TouchableWithoutFeedback, Dimensions,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { LEVELS_CONFIG } from '../../Navigation/NavegacionJuegos/levelConfig';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type UnitItem = {
    unitKey: number;
    title: string;
    sublevels: { id: string; unlocked: boolean }[];
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelectLesson: (levelId: string) => void;
    unitList: UnitItem[];
    menuTop: number;
    accentColor?: string;
};

export default function LessonsMenuModal({
    visible,
    onClose,
    onSelectLesson,
    unitList,
    menuTop,
    accentColor = '#00646D',
}: Props) {
    const levelMap = Object.fromEntries(LEVELS_CONFIG.map(l => [l.id, l]));
    const sections = unitList.filter(u => u.sublevels.length > 0);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.panel, { top: menuTop }]}>
                            <View style={styles.panelHeader}>
                                <Text style={styles.panelTitle}>Acceso rápido</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text style={styles.closeBtn}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={{ maxHeight: SCREEN_HEIGHT * 0.52 }}
                                contentContainerStyle={{ paddingBottom: scale(4) }}
                            >
                                {sections.map(unit => (
                                    <View key={unit.unitKey}>
                                        <Text style={styles.sectionHeader}>
                                            Unidad {unit.unitKey} — {unit.title}
                                        </Text>
                                        {unit.sublevels.map((s, idx) => {
                                            const config = levelMap[s.id];
                                            return (
                                                <TouchableOpacity
                                                    key={s.id}
                                                    style={[
                                                        styles.lessonRow,
                                                        !s.unlocked && styles.lockedRow,
                                                    ]}
                                                    activeOpacity={s.unlocked ? 0.65 : 1}
                                                    onPress={() => {
                                                        if (!s.unlocked) return;
                                                        onSelectLesson(s.id);
                                                        onClose();
                                                    }}
                                                >
                                                    <View style={[
                                                        styles.badge,
                                                        { backgroundColor: s.unlocked ? accentColor : '#BDBDBD' },
                                                    ]}>
                                                        <Text style={styles.badgeText}>{idx + 1}</Text>
                                                    </View>
                                                    <Text
                                                        style={[styles.lessonTitle, !s.unlocked && styles.lockedText]}
                                                        numberOfLines={1}
                                                    >
                                                        {config?.title ?? s.id}
                                                    </Text>
                                                    {!s.unlocked && (
                                                        <Text style={styles.lockIcon}>🔒</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    panel: {
        position: 'absolute',
        left: scale(10),
        right: scale(10),
        backgroundColor: '#FFFFFF',
        borderRadius: scale(14),
        paddingHorizontal: scale(14),
        paddingBottom: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 8,
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: scale(12),
        paddingBottom: scale(8),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: scale(4),
    },
    panelTitle: {
        fontSize: scale(13),
        fontFamily: 'Fredoka-Medium',
        color: '#2D2D2D',
    },
    closeBtn: {
        fontSize: scale(12),
        color: '#9E9E9E',
        fontFamily: 'Fredoka-Regular',
    },
    sectionHeader: {
        fontSize: scale(10),
        color: '#9E9E9E',
        fontFamily: 'Fredoka-Regular',
        marginTop: scale(10),
        marginBottom: scale(4),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scale(9),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        gap: scale(10),
    },
    lockedRow: {
        opacity: 0.45,
    },
    badge: {
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: scale(10),
        color: '#FFFFFF',
        fontFamily: 'Fredoka-Medium',
    },
    lessonTitle: {
        flex: 1,
        fontSize: scale(12),
        color: '#2D2D2D',
        fontFamily: 'Fredoka-Regular',
    },
    lockedText: {
        color: '#9E9E9E',
    },
    lockIcon: {
        fontSize: scale(11),
    },
});
