import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { mode, setMode, colors } = useTheme();

  const handleOpenEmail = () => {
    const email = 'sebads128@gmail.com';
    const subject = encodeURIComponent('Sugerencia / Feedback - TurnoYa');
    const body = encodeURIComponent('Hola Sebastián,\n\nTe escribo para dejarte una sugerencia sobre TurnoYa:\n\n');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => {});
  };

  const openMinsalSource = () => {
    Linking.openURL('https://datos.gob.cl/dataset/farmacias-en-chile');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>Ajustes y Opciones</Text>
          <Text style={[styles.brandSubtitle, { color: colors.subtext }]}>
            Personalización, soporte y datos de la app
          </Text>
        </View>

        {/* Sección 1: Apariencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APARIENCIA</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="moon-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>Modo de visualización</Text>
                <Text style={[styles.itemSubtitle, { color: colors.subtext }]}>
                  {mode === 'dark' ? 'Tema Oscuro activo' : mode === 'light' ? 'Tema Claro activo' : 'Siguiendo el sistema'}
                </Text>
              </View>
            </View>

            <View style={[styles.themeSelector, { backgroundColor: colors.chipBackground }]}>
              {[
                { key: 'dark', label: 'Oscuro', icon: 'moon' },
                { key: 'light', label: 'Claro', icon: 'sunny' },
                { key: 'system', label: 'Sistema', icon: 'phone-portrait' },
              ].map((opt) => {
                const active = mode === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.themeBtn, active && { backgroundColor: colors.primary }]}
                    onPress={() => setMode(opt.key as any)}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={14}
                      color={active ? '#FFFFFF' : colors.subtext}
                    />
                    <Text
                      style={[
                        styles.themeBtnText,
                        { color: active ? '#FFFFFF' : colors.subtext },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Sección 2: Soporte y Comunidad (Limpio) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOPORTE Y SUGERENCIAS</Text>

          <TouchableOpacity
            style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
            onPress={handleOpenEmail}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Enviar sugerencia o reporte</Text>
              <Text style={[styles.itemSubtitle, { color: colors.subtext }]}>
                Propón mejoras o notifica problemas
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Sección 3: Transparencia y Fuentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN LEGAL Y FUENTES</Text>

          <TouchableOpacity
            style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
            onPress={openMinsalSource}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Ionicons name="open-outline" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Datos oficiales MINSAL</Text>
              <Text style={[styles.itemSubtitle, { color: colors.subtext }]}>
                Fuente oficial pública de turnos y red asistencial
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

          <View
            style={[
              styles.cardItem,
              { marginTop: 10, backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Versión de la aplicación</Text>
              <Text style={[styles.itemSubtitle, { color: colors.subtext }]}>
                TurnoYa v1.0.0 (Chile)
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerNote}>
          TurnoYa es un servicio informativo independiente. Los turnos de farmacias y horarios de atención dependen exclusivamente de las resoluciones del Ministerio de Salud de Chile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 36,
  },
  header: { marginBottom: 24 },
  brandTitle: { fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  brandSubtitle: { fontSize: 12, marginTop: 2 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 14, fontWeight: '700' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  themeSelector: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 6 },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  themeBtnText: { fontSize: 12, fontWeight: '700' },
  footerNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 10,
  },
});
