import React from 'react';
import { StyleSheet, View } from 'react-native';
// import HojasPino from './Hojiitas_Nivel_Bellota';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';


const BackgroundNivelBellota = () => {
    const size = responsiveWidth(20); // 20% del ancho de pantalla

    return (
        <View style={styles.container}>
            {/* <HojasPino
                style={[
                    styles.hojasPino,
                    {
                        width: size,
                        height: size,
                        bottom: responsiveHeight(70), // 70% de la altura
                        left: responsiveWidth(50),    // 50% del ancho
                    },
                ]}
            /> */}
        </View>
    );
};

export default BackgroundNivelBellota;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    hojasPino: {
        position: 'absolute',
        zIndex: 1001,
    },
});
