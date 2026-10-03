import React from "react";
import { View, StyleSheet } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { scale } from "react-native-size-matters";
import Estrellita from "./Estrellas";


export default function GrupoEstrellas() {
    return (
        <View style={styles.container}>
            {/* Estrella principal */}
            <Estrellita
                size={scale(70)}
                rotateDeg={0}
                style={styles.starMain}
            />

            {/* Estrella rotada 1 */}
            <Estrellita
                size={scale(50)}
                rotateDeg={25}
                style={styles.starOne}
            />

            {/* Estrella rotada 2 */}
            <Estrellita
                size={scale(50)}
                rotateDeg={-15}
                style={styles.starTwo}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: responsiveHeight(18),
        zIndex: 5,
        elevation: 9999,
    },

    starMain: { position: "absolute",
        top: scale(80),
        right: scale(60),},
    starOne: {
        position: "absolute",
        top: scale(130),
        right: scale(-120),
    },
    starTwo: {
        position: "absolute",
        top: scale(220),
        right: scale(90),
    },

});
