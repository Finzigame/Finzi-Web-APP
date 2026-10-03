import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Easing } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Bellotita from "../assets/Images/Nivel_Bellota/Bellotita";
import { Fonts } from "../Utils/Fonts";

const TIPS = [
    "Ahorrar el 10% de tus ingresos es un gran comienzo.",
    "El interés compuesto es tu mejor amigo a largo plazo.",
    "No pongas todos tus huevos en la misma canasta.",
    "Tus deudas no deberían superar el 30% de lo que ganas.",
    "Un presupuesto te dice a dónde va tu dinero.",
];

export default function LoadingQuestion() {
    const fadeAnim   = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const squishX    = useRef(new Animated.Value(1)).current;
    const squishY    = useRef(new Animated.Value(1)).current;
    const shadowScale = useRef(new Animated.Value(1)).current;
    const dot1 = useRef(new Animated.Value(0.25)).current;
    const dot2 = useRef(new Animated.Value(0.25)).current;
    const dot3 = useRef(new Animated.Value(0.25)).current;

    const [tipIndex, setTipIndex] = React.useState(0);

    useEffect(() => {
        // Rotate tips
        const tipInterval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 3000);

        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
        }).start();

        // Bounce + squish + shadow loop
        Animated.loop(
            Animated.sequence([
                // Rise
                Animated.parallel([
                    Animated.timing(bounceAnim, {
                        toValue: -28,
                        duration: 420,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(shadowScale, {
                        toValue: 0.55,
                        duration: 420,
                        useNativeDriver: true,
                    }),
                    Animated.timing(squishX, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: true,
                    }),
                    Animated.timing(squishY, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: true,
                    }),
                ]),
                // Fall
                Animated.parallel([
                    Animated.timing(bounceAnim, {
                        toValue: 0,
                        duration: 380,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(shadowScale, {
                        toValue: 1,
                        duration: 380,
                        useNativeDriver: true,
                    }),
                ]),
                // Land squish
                Animated.parallel([
                    Animated.timing(squishX, {
                        toValue: 1.18,
                        duration: 90,
                        useNativeDriver: true,
                    }),
                    Animated.timing(squishY, {
                        toValue: 0.82,
                        duration: 90,
                        useNativeDriver: true,
                    }),
                ]),
                // Rebound
                Animated.parallel([
                    Animated.timing(squishX, {
                        toValue: 1,
                        duration: 130,
                        easing: Easing.out(Easing.back(2)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(squishY, {
                        toValue: 1,
                        duration: 130,
                        easing: Easing.out(Easing.back(2)),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(220),
            ])
        ).start();

        // Dots sequential pulse
        const dots = Animated.loop(
            Animated.sequence([
                Animated.timing(dot1, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(dot1, { toValue: 0.25, duration: 220, useNativeDriver: true }),
                Animated.timing(dot2, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(dot2, { toValue: 0.25, duration: 220, useNativeDriver: true }),
                Animated.timing(dot3, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(dot3, { toValue: 0.25, duration: 220, useNativeDriver: true }),
                Animated.delay(180),
            ])
        );
        dots.start();
        return () => {
            dots.stop();
            clearInterval(tipInterval);
        };
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.header} />

            <View style={styles.content}>
                {/* Bellota bouncing */}
                <View style={styles.bellotaArea}>
                    <Animated.View
                        style={{
                            transform: [
                                { translateY: bounceAnim },
                                { scaleX: squishX },
                                { scaleY: squishY },
                            ],
                        }}
                    >
                        <Bellotita width={scale(96)} height={verticalScale(110)} />
                    </Animated.View>

                    {/* Shadow under the bellota */}
                    <Animated.View
                        style={[
                            styles.shadow,
                            { transform: [{ scaleX: shadowScale }] },
                        ]}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.text}>Preparando pregunta</Text>
                    <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
                </View>

                {/* Dots */}
                <View style={styles.dotsRow}>
                    <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                    <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                    <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0C7E8A",
    },
    header: {
        width: "100%",
        height: responsiveHeight(12),
        backgroundColor: "#0D494F",
        borderBottomLeftRadius: scale(10),
        borderBottomRightRadius: scale(10),
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: responsiveHeight(6),
        gap: scale(18),
    },
    bellotaArea: {
        alignItems: "center",
        height: verticalScale(140),
        justifyContent: "flex-end",
    },
    shadow: {
        width: scale(64),
        height: verticalScale(14),
        borderRadius: scale(7),
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        marginTop: verticalScale(6),
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: scale(30),
        gap: scale(8),
    },
    text: {
        color: "#FFFFFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(22),
        opacity: 0.92,
        letterSpacing: 0.3,
    },
    tipText: {
        color: "#E0F7FA",
        fontFamily: Fonts.Regular,
        fontSize: moderateScale(16),
        textAlign: 'center',
        opacity: 0.85,
    },
    dotsRow: {
        flexDirection: "row",
        gap: scale(10),
    },
    dot: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        backgroundColor: "#FFFFFF",
    },
});

