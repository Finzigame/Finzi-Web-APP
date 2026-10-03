import React, { useRef, useState } from 'react';
import {
    StyleSheet, Text, TouchableOpacity, View,
    TextInput, Alert, Platform, NativeSyntheticEvent, TextInputKeyPressEventData,
} from 'react-native';
import { responsiveHeight } from "react-native-responsive-dimensions";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

import BackgroundShapes from "../Components/Homescreen_components/BackgroundShapes";
import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";
import { resetPassword } from "../api/auth";

type ResetPasswordScreenProps = {
    email: string;
    onNavigateBack: () => void;
    onSuccess: () => void;
};

const CODE_LENGTH = 6;

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ email, onNavigateBack, onSuccess }) => {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

    const handleDigitChange = (text: string, index: number) => {
        const digit = text.replace(/\D/g, "").slice(-1);
        const updated = [...digits];
        updated[index] = digit;
        setDigits(updated);
        if (digit && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleReset = async () => {
        const code = digits.join("");
        if (code.length < CODE_LENGTH) {
            Alert.alert("Código incompleto", "Ingresá los 6 dígitos del código");
            return;
        }
        if (!newPassword) {
            Alert.alert("Campo vacío", "Ingresá una nueva contraseña");
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert("Contraseña muy corta", "La contraseña debe tener al menos 8 caracteres");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("No coinciden", "Las contraseñas no coinciden");
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email, code, newPassword);
            Alert.alert(
                "¡Listo!",
                "Tu contraseña fue actualizada. Ya podés iniciar sesión.",
                [{ text: "Ir al login", onPress: onSuccess }]
            );
        } catch (err: any) {
            const msg = typeof err?.message === "string" ? err.message : "Ocurrió un error inesperado";
            if (msg.toLowerCase().includes("inválido") || msg.toLowerCase().includes("expirado")) {
                Alert.alert("Código inválido", "El código es incorrecto o ya expiró. Pedí uno nuevo.");
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

            <Text style={styles.title}>FINZI</Text>
            <Text style={styles.subtitle}>Ingresá el código</Text>
            <Text style={styles.description}>
                Revisá tu email{"\n"}
                <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.form}>
                <View style={styles.codeRow}>
                    {digits.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={(ref) => { inputRefs.current[i] = ref; }}
                            style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
                            value={digit}
                            onChangeText={(t) => handleDigitChange(t, i)}
                            onKeyPress={(e) => handleKeyPress(e, i)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            textAlign="center"
                        />
                    ))}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Nueva contraseña"
                        placeholderTextColor="#52A0B5"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Confirmar contraseña"
                        placeholderTextColor="#52A0B5"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "#7ED6E4" : "#00CFFF" }]}
                    activeOpacity={0.8}
                    onPress={handleReset}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Verificando..." : "Cambiar contraseña"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.backText} onPress={onNavigateBack}>
                Volver
            </Text>

            <Circulo style={styles.circulo} />
        </View>
    );
};

export default ResetPasswordScreen;

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
        marginTop: verticalScale(8),
        fontSize: moderateScale(14),
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.9,
    },
    emailText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    form: {
        marginTop: verticalScale(20),
        width: '80%',
        zIndex: 2,
    },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    codeBox: {
        width: scale(40),
        height: verticalScale(50),
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(10),
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#183336',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    codeBoxFilled: {
        borderWidth: 2,
        borderColor: '#0C7E8A',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(15),
        marginBottom: verticalScale(12),
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
        marginTop: verticalScale(8),
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
        marginTop: verticalScale(20),
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
