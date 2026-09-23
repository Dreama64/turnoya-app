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
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, region, setRegion } = useTheme();

  const callEmergency = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Superior */}
        <View style={styles.header}>
          <View style={styles.brandBox}>
            <View style={styles.regionBadge}>
              <Ionicons name="location-sharp" size={12} color={colors.primary} />
              <Text style={[styles.regionBadgeText, { color: colors.primary }]}>
                {region === '8' ? "REGIÓN DE O'HIGGINS" : 'REGIÓN METROPOLITANA'}
              </Text>
            </View>
            <Text style={[styles.appTitle, { color: colors.text }]}>TurnoYa</Text>
            <Text style={[styles.appSubtitle, { color: colors.subtext }]}>
              Servicios esenciales y urgencias en tiempo real
            </Text>
          </View>

          {/* Toggle de Región Sincronizado */}
          <View style={[styles.regionContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.regionOption, region === '8' && { backgroundColor: colors.primary }]}
              onPress={() => setRegion('8')}
            >
              <Text
                style={[
                  styles.regionOptionText,
                  { color: region === '8' ? '#FFFFFF' : colors.subtext },
                ]}
              >
                O'Higgins
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.regionOption, region === '7' && { backgroundColor: colors.primary }]}
              onPress={() => setRegion('7')}
            >
              <Text
                style={[
                  styles.regionOptionText,
                  { color: region === '7' ? '#FFFFFF' : colors.subtext },
                ]}
              >
                Metropolitana
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjeta Farmacias */}
        <TouchableOpacity
          style={styles.heroCardPharmacy}
          activeOpacity={0.88}
          onPress={() => router.push('/(tabs)/farmacias')}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="medical" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.cardTag}>
              <Text style={styles.cardTagText}>OFICIAL MINSAL</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Farmacias de Turno</Text>
          <Text style={styles.cardDescription}>
            {region === '8'
              ? 'Locales 24 hrs abiertos hoy en Mostazal, Rancagua, Rengo, San Fernando y toda la región.'
              : 'Locales de turno hoy en Santiago Centro, Providencia, Maipú, Puente Alto y toda la RM.'}
          </Text>

          <View style={styles.actionArrowRow}>
            <Text style={styles.actionText}>Ver farmacias abiertas</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Tarjeta Urgencias */}
        <TouchableOpacity
          style={styles.heroCardUrgency}
          activeOpacity={0.88}
          onPress={() => router.push('/(tabs)/urgencias')}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="pulse" size={24} color="#FFFFFF" />
            </View>
            <View style={[styles.cardTag, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.cardTagText}>24/7 RED PÚBLICA</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Centros de Urgencia</Text>
          <Text style={styles.cardDescription}>
            {region === '8'
              ? 'Hospital Regional Rancagua, SAR, SAPU y red hospitalaria de O’Higgins con discado directo.'
              : 'Posta Central, Sótero del Río, Barros Luco, SAR y SAPU de Santiago con enlace GPS directo.'}
          </Text>

          <View style={styles.actionArrowRow}>
            <Text style={styles.actionText}>Ver centros de urgencia</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Números SOS */}
        <View style={styles.emergencySection}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
            Números de Emergencia Nacional (SOS)
          </Text>

          <View style={styles.sosGrid}>
            <TouchableOpacity
              style={[styles.sosCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.8}
              onPress={() => callEmergency('131')}
            >
              <View style={[styles.sosIconBox, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sosNumber, { color: colors.text }]}>131</Text>
                <Text style={[styles.sosName, { color: colors.subtext }]}>SAMU Ambulancia</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sosCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.8}
              onPress={() => callEmergency('133')}
            >
              <View style={[styles.sosIconBox, { backgroundColor: '#059669' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sosNumber, { color: colors.text }]}>133</Text>
                <Text style={[styles.sosName, { color: colors.subtext }]}>Carabineros</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sosCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.8}
              onPress={() => callEmergency('132')}
            >
              <View style={[styles.sosIconBox, { backgroundColor: '#EA580C' }]}>
                <Ionicons name="flame" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sosNumber, { color: colors.text }]}>132</Text>
                <Text style={[styles.sosName, { color: colors.subtext }]}>Bomberos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sosCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.8}
              onPress={() => callEmergency('134')}
            >
              <View style={[styles.sosIconBox, { backgroundColor: '#2563EB' }]}>
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sosNumber, { color: colors.text }]}>134</Text>
                <Text style={[styles.sosName, { color: colors.subtext }]}>PDI Policial</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 30,
  },
  header: { marginBottom: 20, gap: 12 },
  brandBox: { gap: 4 },
  regionBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  regionBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  appTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 13 },
  regionContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  regionOption: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9 },
  regionOptionText: { fontSize: 12, fontWeight: '700' },
  heroCardPharmacy: { backgroundColor: '#059669', borderRadius: 20, padding: 20, marginBottom: 14 },
  heroCardUrgency: { backgroundColor: '#DC2626', borderRadius: 20, padding: 20, marginBottom: 22 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTag: { backgroundColor: 'rgba(255, 255, 255, 0.22)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cardTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  cardDescription: { fontSize: 13, color: 'rgba(255, 255, 255, 0.88)', lineHeight: 18, marginBottom: 16 },
  actionArrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emergencySection: { marginTop: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    gap: 10,
  },
  sosIconBox: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  sosNumber: { fontSize: 15, fontWeight: '800' },
  sosName: { fontSize: 11, fontWeight: '600' },
});
