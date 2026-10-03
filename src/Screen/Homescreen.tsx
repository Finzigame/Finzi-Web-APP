import React from "react";
import { StyleSheet, View } from "react-native";
import FinziLogo from "../assets/FinziLogo";
import { colors } from "../Utils/colors";
import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";




const Homescreen = () => {
    return (
        <View style={styles.container}>
            <Circulo />
            <FinziLogo />
        </View>
    );
};

export default Homescreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.blue_login,
        justifyContent: "center",
        alignItems: "center",
    },
});