import React, { useContext, useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    ScrollView,
    Dimensions,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';
import { Fonts } from "../Utils/Fonts";
import { useGame } from "../api/context/GameContext";
import { AuthContext } from "../api/context/AuthContext";
import { purchaseLives } from "../api/users";
import { DEV_USER_ID, USE_DEV_USER } from "../api/config/env";
import Fondo_finzi from "../assets/Images/Fondo_finzi";
import Bellotita from "../assets/Images/Nivel_Bellota/Bellotita";

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HEART_SOURCE = require('../assets/icons/corazon.png');

function formatCountdown(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

interface LivesShopScreenProps {
    onBack: () => void;
}

const LivesShopScreen: React.FC<LivesShopScreenProps> = ({ onBack }) => {
    const { lives, maxLives, secondsUntilNextLife, score, setScore, refreshLives } = useGame();
    const { session } = useContext(AuthContext);
    const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;

    const [loading, setLoading] = useState<1 | 4 | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.8)).current;
    const btn1Y = useRef(new Animated.Value(50)).current;
    const btn2Y = useRef(new Animated.Value(50)).current;
    const btn3Y = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(cardScale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
        ]).start();

        const animateBtn = (val: Animated.Value, delay: number) => {
            Animated.timing(val, {
                toValue: 0,
                duration: 400,
                delay,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }).start();
        };

        animateBtn(btn1Y, 200);
        animateBtn(btn2Y, 300);
        animateBtn(btn3Y, 400);
    }, []);

    const atMax = lives >= maxLives;

    const handlePurchase = async (quantity: 1 | 4) => {
        if (!userId || atMax || loading !== null) return;
        
        // Haptic inicial
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        setError(null);
        setLoading(quantity);
        try {
            const res = await purchaseLives(userId, quantity);
            if (typeof res.bellotas_balance === "number") setScore(res.bellotas_balance);
            await refreshLives();
            
            // Haptic de éxito
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: unknown) {
            // Haptic de error
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
            const msg = e instanceof Error ? e.message : "Error al comprar";
            if (msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("bellotas")) {
                setError("No tienes suficientes bellotas 🌰");
            } else if (msg.toLowerCase().includes("max")) {
                setError("Ya tienes las vidas al máximo");
            } else {
                setError("Ocurrió un error, intenta de nuevo");
            }
        } finally {
            setLoading(null);
        }
    };

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                <Fondo_finzi width={width} height={SCREEN_HEIGHT} />
            </View>

            <SafeAreaView style={styles.safe}>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Header con Saldo */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backIconButton} onPress={onBack}>
                            <Text style={styles.backIconText}>✕</Text>
                        </TouchableOpacity>
                        <View style={styles.balanceTag}>
                            <Text style={styles.balanceText}>{score} 🌰</Text>
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Título Principal */}
                        <Text style={styles.title}>Tienda de Vidas</Text>

                        {/* Tarjeta de Vidas (Flotante) */}
                        <Animated.View style={[styles.livesCard, { transform: [{ scale: cardScale }] }]}>
                            <View style={styles.heartsContainer}>
                                {Array.from({ length: maxLives }).map((_, i) => (
                                    <Image
                                        key={i}
                                        source={HEART_SOURCE}
                                        style={[styles.heartIcon, { opacity: i < lives ? 1 : 0.25 }]}
                                        resizeMode="contain"
                                    />
                                ))}
                            </View>
                            
                            <Text style={styles.livesHeroText}>{lives}/{maxLives}</Text>
                            
                            {!atMax && secondsUntilNextLife !== null ? (
                                <View style={styles.timerContainer}>
                                    <Text style={styles.nextLifeLabel}>Próxima vida en:</Text>
                                    <Text style={styles.countdownText}>{formatCountdown(secondsUntilNextLife)}</Text>
                                </View>
                            ) : (
                                <Text style={styles.fullLabel}>¡Energía al máximo!</Text>
                            )}
                        </Animated.View>

                        {/* Banner de Error */}
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.optionsContainer}>
                            {/* Opción 1 Vida */}
                            <Animated.View style={{ transform: [{ translateY: btn1Y }] }}>
                                <TouchableOpacity
                                    style={[styles.btn3D, styles.btnSecondary, atMax && styles.btnDisabled]}
                                    onPress={() => handlePurchase(1)}
                                    disabled={atMax || loading !== null}
                                >
                                    <View style={[styles.btn3DInner, styles.btnSecondaryInner]}>
                                        <Text style={styles.btnLabel}>+1 Vida</Text>
                                        {loading === 1 ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <View style={styles.costTag}>
                                                <Text style={styles.costText}>40 🌰</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Opción 4 Vidas (Popular) */}
                            <Animated.View style={{ transform: [{ translateY: btn2Y }] }}>
                                <TouchableOpacity
                                    style={[styles.btn3D, styles.btnPrimary, atMax && styles.btnDisabled]}
                                    onPress={() => handlePurchase(4)}
                                    disabled={atMax || loading !== null}
                                >
                                    <View style={styles.bestValueBadge}>
                                        <Text style={styles.bestValueText}>MEJOR VALOR</Text>
                                    </View>
                                    <View style={[styles.btn3DInner, styles.btnPrimaryInner]}>
                                        <Text style={styles.btnLabel}>Rellenar Vidas</Text>
                                        {loading === 4 ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <View style={styles.costTag}>
                                                <Text style={styles.costText}>150 🌰</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Opción Anuncio */}
                            <Animated.View style={{ transform: [{ translateY: btn3Y }] }}>
                                <TouchableOpacity style={[styles.btnAd]} activeOpacity={0.8}>
                                    <Text style={styles.adLabel}>Recuperar gratis</Text>
                                    <Text style={styles.adReward}>Ver un anuncio 📺</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        <TouchableOpacity style={styles.footerBackBtn} onPress={onBack}>
                            <Text style={styles.footerBackText}>Quizás luego</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

export default LivesShopScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#00646D",
    },
    safe: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(10),
    },
    backIconButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIconText: {
        color: '#FFF',
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    balanceTag: {
        backgroundColor: '#0D494F',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(6),
        borderRadius: scale(20),
        borderWidth: 1.5,
        borderColor: '#1DE9B6',
    },
    balanceText: {
        color: '#FFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
    },
    scroll: {
        paddingHorizontal: scale(24),
        paddingBottom: verticalScale(40),
    },
    title: {
        color: "#FFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(32),
        textAlign: "center",
        marginTop: verticalScale(20),
        marginBottom: verticalScale(30),
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    livesCard: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: scale(30),
        padding: scale(30),
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.2)",
        marginBottom: verticalScale(35),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heartsContainer: {
        flexDirection: 'row',
        gap: scale(8),
        marginBottom: verticalScale(15),
    },
    heartIcon: {
        width: scale(32),
        height: scale(28),
    },
    livesHeroText: {
        color: '#FFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(48),
        marginBottom: verticalScale(10),
    },
    timerContainer: {
        alignItems: 'center',
    },
    nextLifeLabel: {
        color: "rgba(255,255,255,0.7)",
        fontFamily: Fonts.Medium,
        fontSize: moderateScale(14),
    },
    countdownText: {
        color: "#1DE9B6",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(20),
    },
    fullLabel: {
        color: "#FFD54F",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(18),
    },
    optionsContainer: {
        gap: verticalScale(20),
    },
    // Botones 3D
    btn3D: {
        height: verticalScale(70),
        borderRadius: scale(20),
    },
    btn3DInner: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        borderRadius: scale(20),
        borderBottomWidth: 6,
    },
    btnSecondary: {
        backgroundColor: '#00838F',
    },
    btnSecondaryInner: {
        backgroundColor: '#00ACC1',
        borderColor: '#00838F',
    },
    btnPrimary: {
        backgroundColor: '#F57C00',
    },
    btnPrimaryInner: {
        backgroundColor: '#FFA000',
        borderColor: '#F57C00',
    },
    btnLabel: {
        color: '#FFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(20),
    },
    costTag: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    costText: {
        color: '#FFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(18),
    },
    bestValueBadge: {
        position: 'absolute',
        top: -verticalScale(12),
        right: scale(20),
        backgroundColor: '#FFEB3B',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(10),
        zIndex: 10,
        transform: [{ rotate: '5deg' }],
    },
    bestValueText: {
        color: '#E65100',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(12),
    },
    btnDisabled: {
        opacity: 0.4,
    },
    btnAd: {
        alignItems: 'center',
        paddingVertical: verticalScale(15),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
        borderRadius: scale(20),
    },
    adLabel: {
        color: '#FFF',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
    },
    adReward: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: Fonts.Regular,
        fontSize: moderateScale(14),
    },
    errorBanner: {
        backgroundColor: "rgba(255,82,82,0.2)",
        borderRadius: scale(15),
        padding: scale(15),
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    errorText: {
        color: "#FFCDD2",
        fontFamily: Fonts.Medium,
        fontSize: moderateScale(14),
        textAlign: "center",
    },
    footerBackBtn: {
        marginTop: verticalScale(30),
        alignItems: 'center',
    },
    footerBackText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(16),
        textDecorationLine: 'underline',
    },
});

