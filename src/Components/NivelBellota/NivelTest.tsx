import React, { useMemo, useRef, useEffect } from 'react';
import { View, Pressable, Animated, Text, type ViewStyle, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Cerebrito from "../../assets/Images/Cerebro";
import Candado from '../../assets/Images/candado';

const { height: WINDOW_H } = Dimensions.get('window');

type EclipseTestProps = {
    levelId: string | number;
    size?: number;
    bottom?: number;
    left?: number;
    style?: ViewStyle;
    onPress?: (levelId: string | number) => void;
    unlocked?: boolean;
    completed?: boolean;
    zIndex?: number;
    scrollY?: Animated.Value;
    sectionIndex?: number;
    sectionHeight?: number;
    headerBottomY?: number;
};

const EclipseTest: React.FC<EclipseTestProps> = ({
    levelId,
    size = 100,
    bottom = 54,
    left = 47,
    style,
    onPress,
    unlocked = true,
    completed = false,
    zIndex = 6,
    scrollY,
    sectionIndex = 0,
    sectionHeight = 0,
    headerBottomY = 0,
}) => {
    const absoluteY = (sectionIndex * sectionHeight) + (sectionHeight - responsiveHeight(bottom));

    const { enterScale, enterOpacity, exitScale, exitOpacity } = useMemo(() => {
        if (!scrollY) return {
            enterScale: 1 as number | Animated.AnimatedInterpolation<number>,
            enterOpacity: 1 as number | Animated.AnimatedInterpolation<number>,
            exitScale: 1 as number | Animated.AnimatedInterpolation<number>,
            exitOpacity: 1 as number | Animated.AnimatedInterpolation<number>,
        };

        // Animación de entrada (pop-in desde abajo)
        const eScale = scrollY.interpolate({
            inputRange: [absoluteY - WINDOW_H, absoluteY - WINDOW_H + 150],
            outputRange: [0.5, 1],
            extrapolate: 'clamp',
        });
        const eOpacity = scrollY.interpolate({
            inputRange: [absoluteY - WINDOW_H, absoluteY - WINDOW_H + 100],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        // Animación de salida (pop-off al subir detrás del header)
        const clipStart = Math.max(0, absoluteY - headerBottomY - size * 1.8);
        const clipEnd = absoluteY - headerBottomY + size * 0.3;
        const xScale = scrollY.interpolate({
            inputRange: [clipStart, clipEnd],
            outputRange: [1, 0.3],
            extrapolate: 'clamp',
        });
        const xOpacity = scrollY.interpolate({
            inputRange: [clipStart, clipEnd],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return { enterScale: eScale, enterOpacity: eOpacity, exitScale: xScale, exitOpacity: xOpacity };
    }, [scrollY, absoluteY, headerBottomY, size]);

    const combinedOpacity = scrollY
        ? Animated.multiply(enterOpacity as Animated.AnimatedInterpolation<number>, exitOpacity as Animated.AnimatedInterpolation<number>)
        : 1;

    const combinedScale = scrollY
        ? Animated.multiply(enterScale as Animated.AnimatedInterpolation<number>, exitScale as Animated.AnimatedInterpolation<number>)
        : 1;

    // Animación de pulso para el resplandor (Glow)
    const pulseAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (unlocked || completed) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [unlocked, completed]);

    const glowOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    const glowScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.15],
    });

    const activeColors: [string, string, string] = completed
        ? ['#81C784', '#4CAF50', '#388E3C']
        : unlocked
        ? ['#FFF45C', '#FFC400', '#FF9F00']
        : ['#E0E0E0', '#9E9E9E', '#757575'];
    const borderColor = completed ? '#2E7D32' : unlocked ? '#FF8A00' : '#616161';

    const handlePress = () => {
        if (unlocked || completed) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress?.(levelId);
        }
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: combinedOpacity,
                    transform: [{ scale: combinedScale }],
                    position: 'absolute',
                    bottom: responsiveHeight(bottom),
                    left: responsiveWidth(left) - size / 2,
                    width: size,
                    height: size,
                    zIndex,
                },
                (unlocked || completed) && styles.glowEffect,
            ]}
        >
            <Pressable
                disabled={!unlocked && !completed}
                onPress={handlePress}
                hitSlop={12}
                style={({ pressed }) => [
                    {
                        width: size,
                        height: size,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                    style,
                ]}
            >
                <LinearGradient
                    pointerEvents="none"
                    colors={activeColors}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: size * 0.06,
                        borderColor: borderColor,
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />

                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        width: size * 0.65,
                        height: size * 0.80,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {completed ? (
                        <Text style={{ color: '#FFF', fontSize: size * 0.38, fontWeight: '700' }}>✓</Text>
                    ) : unlocked ? (
                        <Cerebrito width="100%" height="100%" />
                    ) : (
                        <Candado width="60%" height="60%" color="#FFF" />
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    glowEffect: {
        shadowColor: '#FFF45C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15,
    },
});

export default EclipseTest;
