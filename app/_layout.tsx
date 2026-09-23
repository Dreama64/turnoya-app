import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
        <View style={styles.logoBox}>
          <Ionicons name="add" size={48} color="#10B981" />
        </View>
        <Text style={styles.title}>TurnoYa</Text>
        <Text style={styles.subtitle}>Urgencias y Farmacias de Turno</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
});
