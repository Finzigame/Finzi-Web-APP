import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";
import { colors } from "../Utils/colors";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import Finzila from "../assets/Images/Finzila";
import BackgroundShapes from "../Components/Homescreen_components/BackgroundShapes";
import Candado from "../assets/Images/candado";
import Persona from "../assets/Images/persona";


interface EntryScreenProps {
    onNavigateToLogin: () => void;
    onNavigateToRegister: () => void;
}

const EntryScreen: React.FC<EntryScreenProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
    return (
        <View style={styles.container}>

            <BackgroundShapes />
            <View
                style={[
                    styles.Finzila,
                    Platform.OS === "ios"
                        ? { top: responsiveHeight(9.7), transform: [{ scale: 0.72 }] }
                        : { top: responsiveHeight(8.6), transform: [{ scale: 0.73 }] },
                ]}
            >
                <Finzila />
            </View>


            <View style={styles.logoContainer}>
            </View>

            <Text style={styles.title}>FINZI</Text>


            <View style={styles.buttonsContainer}>

                <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    activeOpacity={0.8}
                    onPress={onNavigateToLogin}
                >
                    <View style={styles.inlineContent}>
                        <Text style={styles.loginText}>Iniciar Sesión</Text>
                        <View style={{ marginLeft: 8 }}>
                            <Candado width={22} height={22} />
                        </View>
                    </View>
                </TouchableOpacity>


                <TouchableOpacity
                    style={[styles.button, styles.registerButton]}
                    activeOpacity={0.8}
                    onPress={onNavigateToRegister}
                >
                    <View style={styles.inlineContent}>
                        <Text style={styles.registerText}>Registrarse</Text>
                        <Persona width={22} height={22} style={{ marginLeft: 8 }} />
                    </View>
                </TouchableOpacity>
            </View>


            <Circulo style={styles.circulo} />
        </View>
    );
};

export default EntryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.blue_login,
        justifyContent: "center",
        alignItems: "center",
    },
    Finzila: {
        justifyContent: "center",
        alignItems: "center",
        left: responsiveWidth(23.5),
    },

    logoContainer: {
        position: "absolute",
        alignItems: "center",
        top: responsiveHeight(19),
        left: responsiveWidth(38),
        justifyContent: "center",
        zIndex: 2,
    },

    title: {
        color: "#FFFFFF",
        fontSize: 64,
        fontFamily: "Fredoka-Bold",
        position: "absolute",
        bottom: responsiveHeight(70),
        textShadowColor: "rgba(0, 0, 0, 0.15)",
        textShadowOffset: { width: 3, height: 2.5 },
        textShadowRadius: 4,
        zIndex: 3,
    },

    buttonsContainer: {
        position: "absolute",
        top: responsiveHeight(47),
        width: "80%",
        alignItems: "center",
        gap: responsiveHeight(2.5),
        zIndex: 3,
    },

    button: {
        width: "60%",
        height: 50,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
        elevation: 5,
    },

    loginButton: {
        backgroundColor: "#094069",
    },

    registerButton: {
        backgroundColor: "#FFFFFF",
    },

    loginText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "Fredoka-Medium",
    },

    registerText: {
        color: "#0885A1",
        fontSize: 18,
        fontFamily: "Fredoka-Medium",
    },

    inlineContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    circulo: {
        position: "absolute",
        top: responsiveHeight(-6.6),
        right: responsiveWidth(-62),
        zIndex: 1,
    },
});