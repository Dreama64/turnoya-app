import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { VETERINARIAS_DATA, VeterinariaUrgencia } from '../../constants/veterinariasData';

// Fórmula de Haversine para distancia en kilómetros
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function VeterinariasScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedRegion, setSelectedRegion] = useState<'ohiggins' | 'metropolitana'>('ohiggins');
  const [selectedComuna, setSelectedComuna] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [comunaModalVisible, setComunaModalVisible] = useState(false);

  // Estados de GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByGps, setSortByGps] = useState(false);

  // Comunas según región
  const comunasDisponibles = useMemo(() => {
    const list = VETERINARIAS_DATA
      .filter((v) => v.region === selectedRegion)
      .map((v) => v.comuna);
    return ['Todas', ...Array.from(new Set(list))];
  }, [selectedRegion]);

  const handleSelectRegion = (region: 'ohiggins' | 'metropolitana') => {
    setSelectedRegion(region);
    setSelectedComuna('Todas');
  };

  const handleGpsSort = async () => {
    if (sortByGps) {
      setSortByGps(false);
      return;
    }

    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario',
          'Concede permiso de ubicación para ordenar las veterinarias más cercanas.'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      setSortByGps(true);
    } catch (e) {
      Alert.alert(
        'GPS no disponible',
        'No pudimos determinar tu ubicación actual. Revisa que el GPS esté activo.'
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const filteredVets = useMemo(() => {
    let list = VETERINARIAS_DATA.filter((v) => {
      const matchRegion = v.region === selectedRegion;
      const matchComuna =
        selectedComuna === 'Todas' ||
        v.comuna.toLowerCase() === selectedComuna.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        v.nombre.toLowerCase().includes(query) ||
        v.direccion.toLowerCase().includes(query) ||
        v.comuna.toLowerCase().includes(query);

      return matchRegion && matchComuna && matchSearch;
    }).map((item) => {
      let distanceKm: number | null = null;
      if (userCoords && item.lat && item.lng) {
        distanceKm = getDistanceKm(userCoords.lat, userCoords.lng, item.lat, item.lng);
      }
      return { ...item, distanceKm };
    });

    if (sortByGps && userCoords) {
      list.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return list;
  }, [selectedRegion, selectedComuna, searchQuery, sortByGps, userCoords]);

  const handleCall = (telefono: string) => {
    Linking.openURL(`tel:${telefono}`);
  };

  const handleNavigation = (item: VeterinariaUrgencia) => {
    const { lat, lng, nombre, direccion, comuna } = item;
    if (lat && lng) {
      const scheme = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(nombre)}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(nombre)})`,
      });
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      Linking.openURL(scheme || fallbackUrl).catch(() => Linking.openURL(fallbackUrl));
    } else {
      const query = encodeURIComponent(`${direccion}, ${comuna}, Chile`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Cabecera */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Urgencias Veterinarias</Text>
          <Text style={[styles.subTitle, { color: colors.subtext }]}>Turnos oficiales y atención 24 hrs</Text>
        </View>
        <TouchableOpacity style={[styles.configBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="settings" size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* Segmented Control de Región */}
      <View style={[styles.regionSegment, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            selectedRegion === 'ohiggins' && [styles.segmentBtnActive, { backgroundColor: '#7C3AED' }],
          ]}
          onPress={() => handleSelectRegion('ohiggins')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedRegion === 'ohiggins' ? styles.segmentTextActive : { color: colors.subtext },
            ]}
          >
            Región de O'Higgins
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            selectedRegion === 'metropolitana' && [styles.segmentBtnActive, { backgroundColor: '#7C3AED' }],
          ]}
          onPress={() => handleSelectRegion('metropolitana')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedRegion === 'metropolitana' ? styles.segmentTextActive : { color: colors.subtext },
            ]}
          >
            Metropolitana
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.subtext} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar por nombre o calle..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* Fila Filtro Comuna + Botón Por GPS */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.dropdownFilter, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setComunaModalVisible(true)}
        >
          <Ionicons name="location-outline" size={16} color="#7C3AED" />
          <Text style={[styles.dropdownFilterText, { color: colors.text }]} numberOfLines={1}>
            Comuna: {selectedComuna}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.gpsQuickBtn,
            { backgroundColor: colors.card, borderColor: sortByGps ? '#7C3AED' : colors.border },
            sortByGps && { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
          ]}
          onPress={handleGpsSort}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#7C3AED" />
          ) : (
            <>
              <Ionicons
                name={sortByGps ? 'navigate' : 'navigate-outline'}
                size={16}
                color="#7C3AED"
              />
              <Text
                style={[
                  styles.gpsQuickText,
                  { color: sortByGps ? '#7C3AED' : colors.text },
                ]}
              >
                {sortByGps ? 'Cercanas' : 'Por GPS'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Contador de resultados */}
      <View style={styles.counterRow}>
        <View style={[styles.counterDot, { backgroundColor: '#7C3AED' }]} />
        <Text style={[styles.counterText, { color: colors.subtext }]}>
          {filteredVets.length} veterinarias en {selectedRegion === 'ohiggins' ? "Región de O'Higgins" : "Región Metropolitana"}
          {sortByGps ? ' (ordenadas por cercanía)' : ''}
        </Text>
      </View>

      {/* Listado de Tarjetas */}
      <FlatList
        data={filteredVets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listScroll, { paddingBottom: insets.bottom + 28 }]}
        renderItem={({ item }) => (
          <View style={[styles.vetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header Tarjeta */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.atencion === '24 Horas' ? 'rgba(124, 58, 237, 0.18)' : 'rgba(245, 158, 11, 0.18)' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: item.atencion === '24 Horas' ? '#A78BFA' : '#F59E0B' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: item.atencion === '24 Horas' ? '#A78BFA' : '#F59E0B' },
                  ]}
                >
                  {item.atencion === '24 Horas' ? '24 HORAS' : 'LLAMADO URGENCIAS'}
                </Text>
              </View>

              <View style={styles.headerRightInfo}>
                {item.distanceKm !== null && item.distanceKm !== undefined && (
                  <View style={styles.distanceBadge}>
                    <Ionicons name="navigate" size={11} color="#A78BFA" />
                    <Text style={styles.distanceText}>
                      {item.distanceKm < 1
                        ? `${Math.round(item.distanceKm * 1000)} m`
                        : `${item.distanceKm.toFixed(1)} km`}
                    </Text>
                  </View>
                )}
                <Text style={[styles.comunaHeaderTag, { color: colors.subtext }]}>
                  {item.comuna.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Nombre y Dirección */}
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.nombre.toUpperCase()}</Text>
            <Text style={[styles.cardAddress, { color: colors.subtext }]}>{item.direccion.toUpperCase()}</Text>

            {/* Fila Horario / Observación */}
            <View style={[styles.infoBanner, { backgroundColor: colors.border + '35' }]}>
              <Ionicons name="time-outline" size={15} color={colors.subtext} />
              <Text style={[styles.infoBannerText, { color: colors.subtext }]}>
                {item.observacion || (item.atencion === '24 Horas' ? 'Atención continua de 00:00 a 23:59 hrs' : 'Guardia con llamado telefónico')}
              </Text>
            </View>

            {/* Botones de Acción */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: '#7C3AED' }]}
                onPress={() => handleNavigation(item)}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Cómo llegar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { backgroundColor: colors.border + '40' }]}
                onPress={() => handleCall(item.telefono)}
              >
                <Ionicons name="call" size={16} color={colors.text} />
                <Text style={[styles.secondaryActionText, { color: colors.text }]}>Llamar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal para selección de Comuna */}
      <Modal visible={comunaModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setComunaModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Selecciona una comuna</Text>
            <FlatList
              data={comunasDisponibles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedComuna === item && { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
                  ]}
                  onPress={() => {
                    setSelectedComuna(item);
                    setComunaModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      { color: selectedComuna === item ? '#7C3AED' : colors.text },
                      selectedComuna === item && { fontWeight: '700' },
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedComuna === item && <Ionicons name="checkmark" size={18} color="#7C3AED" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTextGroup: { flex: 1 },
  mainTitle: { fontSize: 22, fontWeight: '700' },
  subTitle: { fontSize: 13, marginTop: 2 },
  configBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionSegment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {},
  segmentText: { fontSize: 13, fontWeight: '600' },
  segmentTextActive: { color: '#FFFFFF', fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  dropdownFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  dropdownFilterText: { flex: 1, fontSize: 13, fontWeight: '500' },
  gpsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  gpsQuickText: { fontSize: 13, fontWeight: '600' },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 6,
    marginBottom: 12,
  },
  counterDot: { width: 7, height: 7, borderRadius: 3.5 },
  counterText: { fontSize: 12, fontWeight: '500' },
  listScroll: { paddingHorizontal: 16, gap: 14 },
  vetCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A78BFA',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  comunaHeaderTag: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardAddress: { fontSize: 13, marginBottom: 12 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 14,
  },
  infoBannerText: { fontSize: 12, flex: 1 },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryActionText: { fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalBox: {
    maxHeight: '60%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modalItemText: { fontSize: 14 },
});
