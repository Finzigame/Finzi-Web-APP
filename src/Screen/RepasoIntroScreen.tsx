import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Props = {
    wrongCount: number;
    onStart: () => void;
};

export default function RepasoIntroScreen({ wrongCount, onStart }: Props) {
    const btnScale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => onStart());
    };

    const questionWord = wrongCount === 1 ? 'pregunta' : 'preguntas';

    return (
        <SafeAreaView style={styles.container}>
            {/* Fondo decorativo */}
            <View style={styles.topDecoration} />
            <View style={styles.bottomDecoration} />

            <View style={styles.content}>
                {/* Emoji / ícono */}
                <View style={styles.iconContainer}>
                    <Text style={styles.iconEmoji}>📚</Text>
                </View>

                {/* Título */}
                <Text style={styles.title}>¡Repaso!</Text>

                {/* Tarjeta de explicación */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {wrongCount === 1
                            ? 'Tuviste 1 respuesta incorrecta'
                            : `Tuviste ${wrongCount} respuestas incorrectas`}
                    </Text>
                    <Text style={styles.cardBody}>
                        Vamos a repasar {wrongCount === 1 ? 'esa' : 'esas'} {questionWord} antes de avanzar.
                    </Text>
                    <View style={styles.divider} />
                    <View style={styles.warningRow}>
                        <Text style={styles.warningIcon}>❤️</Text>
                        <Text style={styles.warningText}>
                            Tus vidas siguen en juego — ¡responde con cuidado!
                        </Text>
                    </View>
                    <View style={styles.warningRow}>
                        <Text style={styles.warningIcon}>🔒</Text>
                        <Text style={styles.warningText}>
                            Sin bellotas extra en el repaso.
                        </Text>
                    </View>
                </View>

                {/* Botón CTA */}
                <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handlePress}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.startButtonText}>¡Empezar repaso!</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#006E77',
    },
    topDecoration: {
        position: 'absolute',
        top: -SCREEN_W * 0.3,
        left: -SCREEN_W * 0.15,
        width: SCREEN_W * 1.3,
        height: SCREEN_W * 1.3,
        borderRadius: SCREEN_W * 0.65,
        backgroundColor: 'rgba(0, 100, 109, 0.5)',
    },
    bottomDecoration: {
        position: 'absolute',
        bottom: -SCREEN_W * 0.4,
        right: -SCREEN_W * 0.2,
        width: SCREEN_W * 1.2,
        height: SCREEN_W * 1.2,
        borderRadius: SCREEN_W * 0.6,
        backgroundColor: 'rgba(0, 80, 90, 0.4)',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(28),
    },
    iconContainer: {
        width: scale(88),
        height: scale(88),
        borderRadius: scale(44),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(16),
    },
    iconEmoji: {
        fontSize: scale(44),
    },
    title: {
        fontSize: scale(36),
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: verticalScale(20),
        letterSpacing: 0.5,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(20),
        paddingVertical: verticalScale(20),
        paddingHorizontal: scale(22),
        marginBottom: verticalScale(28),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
    cardTitle: {
        fontSize: scale(17),
        fontWeight: '700',
        color: '#004E55',
        marginBottom: verticalScale(6),
        textAlign: 'center',
    },
    cardBody: {
        fontSize: scale(14),
        color: '#444',
        textAlign: 'center',
        lineHeight: scale(20),
        marginBottom: verticalScale(14),
    },
    divider: {
        height: 1,
        backgroundColor: '#E8F0F1',
        marginBottom: verticalScale(12),
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: verticalScale(8),
        gap: scale(8),
    },
    warningIcon: {
        fontSize: scale(16),
        lineHeight: scale(20),
    },
    warningText: {
        flex: 1,
        fontSize: scale(13),
        color: '#555',
        lineHeight: scale(19),
    },
    startButton: {
        backgroundColor: '#FF8C00',
        borderRadius: moderateScale(16),
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        shadowColor: '#C05F00',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    startButtonText: {
        fontSize: scale(18),
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});
