import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Platform } from 'react-native';
import { responsiveHeight } from "react-native-responsive-dimensions";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

import BackgroundShapes from "../Components/Homescreen_components/BackgroundShapes";
import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";
import { forgotPassword } from "../api/auth";

type ForgotPasswordScreenProps = {
    onNavigateBack: () => void;
    onNavigateToReset: (email: string) => void;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateBack, onNavigateToReset }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
            Alert.alert("Campo vacío", "Por favor ingresá tu correo electrónico");
            return;
        }

        try {
            setLoading(true);
            await forgotPassword(trimmed);
            onNavigateToReset(trimmed);
        } catch (err: any) {
            const msg = typeof err?.message === "string" ? err.message : "Ocurrió un error inesperado";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <BackgroundShapes />

            <Text style={styles.title}>FINZI</Text>
            <Text style={styles.subtitle}>Recuperá tu contraseña</Text>
            <Text style={styles.description}>
                Ingresá tu email y te enviamos un código de 6 dígitos.
            </Text>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Correo electrónico"
                        placeholderTextColor="#52A0B5"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "#7ED6E4" : "#00CFFF" }]}
                    activeOpacity={0.8}
                    onPress={handleSend}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Enviando..." : "Enviar código"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.backText} onPress={onNavigateBack}>
                Volver al login
            </Text>

            <Circulo style={styles.circulo} />
        </View>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00CFFF',
        alignItems: 'center',
    },
    title: {
        position: 'absolute',
        top: responsiveHeight(8),
        fontSize: moderateScale(48),
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 5,
    },
    subtitle: {
        marginTop: responsiveHeight(22),
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    description: {
        marginTop: verticalScale(10),
        fontSize: moderateScale(14),
        color: '#FFFFFF',
        textAlign: 'center',
        paddingHorizontal: scale(30),
        opacity: 0.9,
    },
    form: {
        marginTop: verticalScale(30),
        width: '80%',
        zIndex: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(15),
        marginBottom: verticalScale(15),
        paddingHorizontal: scale(15),
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
    button: {
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
    buttonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    backText: {
        marginTop: verticalScale(24),
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#FFFFFF',
        textDecorationLine: 'underline',
        zIndex: 2,
    },
    circulo: {
        position: 'absolute',
        bottom: responsiveHeight(-15),
        zIndex: 0,
    },
});
