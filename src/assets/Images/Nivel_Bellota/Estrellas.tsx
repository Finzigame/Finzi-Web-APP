import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
    size?: number;
    width?: number;
    height?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
    rotateDeg?: number; // ✅ nuevo
};

export default function Estrellita({
                                       size = 80,
                                       color = "#FFD94A",
                                       style,
                                   }: Props) {
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const scale = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.25],
    });

    const opacity = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.25, 0.75],
    });

    return (
        <Animated.View style={style}>
            {/* ✨ Glow */}
            <Animated.View
                style={{
                    position: "absolute",
                    transform: [{ scale }],
                    opacity,
                }}
            >
                <Svg width={size} height={size} viewBox="0 0 100 100">
                    <Path
                        d="
          M50 2
 M50 14
    C60 30 68 38 86 50
    C68 62 60 70 50 86
    C40 70 32 62 14 50
    C32 38 40 30 50 14
    Z
            "
                        fill={color}
                    />
                </Svg>
            </Animated.View>

            {/* ⭐ Estrella base */}
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Path
                    d="
            M50 6
            M50 14
                 C60 30 68 38 86 50
                 C68 62 60 70 50 86
                 C40 70 32 62 14 50
                 C32 38 40 30 50 14
                  Z
          "
                    fill={color}
                />
            </Svg>
        </Animated.View>
    );
}
