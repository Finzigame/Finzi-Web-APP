import React, { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, Platform } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";
import BackgroundShapes from "../Components/Homescreen_components/BackgroundShapes";
import Usuario_login from "../assets/Images/Usuario_Login";
import Candado_login from "../assets/Images/Candado_Login";
import Finzila_Login from "../assets/Images/Finzila_Login";

import { AuthContext } from "../api/context/AuthContext";

interface RegisterScreenProps {
    onNavigateToLevels: () => void;
    onNavigateBack: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLevels, onNavigateBack }) => {
    const { register } = useContext(AuthContext);

    const [nombre, setNombre] = useState("");   // display_name
    const [email, setEmail] = useState("");     // antes "usuario"
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const e = email.trim().toLowerCase();

        if (!nombre || !e || !password) {
            Alert.alert("Campos vacíos", "Por favor completa todos los campos.");
            return;
        }

        try {
            setLoading(true);

            // Esto llama /auth/register y guarda sesión automáticamente
            await register(e, password, nombre);

            Alert.alert("¡Cuenta creada!", `Bienvenido, ${nombre}`);
            onNavigateToLevels();
        } catch (err: any) {
            console.error(err);
            // Tu backend manda errores tipo "Email already registered"
            Alert.alert("Error", err?.message ?? "No se pudo crear la cuenta.");
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
                        ? { top: responsiveHeight(18.42), transform: [{ scale: 0.72 }] }
                        : { top: responsiveHeight(19.3), transform: [{ scale: 0.73 }] },
                ]}
            >
                <Finzila_Login />
            </View>

            <Text style={styles.title}>FINZI</Text>

            <View style={styles.form}>
                <View style={[styles.inputContainer, { backgroundColor: "#C8F0FB" }]}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Nombre"
                        placeholderTextColor="#52A0B5"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <Usuario_login width={scale(40)} height={verticalScale(40)} style={{ marginLeft: scale(8) }} />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: "#C8F0FB" }]}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Correo"
                        placeholderTextColor="#52A0B5"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Usuario_login width={scale(40)} height={verticalScale(40)} style={{ marginLeft: scale(8) }} />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: "#C8F0FB" }]}>
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
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.loginText}>{loading ? "Registrando..." : "Registrar"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onNavigateBack}>
                    <Text style={styles.title2}>¿Tienes una cuenta?</Text>
                    <Text style={styles.backText}>Volver</Text>
                </TouchableOpacity>
            </View>

            <Circulo style={styles.circulo} />
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    Finzila_Login: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 2,
    },

    form: {
        width: responsiveWidth(65),
        marginTop: responsiveHeight(5),
        zIndex: 2,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: moderateScale(65),
        paddingHorizontal: scale(13),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(12),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
        backgroundColor: "#C8F0FB",
    },

    inputText: {
        flex: 1,
        fontSize: moderateScale(18),
        fontWeight: "bold",
        color: "#094069",
    },

    loginButton: {
        marginTop: verticalScale(15),
        paddingVertical: verticalScale(15),
        borderRadius: moderateScale(50),
        alignItems: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
    },

    loginText: {
        color: "#FFFFFF",
        fontSize: moderateScale(18),
        fontWeight: "bold",
    },

    backButton: {
        marginTop: verticalScale(10),
        alignItems: "center",
    },

    backText: {
        color: "#00819B",
        fontSize: moderateScale(15),
        bottom: responsiveHeight(-4),
        fontWeight: "bold",
    },

    title: {
        color: "white",
        fontSize: moderateScale(64),
        fontFamily: "Fredoka-Bold",
        position: "absolute",
        bottom: responsiveHeight(78),
        textShadowColor: "rgba(0, 0, 0, 0.15)",
        textShadowOffset: { width: 3, height: 2.5 },
        textShadowRadius: 4,
        zIndex: 2,
    },

    title2: {
        color: "white",
        fontSize: moderateScale(14),
        fontFamily: "Fredoka-Bold",
        position: "absolute",
        bottom: responsiveHeight(0),
        zIndex: 4,
    },

    circulo: {
        position: "absolute",
        bottom: responsiveHeight(10),
        zIndex: 1,
    },
});
