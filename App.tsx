import React from 'react';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/Navigation/AppNavigator';
import { AuthProvider } from './src/api/context/AuthContext';
import { GameProvider } from './src/api/context/GameContext';
import WebShell from './src/web/WebShell';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Fredoka-Bold': require('./src/assets/Fonts/Fredoka-Bold.ttf'),
    'Fredoka-Medium': require('./src/assets/Fonts/Fredoka-Medium.ttf'),
    'Fredoka-Regular': require('./src/assets/Fonts/Fredoka-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#00AACC" />
        </View>
    );
  }

  return (
    <WebShell>
      <AuthProvider>
        <GameProvider>
          <AppNavigator />
        </GameProvider>
      </AuthProvider>
    </WebShell>
  );
}
