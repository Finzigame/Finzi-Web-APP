import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

type PuntitoProps = {
    x: number;
    y: number;
    size?: number;
    delay?: number;
    color?: string;
};

function Puntito({
                     x,
                     y,
                     size = 3,
                     delay = 0,
                     color = "#FFD94A",
                 }: PuntitoProps) {
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 1200,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.10],
    });

    const scale = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.3],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: y,
                left: x,
                transform: [{ scale }],
                opacity,
            }}
        >
            <Svg width={size * 2} height={size * 2}>
                <Circle
                    cx={size}
                    cy={size}
                    r={size}
                    fill={color}
                />
            </Svg>
        </Animated.View>
    );
}

type Props = {
    cantidad?: number;
};

export default function Puntitos({ cantidad = 20 }: Props) {
    const puntos = Array.from({ length: cantidad }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 1.5,
        delay: Math.random() * 2000,
    }));

    return (
        <View style={StyleSheet.absoluteFill}>
            {puntos.map((p, i) => (
                <Puntito
                    key={i}
                    x={`${p.x}%` as any}
                    y={`${p.y}%` as any}
                    size={p.size}
                    delay={p.delay}
                />
            ))}
        </View>
    );
}
