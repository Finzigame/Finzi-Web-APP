import React, { useMemo } from 'react';
import { View, Pressable, Animated, Text, type ViewStyle, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Bellotita from '../../assets/Images/Nivel_Bellota/Bellotita';
import Candado from '../../assets/Images/candado';

const { height: WINDOW_H } = Dimensions.get('window');

type EclipseCirclesProps = {
    levelId: string | number;
    size?: number;
    bottom?: number;
    left?: number;
    style?: ViewStyle;
    onPress?: (levelId: string | number) => void;
    unlocked?: boolean;
    completed?: boolean;
    failed?: boolean;
    zIndex?: number;
    scrollY?: Animated.Value;
    sectionIndex?: number;
    sectionHeight?: number;
    headerBottomY?: number;
};

const EclipseCircles: React.FC<EclipseCirclesProps> = ({
    levelId,
    size = 100,
    bottom = 12,
    left = 50,
    style,
    onPress,
    unlocked = true,
    completed = false,
    failed = false,
    zIndex = 1000,
    scrollY,
    sectionIndex = 0,
    sectionHeight = 0,
    headerBottomY = 0,
}) => {
    const offset = size * 0.08;

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
        // Clampeado a 0 para que el primer nodo no aparezca ya reducido en scroll=0
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

    const mainColor = failed ? '#E53935' : completed ? '#6DBF8A' : unlocked ? '#FEC20A' : '#9E9E9E';
    const shadowColor = failed ? '#B71C1C' : completed ? '#3A8F5A' : unlocked ? '#FF8900' : '#757575';

    const handlePress = () => {
        if (unlocked || completed || failed) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress?.(levelId);
        }
    };

    return (
        <Animated.View
            style={{
                opacity: combinedOpacity,
                transform: [{ scale: combinedScale }],
                position: 'absolute',
                bottom: responsiveHeight(bottom),
                left: responsiveWidth(left) - size / 2,
                width: size,
                height: size,
                zIndex,
            }}
        >
            <Pressable
                disabled={!unlocked && !completed && !failed}
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
                <View
                    pointerEvents="none"
                    style={{
                        backgroundColor: shadowColor,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        position: 'absolute',
                        top: offset,
                    }}
                />

                <View
                    pointerEvents="none"
                    style={{
                        backgroundColor: mainColor,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        position: 'absolute',
                        elevation: 8,
                        shadowColor: shadowColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                    }}
                />

                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {failed ? (
                        <Text style={{ color: '#FFF', fontSize: size * 0.42, fontWeight: '700' }}>✗</Text>
                    ) : completed ? (
                        <Text style={{ color: '#FFF', fontSize: size * 0.42, fontWeight: '700' }}>✓</Text>
                    ) : unlocked ? (
                        <Bellotita width={size * 2.3} height={size * 2.3} />
                    ) : (
                        <Candado width={size * 0.48} height={size * 0.48} color="#FFF" />
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default EclipseCircles;
