import React, { useContext, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Dimensions,
    StyleProp,
    ViewStyle,
    Image,
} from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { Fonts } from "../Utils/Fonts";
import SoundManager from "../Utils/SoundManager";
import { useGame } from "../api/context/GameContext";
import { AuthContext } from "../api/context/AuthContext";
import { DEV_USER_ID, USE_DEV_USER } from "../api/config/env";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SVG_W = 406;
const SVG_H = 140;
const S = SCREEN_WIDTH / SVG_W;
const TOPBAR_HEIGHT = SVG_H * S;

const sx = (v: number) => Math.round(v * S);
const sy = (v: number) => Math.round(v * S);


const DARK_BG_PX = 160;


const BAR_TOP = 20;

const TealBackground = () => (
    <Svg
        width={SCREEN_WIDTH}
        height={TOPBAR_HEIGHT}
        viewBox={`0 0 406 ${SVG_H}`}
    >
        {/*   */}
        <Path
            d="M40 24.5H144.555C149.93 24.5 155.066 26.7187 158.751 30.6318L179.818 53.0039C188.622 62.3526 203.451 62.4495 212.376 53.2168L234.388 30.4473C238.062 26.6466 243.121 24.5001 248.407 24.5H357C367.77 24.5 376.5 33.2304 376.5 44V89C376.5 99.7696 367.77 108.5 357 108.5H40C29.2304 108.5 20.5 99.7696 20.5 89V44L20.5068 43.4971C20.7736 32.96 29.3986 24.5 40 24.5Z"
            fill="#0195A5"
            stroke="#02858D"
            strokeWidth={3}
        />

        {/*     */}
        <Rect
            x={31.5} y={33.5}
            width={116} height={29}
            rx={14.5}
            fill="#2B979C"
            stroke="#0D616E"
            strokeWidth={3}
        />

        {/* racha fondo */}
        <Rect
            x={31.5} y={70.5}
            width={84} height={29}
            rx={14.5}
            fill="#2B979C"
            stroke="#0D616E"
            strokeWidth={3}
        />

        {/*   */}
        <Rect
            x={243.5} y={34.5}
            width={123} height={28}
            rx={14}
            fill="#2B979C"
            stroke="#0D616E"
            strokeWidth={3}
        />

        {/* circulo oscuro perfil */}
        <Circle cx={199.5} cy={72.5} r={30.5} fill="#0D616E" />
    </Svg>
);

function formatCountdown(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

interface TopBarProps {
    score?: number;
    lives?: number;
    streak?: number;
    onProfilePress?: () => void;
    onSettingsPress?: () => void;
    onLivesPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
}

const TopBar: React.FC<TopBarProps> = ({
    score = 0,
    onProfilePress,
    onSettingsPress,
    onLivesPress,
    containerStyle,
}) => {
    const { refreshScore, lives, maxLives, secondsUntilNextLife, streak: contextStreak } = useGame();
    const { session } = useContext(AuthContext);
    const userId = USE_DEV_USER ? DEV_USER_ID : session?.user_id;
    const safeLives = Math.max(0, Math.min(lives, maxLives));

    useEffect(() => {
        void refreshScore();
    }, [refreshScore, userId]);

    // animacion de rebote de ardilla
    const squirrelScale = useRef(new Animated.Value(1)).current;
    const onSquirrelPressIn = () =>
        Animated.spring(squirrelScale, { toValue: 0.85, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    const onSquirrelPressOut = () =>
        Animated.spring(squirrelScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }).start();

    return (
        <View style={[styles.outerContainer, containerStyle]} pointerEvents="box-none">


            <View style={styles.darkBg} />


            <View style={[styles.tealContent, { top: BAR_TOP }]}>
                <TealBackground />

                {/* bellota icono */}
                <Image
                    source={require('../assets/icons/bellota.png')}
                    style={[styles.abs, { left: sx(41), top: sy(38), width: sx(26), height: sy(20) }]}
                    resizeMode="contain"
                />

                {/* Score */}
                <Text style={[styles.pillText, { left: sx(70), top: sy(36) }]}>
                    {score}
                </Text>

                {/* fuego icono */}
                <Image
                    source={require('../assets/icons/fuego.png')}
                    style={[styles.abs, { left: sx(39), top: sy(71), width: sx(20), height: sy(23) }]}
                    resizeMode="contain"
                />

                {/* racha contador */}
                <Text style={[styles.pillText, { left: sx(63), top: sy(73) }]}>
                    {contextStreak}
                </Text>

                {/* Corazones + countdown en una fila, tappable */}
                <TouchableOpacity
                    style={[styles.abs, { left: sx(250), top: sy(19), width: sx(123), height: sy(60), justifyContent: 'center' }]}
                    onPress={() => { SoundManager.play('tap_secondary'); onLivesPress?.(); }}
                    activeOpacity={onLivesPress ? 0.7 : 1}
                    disabled={!onLivesPress}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: sx(4) }}>
                        {Array.from({ length: safeLives }).map((_, i) => (
                            <Image
                                key={i}
                                source={require('../assets/icons/corazon.png')}
                                style={{ width: sx(22), height: sy(19), marginRight: sx(3) }}
                                resizeMode="contain"
                            />
                        ))}
                        {safeLives < maxLives && secondsUntilNextLife !== null && (
                            <Text style={styles.countdownText}>
                                {formatCountdown(secondsUntilNextLife)}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Icono de Configuraciones */}
                <TouchableOpacity
                    style={[styles.abs, { left: sx(321), top: sy(70), width: sx(35), height: sy(34) }]}
                    onPress={() => { SoundManager.play('tap_secondary'); onSettingsPress?.(); }}
                    activeOpacity={0.7}
                >
                    <Image
                        source={require('../assets/icons/settings.png')}
                        style={{ width: sx(35), height: sy(34) }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {/* Perfil Ardilla */}
                <TouchableOpacity
                    style={[styles.abs, { left: sx(165), top: sy(37), width: sx(70), height: sy(70) }]}
                    onPress={onProfilePress}
                    onPressIn={onSquirrelPressIn}
                    onPressOut={onSquirrelPressOut}
                    activeOpacity={1}
                >
                    <Animated.Image
                        source={require('../assets/icons/ardilla.png')}
                        style={{ width: sx(70), height: sy(70), transform: [{ scale: squirrelScale }] }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TopBar;

const styles = StyleSheet.create({

    outerContainer: {
        position: "absolute",
        top: 10,
        left: 0,
        right: 0,
        height: DARK_BG_PX + TOPBAR_HEIGHT + BAR_TOP,
        zIndex: 10,
        elevation: 10,
    },
    // Fondo Azul Oscuro
    darkBg: {
        position: "absolute",
        top: -80,
        left: 0,
        right: 0,
        height: DARK_BG_PX,
        backgroundColor: "#15232C",
    },
    tealContent: {
        position: "absolute",
        left: 0,
        right: 0,
        height: TOPBAR_HEIGHT,
    },
    abs: {
        position: "absolute",
    },
    pillText: {
        position: "absolute",
        color: "#FFF",
        fontFamily: Fonts.Bold,
        fontSize: Math.round(16 * S),
        fontWeight: "700",
        textShadowColor: "rgba(0,0,0,0.25)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 2,
    },
    countdownText: {
        color: "#FFF",
        fontFamily: Fonts.Bold,
        fontSize: Math.round(10 * S),
        fontWeight: "700",
        opacity: 0.85,
        marginTop: 2,
    },
});
