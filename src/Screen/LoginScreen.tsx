import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Platform } from 'react-native';
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";
import BackgroundShapes from "../Components/Homescreen_components/BackgroundShapes";
import Finzila_Login from "../assets/Images/Finzila_Login";
import Usuario_login from "../assets/Images/Usuario_Login";
import Candado_login from "../assets/Images/Candado_Login";

import { AuthContext } from "../api/context/AuthContext";

type LoginScreenProps = {
    onNavigateToLevels: () => void;
    onNavigateBack: () => void;
    onNavigateToForgotPassword?: () => void;
};

function extractErrorMessage(err: any) {
    if (typeof err?.message === "string" && err.message.trim()) return err.message;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err);
    } catch {
        return "Ocurrió un error inesperado";
    }
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToLevels, onNavigateBack, onNavigateToForgotPassword }) => {
    const { login } = useContext(AuthContext);

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        const id = identifier.trim();

        if (!id || !password) {
            Alert.alert("Campos vacíos", "Por favor ingresa correo o usuario y contraseña");
            return;
        }

        try {
            setLoading(true);
            await login(id, password);
            Alert.alert("Bienvenido", "Inicio de sesión exitoso");
            onNavigateToLevels();
        } catch (err: any) {
            const msg = extractErrorMessage(err);
            if (msg.toLowerCase().includes("invalid credentials")) {
                Alert.alert("Credenciales incorrectas", "Revisa tu correo o usuario y contraseña e intenta de nuevo.");
            } else {
                Alert.alert("Error", msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <BackgroundShapes />

            <View
                style={[
                    styles.Finzila_Login,
                    Platform.OS === "ios"
                        ? { top: responsiveHeight(25.5), transform: [{ scale: 0.72 }] }
                        : { top: responsiveHeight(26), transform: [{ scale: 0.73 }] },
                ]}
            >
                <Finzila_Login />
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Correo o Usuario"
                        placeholderTextColor="#52A0B5"
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                    />
                    <Usuario_login width={scale(40)} height={verticalScale(40)} style={{ marginLeft: scale(8) }} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Contraseña"
                        placeholderTextColor="#52A0B5"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Candado_login width={scale(40)} height={verticalScale(40)} style={{ marginLeft: scale(8) }} />
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: loading ? "#7ED6E4" : "#00CFFF" }]}
                    activeOpacity={0.8}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginText}>
                        {loading ? "Conectando..." : "Entrar"}
                    </Text>
                </TouchableOpacity>

                {onNavigateToForgotPassword && (
                    <Text style={styles.forgotText} onPress={onNavigateToForgotPassword}>
                        ¿Olvidaste tu contraseña?
                    </Text>
                )}
            </View>

            <Circulo style={styles.circulo} />
            <Text style={styles.title}>FINZI</Text>
            <Text style={styles.title2}>¿No tienes cuenta?</Text>
            <Text style={styles.backText} onPress={onNavigateBack}>
                Volver
            </Text>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00CFFF',
        alignItems: 'center',
    },
    Finzila_Login: {
        position: 'absolute',
        zIndex: 1,
    },
    form: {
        marginTop: responsiveHeight(48),
        width: '80%',
        zIndex: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(15),
        marginBottom: verticalScale(15),
        paddingHorizontal: scale(10),
        height: verticalScale(50),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputText: {
        flex: 1,
        fontSize: moderateScale(16),
        color: '#183336',
        fontFamily: Platform.select({ ios: 'System', web: 'system-ui', default: 'normal' }),
    },
    loginButton: {
        height: verticalScale(50),
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    circulo: {
        position: 'absolute',
        bottom: responsiveHeight(-15),
        zIndex: 0,
    },
    title: {
        position: 'absolute',
        top: responsiveHeight(8),
        fontSize: moderateScale(48),
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 5,
    },
    forgotText: {
        alignSelf: 'center',
        marginTop: verticalScale(14),
        fontSize: moderateScale(14),
        color: '#FFFFFF',
        textDecorationLine: 'underline',
        opacity: 0.9,
    },
    title2: {
        position: 'absolute',
        bottom: responsiveHeight(15),
        fontSize: moderateScale(16),
        color: '#FFFFFF',
    },
    backText: {
        position: 'absolute',
        bottom: responsiveHeight(10),
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#FFFFFF',
        textDecorationLine: 'underline',
    },
});
