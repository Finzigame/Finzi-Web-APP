import { StyleSheet, View, ViewStyle } from "react-native";
import React from "react";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

interface CirculoProps {
    style?: ViewStyle;
}

const Circulo: React.FC<CirculoProps> = ({ style }) => {
    return <View style={[styles.circulo, style]} />;
};

const styles = StyleSheet.create({
    circulo: {
        width: responsiveWidth(100),
        height: responsiveWidth(100),
        backgroundColor: "#00CFFF40",
        borderRadius: responsiveWidth(50),
        position: "absolute",
        top: responsiveHeight(-1),
        right: responsiveWidth(-55),
        zIndex: 0,
    },
});

export default Circulo;
