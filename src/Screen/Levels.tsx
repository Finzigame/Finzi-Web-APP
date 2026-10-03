import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Animated,
    Easing,
    Alert,
    Text,
} from 'react-native';

import FondoPrincipal from '../assets/Images/fondoprincipal';
import BottomNav from '../Components/Bottom_Navigator';
import Nubes from '../assets/Images/nubes';
import FondoAzul from '../assets/Images/fondoazul';
import Nubes2 from '../assets/Images/nubes2';
import HOJA_VERDE_IMAGE from '../assets/Images/hojaverde';
import TopBar from '../Components/TopBar';
import { useGame } from '../api/context/GameContext';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { scale } from 'react-native-size-matters';
import * as Haptics from 'expo-haptics';

import PathnNew from '../assets/Images/fondo_principal/pathnew';
import BotonBellotaNew from '../assets/Images/fondo_principal/boton_bellotanew';
import BotonBellotadorada from '../assets/Images/fondo_principal/boton_bellotadorada';
import BotonArbolavanzado from '../assets/Images/fondo_principal/boton_arbolavanzado';
import BotonArbolfinanciero from '../assets/Images/fondo_principal/boton_arbolfinanciero';
import Candado from '../assets/Images/candado';
import SoundManager from '../Utils/SoundManager';

interface LevelsProps {
    onBackToSettings: () => void;
    onGoToProfile: () => void;
    onGoToNivelBellota: () => void;
    onGoToArbolFinanciero?: () => void;
    onGoToAgendita?: () => void;
    onGoToLivesShop?: () => void;
}

const Levels: React.FC<LevelsProps> = ({ onGoToProfile, onBackToSettings, onGoToNivelBellota, onGoToArbolFinanciero, onGoToAgendita, onGoToLivesShop }) => {
    const { score, lives } = useGame();

    const [bellotaTooltipVisible, setBellotaTooltipVisible] = useState(false);
    const tooltipScale = useRef(new Animated.Value(0.6)).current;
    const tooltipOpacity = useRef(new Animated.Value(0)).current;

    const showBellotaTooltip = () => {
        Haptics.selectionAsync();
        SoundManager.play('tap_primary');
        tooltipScale.setValue(0.6);
        tooltipOpacity.setValue(0);
        setBellotaTooltipVisible(true);
        Animated.parallel([
            Animated.spring(tooltipScale, { toValue: 1, tension: 100, friction: 7, useNativeDriver: true }),
            Animated.timing(tooltipOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
    };

    const hideBellotaTooltip = () => {
        Animated.parallel([
            Animated.timing(tooltipScale, { toValue: 0.8, duration: 120, useNativeDriver: true }),
            Animated.timing(tooltipOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start(() => setBellotaTooltipVisible(false));
    };

    const confirmBellotaPress = () => {
        hideBellotaTooltip();
        setTimeout(() => onGoToNivelBellota(), 130);
    };

    const showComingSoonAlert = (title: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        SoundManager.play('world_locked');
        Alert.alert(title, '¡Sigue avanzando para desbloquear este mundo!');
    };

    const handleWorldPress = (target: () => void, title: string, isLocked: boolean) => {
        if (isLocked) {
            showComingSoonAlert(title);
            return;
        }
        target();
    };

    const btn1Scale = useRef(new Animated.Value(0.55)).current;
    const btn1Opacity = useRef(new Animated.Value(0)).current;
    const btn2Scale = useRef(new Animated.Value(0.5)).current;
    const btn2Opacity = useRef(new Animated.Value(0)).current;
    const btn3Scale = useRef(new Animated.Value(0.5)).current;
    const btn3Opacity = useRef(new Animated.Value(0)).current;
    const btn4Scale = useRef(new Animated.Value(0.5)).current;
    const btn4Opacity = useRef(new Animated.Value(0)).current;

    const seg1H = useRef(new Animated.Value(0)).current;
    const seg2H = useRef(new Animated.Value(0)).current;
    const seg3H = useRef(new Animated.Value(0)).current;

    const PATH_TOP = responsiveHeight(29.6);
    const PATH_LEFT = responsiveWidth(18.8);

    const popIn = (scale: Animated.Value, opacity: Animated.Value, targetScale: number, delay: number) => {
        setTimeout(() => {
            Animated.parallel([
                Animated.spring(scale, { toValue: targetScale, tension: 90, friction: 6, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
        }, delay);
    };

    useEffect(() => {
        popIn(btn4Scale, btn4Opacity, 0.9, 60);
        popIn(btn3Scale, btn3Opacity, 0.9, 160);
        popIn(btn2Scale, btn2Opacity, 0.9, 260);
        popIn(btn1Scale, btn1Opacity, 1, 360);

        const revealSeg = (val: Animated.Value, toValue: number, delay: number) =>
            setTimeout(() => {
                Animated.timing(val, { toValue, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
            }, delay);

        revealSeg(seg1H, 140, 120);
        revealSeg(seg2H, 122, 380);
        revealSeg(seg3H, 150, 620);
    }, []);

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.backgroundContainer}>
                    <FondoPrincipal />
                </View>

                <FondoAzul
                    width={responsiveWidth(116.28)}
                    height={responsiveHeight(26.82)}
                    style={styles.fondoAzul}
                />

                <TopBar score={score} lives={lives} onProfilePress={onGoToProfile} onSettingsPress={onBackToSettings} onLivesPress={onGoToLivesShop} />

                <View style={styles.nubes}><Nubes /></View>
                <View style={styles.nubes2}><Nubes2 /></View>
                <View style={styles.hojaverde}><HOJA_VERDE_IMAGE /></View>

                {/* Path segments */}
                <Animated.View style={{ position: 'absolute', left: PATH_LEFT, top: PATH_TOP, width: 230, height: seg1H, overflow: 'hidden', zIndex: 3 }}>
                    <PathnNew width={230} height={405} opacity={0.5} />
                </Animated.View>

                <Animated.View style={{ position: 'absolute', left: PATH_LEFT, top: PATH_TOP + 140, width: 230, height: seg2H, overflow: 'hidden', zIndex: 3 }}>
                    <View style={{ marginTop: -140 }}>
                        <PathnNew width={230} height={405} opacity={0.4} />
                    </View>
                </Animated.View>

                <Animated.View style={{ position: 'absolute', left: PATH_LEFT, top: PATH_TOP + 262, width: 230, height: seg3H, overflow: 'hidden', zIndex: 3 }}>
                    <View style={{ marginTop: -262 }}>
                        <PathnNew width={230} height={405} opacity={0.3} />
                    </View>
                </Animated.View>

                {bellotaTooltipVisible && (
                    <TouchableOpacity style={[StyleSheet.absoluteFill, { zIndex: 50 }]} activeOpacity={1} onPress={hideBellotaTooltip} />
                )}

                {/* Mundo 1: Bellota (ACTIVO) */}
                <Animated.View style={[styles.bellotaContainer, { opacity: btn1Opacity, transform: [{ scale: btn1Scale }] }]}>
                    {bellotaTooltipVisible && (
                        <Animated.View style={[styles.tooltipBubble, { opacity: tooltipOpacity, transform: [{ scale: tooltipScale }] }]}>
                            <Text style={styles.tooltipTitle}>Bellota</Text>
                            <TouchableOpacity style={styles.tooltipButton} onPress={confirmBellotaPress} activeOpacity={0.8}>
                                <Text style={styles.tooltipButtonText}>Continuar</Text>
                            </TouchableOpacity>
                            <View style={styles.tooltipTail} />
                        </Animated.View>
                    )}
                    <TouchableOpacity onPress={() => handleWorldPress(onGoToNivelBellota, 'Bellota', false)} activeOpacity={0.85}>
                        <BotonBellotaNew width={104} height={101} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Mundos Bloqueados */}
                <Animated.View style={[styles.nuezLevel, { opacity: btn2Opacity, transform: [{ scale: btn2Scale }] }]}>
                    <TouchableOpacity onPress={() => handleWorldPress(() => { }, 'Nuez Dorada', true)} activeOpacity={1}>
                        <View style={styles.lockedContainer}>
                            <BotonBellotadorada width={106} height={106} />
                            <View style={styles.lockedOverlay} />
                            <View style={styles.lockIconContainer}>
                                <Candado width={35} height={35} color="#455A64" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.arbolAvanzadoLevel, { opacity: btn3Opacity, transform: [{ scale: btn3Scale }] }]}>
                    <TouchableOpacity onPress={() => handleWorldPress(() => { }, 'Árbol Avanzado', true)} activeOpacity={1}>
                        <View style={styles.lockedContainer}>
                            <BotonArbolavanzado width={108} height={113} />
                            <View style={styles.lockedOverlay} />
                            <View style={styles.lockIconContainer}>
                                <Candado width={35} height={35} color="#455A64" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Árbol Financiero (ACTIVO para el piloto) */}
                <Animated.View style={[styles.arbolFinancieroLevel, { opacity: btn4Opacity, transform: [{ scale: btn4Scale }] }]}>
                    <TouchableOpacity onPress={() => handleWorldPress(onGoToArbolFinanciero ?? (() => {}), 'Árbol Financiero', false)} activeOpacity={0.85}>
                        <BotonArbolfinanciero width={100} height={109} />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <BottomNav onBackToSettings={onBackToSettings} onGoToLevels={() => { }} onGoToAgendita={onGoToAgendita} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#00D4FF' },
    backgroundContainer: { position: 'absolute', width: '120%', height: '110%', top: 10, left: '-13%', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
    fondoAzul: { position: 'absolute', left: responsiveWidth(-14), top: responsiveHeight(75), zIndex: 2 },
    nubes: { position: 'absolute', left: responsiveWidth(11.63), top: responsiveHeight(14), zIndex: 2 },
    nubes2: { position: 'absolute', left: responsiveWidth(69.77), top: responsiveHeight(15), zIndex: 2 },
    hojaverde: { position: 'absolute', left: responsiveWidth(4.65), top: responsiveHeight(83), zIndex: 999 },
    bellotaContainer: { position: 'absolute', left: responsiveWidth(60.3), top: responsiveHeight(29), zIndex: 60, alignItems: 'center' },
    nuezLevel: { position: 'absolute', left: responsiveWidth(19.1), top: responsiveHeight(43.4), zIndex: 5 },
    arbolAvanzadoLevel: { position: 'absolute', left: responsiveWidth(50.4), top: responsiveHeight(56.1), zIndex: 5 },
    arbolFinancieroLevel: { position: 'absolute', left: responsiveWidth(18.3), top: responsiveHeight(68.3), zIndex: 5 },
    tooltipBubble: { position: 'absolute', bottom: 110, width: 200, left: (104 - 200) / 2, backgroundColor: '#5BA8B5', borderRadius: scale(14), paddingVertical: scale(12), paddingHorizontal: scale(20), alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 20, zIndex: 100, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)' },
    tooltipTail: { width: 0, height: 0, borderLeftWidth: scale(12), borderRightWidth: scale(12), borderTopWidth: scale(14), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#5BA8B5', position: 'absolute', bottom: -scale(13), alignSelf: 'center' },
    tooltipTitle: { fontSize: scale(18), fontWeight: '800', color: '#fff', marginBottom: scale(10), letterSpacing: 0.3 },
    tooltipButton: { backgroundColor: '#7CC8D4', borderRadius: scale(20), paddingVertical: scale(7), paddingHorizontal: scale(30), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3, alignSelf: 'stretch', alignItems: 'center' },
    tooltipButtonText: { color: '#fff', fontWeight: '700', fontSize: scale(14), textAlign: 'center' },
    lockedContainer: { alignItems: 'center', justifyContent: 'center' },
    lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: scale(50), borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 10 },
    lockIconContainer: { position: 'absolute', zIndex: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: scale(20), padding: scale(5), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
});

export default Levels;