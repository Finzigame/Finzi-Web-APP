import React from 'react';
import { StyleSheet, View, Text, Dimensions, ImageBackground, StatusBar, } from 'react-native';
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import Circulo from "../Components/Homescreen_components/Homescreen_components/circulo";
import BackgroundShapes from "../Components/Homescreen_components/BackgroundShapes";
import { colors } from "../Utils/colors";


const { width, height } = Dimensions.get('window');

interface WelcomeProps {
  onNavigateToEntry: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigateToEntry }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onNavigateToEntry();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onNavigateToEntry]);

  return (
    <View style={styles.container}>
      <BackgroundShapes />
      <Circulo style={styles.circulo} />
      <Text style={styles.text}>FINZI</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blue_login,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 64,
    fontFamily: "Fredoka-Bold",
    position: "absolute",
    bottom: responsiveHeight(45.5),
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 3, height: 2.5 },
    textShadowRadius: 4,
  },

  circulo: {
    position: "absolute",
    top: responsiveHeight(-6),
    right: responsiveWidth(-75),
    zIndex: 0,
  }
});

export default Welcome;
