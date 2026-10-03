import React from "react";
import { TouchableOpacity, View, Alert, StyleSheet, Dimensions, Image } from "react-native";
import SoundManager from "../Utils/SoundManager";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const NAVBAR_H = 76;
const SCALE = SCREEN_WIDTH / 393;
const NAVBAR_HEIGHT = NAVBAR_H * SCALE;

// iconos
const NAV_ICONS = [
    {
        source: require('../assets/icons/nav_inicio.png'),
        width: 44 * SCALE,
        height: 43 * SCALE,
        left: 56 * SCALE,
        label: "Inicio",
        active: true,
    },
    {
        source: require('../assets/icons/nav_tienda.png'),
        width: 48 * SCALE,
        height: 48 * SCALE,
        left: 132 * SCALE,
        label: "Tienda",
        active: false,
    },
    {
        source: require('../assets/icons/nav_comunidad.png'),
        width: 43 * SCALE,
        height: 46 * SCALE,
        left: 206 * SCALE,
        label: "Comunidad",
        active: false,
    },
    {
        source: require('../assets/icons/nav_tareas.png'),
        width: 46 * SCALE,
        height: 43 * SCALE,
        left: 275 * SCALE,
        label: "Tareas",
        active: false,
    },
    {
        source: require('../assets/icons/nav_notas.png'),
        width: 48 * SCALE,
        height: 44 * SCALE,
        left: 350 * SCALE,
        label: "Notas",
        active: true,
    },
];

type Props = {
    onBackToSettings: () => void;
    onGoToLevels?: () => void;
    onGoToAgendita?: () => void;
    showComingSoonAlert?: (label: string) => void;
};

const BottomNav: React.FC<Props> = ({
    onBackToSettings,
    onGoToLevels,
    onGoToAgendita,
    showComingSoonAlert = (label: string) =>
        Alert.alert(label, "Aún no hay nada aquí", [{ text: "OK", onPress: () => { } }]),
}) => {
    const handlers = [
        () => { SoundManager.play('tab_tap'); onGoToLevels ? onGoToLevels() : showComingSoonAlert("Inicio"); },
        () => { /* Bloqueado */ },
        () => { /* Bloqueado */ },
        () => { /* Bloqueado */ },
        () => { SoundManager.play('tab_tap'); onGoToAgendita ? onGoToAgendita() : onBackToSettings(); },
    ];

    return (
        <View style={styles.wrapper}>
            {/* fondo azul */}
            <View style={styles.background} />
            <View style={styles.topBorder} />

            {/* iconos */}
            {NAV_ICONS.map((icon, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={handlers[index]}
                    style={[
                        styles.iconButton,
                        {
                            left: icon.left - icon.width / 2,
                            top: (NAVBAR_HEIGHT - icon.height) / 2,
                            width: icon.width,
                            height: icon.height,
                            opacity: icon.active ? 1 : 0.45, // Grisar si no está activo
                        },
                    ]}
                    activeOpacity={icon.active ? 0.7 : 1}
                    disabled={!icon.active}
                >
                    <Image
                        source={icon.source}
                        style={[
                            { width: icon.width, height: icon.height },
                            !icon.active && { tintColor: 'gray' } // Efecto gris para el Piloto
                        ]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default BottomNav;

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: NAVBAR_HEIGHT,
        zIndex: 999,
        elevation: 999,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#4CBCDB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 8,
    },
    topBorder: {
        position: "absolute",
        top: -2,
        left: 0,
        right: 0,
        height: 7,
        backgroundColor: "#0A838D",
    },
    iconButton: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
});
