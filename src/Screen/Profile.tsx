import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Easing,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Svg, { Path, Circle, LinearGradient, Stop, Defs } from 'react-native-svg';
import { colors } from '../Utils/colors';
import { Fonts } from '../Utils/Fonts';
import Hojas from '../Components/Homescreen_components/Homescreen_components/hojas';
import Flecha from '../assets/Images/flecha';
import BottomNav from '../Components/Bottom_Navigator';
import { AuthContext } from '../api/context/AuthContext';
import { getProfile, updateProfile, UserProfile } from '../api/users';

const { width, height } = Dimensions.get('window');

interface ProfileProps {
  onBackToSettings: () => void;
  onGoToSettings: () => void;
  onGoToLevels: () => void;
  onGoToAgendita?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBackToSettings, onGoToSettings, onGoToLevels, onGoToAgendita }) => {
  const { session, updateLocalSession } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!session?.user_id) return;
    try {
      setLoading(true);
      const data = await getProfile(session.user_id);
      setProfile(data);
      setNewName(data.display_name || '');
      setNewEmail(data.email || '');
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user_id) return;
    try {
      setSaving(true);
      const payload: any = {};
      if (newName !== profile?.display_name) payload.display_name = newName;
      if (newEmail !== profile?.email) payload.email = newEmail;
      if (newPassword.length > 0) payload.password = newPassword;

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      const updated = await updateProfile(session.user_id, payload);
      setProfile(updated);
      
      // Update global context
      await updateLocalSession({
        display_name: updated.display_name,
        email: updated.email
      });

      setIsEditing(false);
      setNewPassword('');
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.white} style={{ marginTop: height * 0.4 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Hojas />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backArrowButton}
          onPress={onGoToLevels}
          activeOpacity={0.8}
        >
          <View style={styles.backArrowCircle}>
            <Flecha />
          </View>
        </TouchableOpacity>

        {!isEditing ? (
          <>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{profile?.display_name || 'Sin nombre'}</Text>
              <Text style={styles.userHandle}>{profile?.email}</Text>
            </View>

            <View style={styles.avatarContainer}>
              <Image
                source={require('../assets/icons/img_4eafa84b.png')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Svg width={171} height={60} style={styles.editButtonBackground}>
                <Path
                  d="M0 24C0 10.7452 10.7452 0 24 0H147C160.255 0 171 10.7452 171 24V36C171 49.2548 160.255 60 147 60H24C10.7452 60 0 49.2548 0 36V24Z"
                  fill="#0885A1"
                />
              </Svg>
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Editar Perfil</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Nombre"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nueva Contraseña</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Dejar en blanco para no cambiar"
                secureTextEntry
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF5252' }]} 
                onPress={() => setIsEditing(false)}
                disabled={saving}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isEditing && (
          <View style={styles.inventoryContainer}>
            <TouchableOpacity style={styles.achievementsSection} activeOpacity={0.7}>
              <Svg width={103} height={103} style={styles.circleBackground}>
                <Circle cx="51.5" cy="51.5" r="51.5" fill="#288FB4" />
              </Svg>
              <Image
                source={require('../assets/icons/img_73e5b37f.png')}
                style={styles.trophyIcon}
                resizeMode="contain"
              />
              <Text style={styles.achievementsText}>Logros</Text>
            </TouchableOpacity>

            <Svg width={71} height={30} style={styles.connectingLine}>
              <Defs>
                <LinearGradient id="lineGradient" x1="2.10227" y1="22.4894" x2="69.1023" y2="8.48943" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#288FB4" />
                  <Stop offset="1" stopColor="#1DBAC2" />
                </LinearGradient>
              </Defs>
              <Path d="M2 22L69 8" stroke="url(#lineGradient)" strokeWidth="15" />
            </Svg>

            <TouchableOpacity style={styles.inventorySection} activeOpacity={0.7}>
              <Svg width={103} height={103} style={styles.circleBackground}>
                <Circle cx="51.5" cy="51.5" r="51.5" fill="#1DBAC3" />
              </Svg>
              <Image
                source={require('../assets/icons/img_fbef4e34.png')}
                style={styles.chestIcon}
                resizeMode="contain"
              />
              <Text style={styles.inventoryText} numberOfLines={1}>Inventario</Text>
            </TouchableOpacity>
          </View>
        )}

        <BottomNav onBackToSettings={onBackToSettings} onGoToLevels={onGoToLevels} onGoToAgendita={onGoToAgendita} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00D5F3',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width + 100,
    height: height + 100,
    top: -50,
    left: -50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.14,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: height * 0.001,
  },
  avatarContainer: {
    marginTop: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: scale(800),
    height: verticalScale(250),
  },
  userName: {
    fontSize: moderateScale(36),
    fontFamily: Fonts.Bold,
    color: colors.white,
    textAlign: 'center',
    lineHeight: moderateScale(40),
  },
  userHandle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Bold,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: verticalScale(5),
  },
  editButton: {
    marginTop: height * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonBackground: {
    position: 'absolute',
  },
  editButtonText: {
    fontSize: moderateScale(20),
    fontFamily: 'Roboto',
    fontWeight: '700',
    color: colors.white,
    zIndex: 1,
  },
  formContainer: {
    width: width * 0.85,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: scale(25),
    padding: scale(20),
    marginTop: verticalScale(10),
  },
  formTitle: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.Bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: verticalScale(15),
  },
  inputGroup: {
    marginBottom: verticalScale(12),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Bold,
    color: colors.white,
    marginBottom: verticalScale(5),
    marginLeft: scale(5),
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    color: colors.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(15),
  },
  actionButton: {
    flex: 0.48,
    height: verticalScale(45),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontFamily: Fonts.Bold,
    fontSize: moderateScale(16),
  },
  inventoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.055,
    width: scale(262),
    height: verticalScale(162),
    position: 'relative',
    alignSelf: 'center',
  },
  achievementsSection: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: verticalScale(36),
  },
  inventorySection: {
    alignItems: 'center',
    position: 'absolute',
    right: scale(5),
    top: 0,
  },
  circleBackground: {
    position: 'absolute',
  },
  trophyIcon: {
    width: scale(140),
    height: verticalScale(67),
    marginTop: verticalScale(18),
    zIndex: 1,
  },
  chestIcon: {
    width: scale(73),
    height: verticalScale(58),
    marginTop: verticalScale(23),
    zIndex: 1,
  },
  achievementsText: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.Bold,
    fontWeight: '800',
    color: colors.white,
    position: 'absolute',
    bottom: -verticalScale(45),
    left: scale(22),
    width: scale(92),
    textAlign: 'center',
  },
  inventoryText: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.Bold,
    fontWeight: '800',
    color: colors.white,
    position: 'absolute',
    bottom: -verticalScale(50),
    left: -scale(35),
    width: scale(140),
    textAlign: 'center',
  },
  connectingLine: {
    position: "absolute",
    left: scale(110),
    top: verticalScale(65),
    transform: [{ rotate: "-11.802deg" }],
  },
  backArrowButton: {
    position: 'absolute',
    top: height * 0.06,
    left: scale(15),
    width: scale(64),
    height: scale(64),
    zIndex: 20,
  },
  backArrowCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: scale(5),
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    bottom: -verticalScale(10),
  },
});

export default Profile;
