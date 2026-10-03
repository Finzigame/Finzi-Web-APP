import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  PanResponder,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Svg, { Ellipse, Circle } from 'react-native-svg';
import { colors } from '../Utils/colors';
import Flecha from '../assets/Images/flecha';
import Fondoajustes from '../assets/Fondoajustes';
import BottomNav from '../Components/Bottom_Navigator';
import { AuthContext } from '../api/context/AuthContext';

const { width, height } = Dimensions.get('window');

interface SettingsProps {
  onBackToSettings: () => void;
  onGoToLevels: () => void;
  onGoToProfile: () => void;
  onGoToAgendita?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBackToSettings, onGoToLevels, onGoToProfile, onGoToAgendita }) => {
  const { logout } = useContext(AuthContext);
  const [volumeLevel, setVolumeLevel] = useState(0.7);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const sliderRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => updateVolumeFromTouch(event),
    onPanResponderMove: (event) => updateVolumeFromTouch(event),
    onPanResponderRelease: () => { },
  });

  const updateVolumeFromTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const sliderWidth = 164;
    const newVolume = Math.max(0, Math.min(1, locationX / sliderWidth));
    setVolumeLevel(newVolume);
  };

  {/* Cerrar sesion bBERNARDOOOOO */ }

  const handleLogout = () => {
    Alert.alert('Logout', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: async () => {
        await logout();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <Fondoajustes />
      </View>

      {/* contenido */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Flecha hacia Levels */}
        <TouchableOpacity
          style={styles.backArrowButton}
          onPress={onGoToLevels}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.backArrowCircle}>
            <Flecha />
          </View>
        </TouchableOpacity>

        {/* Icono de engranaje en círculo */}
        <View style={styles.gearContainer}>
          <Svg width={194} height={188} style={StyleSheet.absoluteFillObject}>
            <Ellipse cx="97" cy="94" rx="97" ry="94" fill="#5ECDD6" />
          </Svg>
          <Image
            source={require('../assets/icons/img_a630e518.png')}
            style={styles.gearImage}
            resizeMode="contain"
          />
        </View>

        {/* Título Ajustes */}
        <Text style={styles.titleText}>Ajustes</Text>

        {/* Control de volumen */}
        <View style={styles.volumeContainer}>
          <View style={styles.controlBackground}>
            <Image
              source={require('../assets/icons/img_3af0b71a.png')}
              style={styles.volumeIcon}
              resizeMode="contain"
            />
            <View
              ref={sliderRef}
              style={styles.sliderContainer}
              {...panResponder.panHandlers}
            >
              <View style={[styles.sliderFilled, { width: `${volumeLevel * 100}%` }]} />
              <View style={[styles.sliderEmpty, { width: `${(1 - volumeLevel) * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Control de música */}
        <View style={styles.musicContainer}>
          <View style={styles.controlBackground}>
            <Image
              source={require('../assets/icons/img_ec77b36d.png')}
              style={styles.musicIcon}
              resizeMode="contain"
            />
            <Text style={styles.musicText}>Música</Text>
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setMusicEnabled(!musicEnabled)}
            >
              <View style={[styles.toggleBackground, musicEnabled ? styles.toggleEnabled : styles.toggleDisabled]}>
                <View style={[styles.toggleButton, musicEnabled ? styles.toggleButtonRight : styles.toggleButtonLeft]}>
                  <Svg width={22} height={22}>
                    <Circle cx="11" cy="11" r="11" fill="#FFF8F8" />
                  </Svg>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Image
            source={require('../assets/icons/img_2f4c9263.png')}
            style={styles.logoutIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Barra de nave inferior */}
      <BottomNav
        onBackToSettings={() => { }}
        onGoToLevels={onGoToLevels}
        onGoToAgendita={onGoToAgendita}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2EA4AB',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width + 100,
    height: height + 100,
    top: -100,
    left: -50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.12,
    paddingBottom: verticalScale(90),
  },
  backArrowButton: {
    position: 'absolute',
    top: height * 0.05,
    left: scale(19),
    width: scale(50),
    height: scale(50),
    zIndex: 20,
  },
  backArrowCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: scale(4),
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  gearContainer: {
    width: scale(194),
    height: verticalScale(188),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.01,
  },
  gearImage: {
    width: scale(160),
    height: verticalScale(155),
    zIndex: 1,
  },
  titleText: {
    marginTop: height * 0.025,
    fontSize: moderateScale(40),
    fontFamily: 'Fredoka-Bold',
    color: colors.white,
    textAlign: 'center',
  },
  volumeContainer: {
    marginTop: height * 0.05,
    width: width * 0.72,
  },
  musicContainer: {
    marginTop: height * 0.025,
    width: width * 0.72,
  },
  controlBackground: {
    width: '100%',
    height: verticalScale(73),
    borderRadius: scale(42),
    backgroundColor: '#0885A1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
  },
  volumeIcon: {
    width: scale(59),
    height: verticalScale(55),
  },
  musicIcon: {
    width: scale(64),
    height: scale(64),
  },
  sliderContainer: {
    flex: 1,
    height: verticalScale(20),
    marginLeft: scale(9),
    flexDirection: 'row',
    borderRadius: scale(26),
    overflow: 'hidden',
  },
  sliderFilled: {
    height: '100%',
    backgroundColor: '#1DBAC2',
  },
  sliderEmpty: {
    height: '100%',
    backgroundColor: '#144F52',
  },
  musicText: {
    fontSize: moderateScale(24),
    fontFamily: 'Fredoka-Bold',
    color: colors.white,
    marginLeft: scale(18),
    flex: 1,
  },
  toggleContainer: {
    marginLeft: 'auto',
  },
  toggleBackground: {
    width: scale(71),
    height: verticalScale(37),
    borderRadius: scale(17),
    justifyContent: 'center',
    position: 'relative',
  },
  toggleEnabled: {
    backgroundColor: '#4BED1A',
  },
  toggleDisabled: {
    backgroundColor: '#666666',
  },
  toggleButton: {
    position: 'absolute',
    top: verticalScale(8),
  },
  toggleButtonRight: {
    right: scale(6),
  },
  toggleButtonLeft: {
    left: scale(6),
  },
  logoutButton: {
    marginTop: height * 0.05,
    width: width * 0.6,
    height: verticalScale(66),
    borderRadius: scale(35),
    backgroundColor: '#CF3F3F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
  },
  logoutIcon: {
    width: scale(47),
    height: verticalScale(44),
    right: scale(25),
  },
  logoutText: {
    fontSize: moderateScale(24),
    fontFamily: 'Fredoka-Bold',
    color: colors.white,
    right: scale(20),
    top: -verticalScale(2),
  },
});

export default Settings;
