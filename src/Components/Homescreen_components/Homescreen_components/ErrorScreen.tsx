import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Fonts } from '../../../Utils/Fonts';

const { width, height } = Dimensions.get('window');

interface ErrorScreenProps {
  errorType: 'cafe' | 'videojuegos' | 'ropa';
  onTryAgain: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorType, onTryAgain }) => {
  const getErrorMessage = () => {
    switch (errorType) {
      case 'cafe':
        return 'El café de la calle es un\ndeseo, no una necesidad.';
      case 'videojuegos':
        return 'Los videojuegos es un\ndeseo, no una necesidad.';
      case 'ropa':
        return 'La ropa de marca es un\ndeseo, no una necesidad.';
      default:
        return 'Es un deseo, no una necesidad.';
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../../../assets/icons/img_32853080.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Top Logo */}
      <Image
        source={require('../../../assets/icons/img_777ee4a7.png')}
        style={styles.topLogo}
        resizeMode="contain"
      />

      {/* Error Dialog */}
      <View style={styles.errorDialog}>
        {/* Main Error Container */}
        <View style={styles.errorContainer}>
          {/* Red Circle with X */}
          <View style={styles.errorCircleContainer}>
            <Svg width={122} height={122} style={styles.errorCircle}>
              <Circle cx="61" cy="61" r="61" fill="#BF2D14"/>
            </Svg>
            <Text style={styles.errorX}>x</Text>
          </View>

          {/* Main Error Message */}
          <Text style={styles.errorTitle}>
            {getErrorMessage()}
          </Text>

          {/* Subtitle */}
          <Text style={styles.errorSubtitle}>
            Es algo que puedes evitar para ahorrar más.
          </Text>

          {/* Try Again Button */}
          <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
            <View style={styles.tryAgainButtonInner}>
              <Image
                source={require('../../../assets/icons/img_754779e0.png')}
                style={styles.tryAgainIcon}
                resizeMode="contain"
              />
              <Text style={styles.tryAgainText}>Intentar de nuevo</Text>
            </View>
          </TouchableOpacity>

          {/* Decorative Stars */}
          <Image
            source={require('../../../assets/icons/img_a81a25b2.png')}
            style={styles.star1}
            resizeMode="contain"
          />
          <Image
            source={require('../../../assets/icons/img_a81a25b2.png')}
            style={styles.star2}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Sad Pig */}
      <Image
        source={require('../../../assets/icons/img_2c94a480.png')}
        style={styles.sadPig}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08C7E2',
  },
  backgroundImage: {
    position: 'absolute',
    width: width + 631,
    height: height + 684,
    left: -315,
    top: -342,
  },
  topLogo: {
    position: 'absolute',
    width: 321,
    height: 165,
    left: 43,
    top: 78,
  },
  errorDialog: {
    position: 'absolute',
    left: 26,
    top: 240,
    width: 341,
    height: 432,
  },
  errorContainer: {
    width: 350,
    height: 432,
    borderRadius: 39,
    backgroundColor: '#EE441E',
    position: 'relative',
  },
  errorCircleContainer: {
    position: 'absolute',
    left: 120,
    top: 17,
    width: 122,
    height: 122,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCircle: {
    position: 'absolute',
  },
  errorX: {
    fontSize: 96,
    fontFamily: Fonts.One,
    color: '#FFF',
    fontWeight: '400',
    lineHeight: 96,
    textAlign: 'center',
    position: 'absolute',
    top: 3.5,
    left: 0,
    right: 0,
    height: 96,
  },
  errorTitle: {
    position: 'absolute',
    left: 15,
    top: 140,
    width: 320,
    height: 90,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: Fonts.One,
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
    paddingHorizontal: 5,
  },
  errorSubtitle: {
    position: 'absolute',
    left: 20,
    top: 250,
    width: 310,
    height: 90,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: Fonts.Regular,
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 24,
    paddingHorizontal: 5,
  },
  tryAgainButton: {
    position: 'absolute',
    left: 40,
    top: 338,
    width: 281,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#008D63',
    shadowColor: '#087051',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  tryAgainButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tryAgainIcon: {
    width: 51,
    height: 51,
    marginRight: 15,
  },
  tryAgainText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: Fonts.One,
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 22,
  },
  star1: {
    position: 'absolute',
    width: 44,
    height: 34,
    left: 282,
    top: 24,
  },
  star2: {
    position: 'absolute',
    width: 44,
    height: 34,
    left: 20,
    top: 87,
  },
  sadPig: {
    position: 'absolute',
    width: 208,
    height: 208,
    left: 98,
    top: 661,
  },
});

export default ErrorScreen;