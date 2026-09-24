import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fetchFarmacias, RawPharmacy } from '../../services/pharmacyService';
import { useTheme } from '../../context/ThemeContext';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';

interface PharmacyWithDistance extends RawPharmacy {
  distanceKm?: number;
}

export default function FarmaciasScreen() {
  const { colors, isDark, region, setRegion } = useTheme();
  const [data, setData] = useState<RawPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string>('Todas');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sortByGps, setSortByGps] = useState(false);

  const loadData = useCallback(
    async (regId: '8' | '7', isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setHasError(false);

      const result = await fetchFarmacias(regId);

      if (result.error && result.data.length === 0) {
        setHasError(true);
      } else {
        setData(result.data);
        setIsFromCache(result.isFromCache);
      }

      setLoading(false);
      setRefreshing(false);
    },
    []
  );

  useEffect(() => {
    loadData(region);
    setSelectedCommune('Todas');
    setSearch('');
    setSortByGps(false);
  }, [region, loadData]);

  const onRefresh = () => {
    loadData(region, true);
  };

  const handleToggleGps = async () => {
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
          'Concede permiso de ubicación para ordenar las farmacias más cercanas.'
        );
        setGpsLoading(false);
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

  const communes = useMemo(() => {
    const list = Array.from(new Set(data.map((item) => item.comuna_nombre.trim()))).sort();
    return ['Todas', ...list];
  }, [data]);

  const filteredCommunesModal = useMemo(() => {
    if (!modalSearch.trim()) return communes;
    return communes.filter((c) =>
      c.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [communes, modalSearch]);

  const filteredData = useMemo(() => {
    let list: PharmacyWithDistance[] = data.map((item) => {
      const lat = parseFloat(item.local_lat);
      const lng = parseFloat(item.local_lng);
      if (userCoords && !isNaN(lat) && !isNaN(lng)) {
        return {
          ...item,
          distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng),
        };
      }
      return item;
    });

    list = list.filter((item) => {
      const matchSearch =
        search.trim() === '' ||
        item.local_nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.local_direccion.toLowerCase().includes(search.toLowerCase());

      const matchCommune =
        selectedCommune === 'Todas' || item.comuna_nombre.trim() === selectedCommune;

      return matchSearch && matchCommune;
    });

    if (sortByGps && userCoords) {
      list.sort((a, b) => {
        const da = a.distanceKm ?? 99999;
        const db = b.distanceKm ?? 99999;
        return da - db;
      });
    }

    return list;
  }, [data, search, selectedCommune, sortByGps, userCoords]);

  const openNavigation = (lat: string, lng: string) => {
    if (!lat || !lng) return;
    const url =
      Platform.select({
        ios: `maps://app?daddr=${lat},${lng}`,
        android: `google.navigation:q=${lat},${lng}`,
      }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const callPhone = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Header despejado verticalmente */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>Red Farmacias</Text>
          <Text style={[styles.brandSubtitle, { color: colors.subtext }]}>
            Turnos oficiales y atención 24 hrs
          </Text>
        </View>

        {/* Selector de Región en su propia fila */}
        <View
          style={[
            styles.regionContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
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
              Región de O'Higgins
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

      {/* Alerta de datos offline */}
      {isFromCache && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={15} color="#D97706" />
          <Text style={styles.offlineBannerText}>
            Sin conexión directa: mostrando el último turno respaldado.
          </Text>
        </View>
      )}

      {/* Buscador */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.subtext} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar por nombre o calle..."
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros Comuna + GPS */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
          onPress={() => {
            setModalSearch('');
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownLeft}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={[styles.dropdownLabel, { color: colors.subtext }]}>Comuna:</Text>
            <Text style={[styles.dropdownValue, { color: colors.text }]} numberOfLines={1}>
              {selectedCommune}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.gpsButton,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
            sortByGps && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={handleToggleGps}
          activeOpacity={0.8}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color={sortByGps ? '#FFFFFF' : colors.primary} />
          ) : (
            <Ionicons
              name={sortByGps ? 'navigate' : 'navigate-outline'}
              size={17}
              color={sortByGps ? '#FFFFFF' : colors.primary}
            />
          )}
          <Text
            style={[
              styles.gpsButtonText,
              { color: sortByGps ? '#FFFFFF' : colors.text },
            ]}
          >
            {sortByGps ? 'Más cercanas' : 'Por GPS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contador */}
      <View style={styles.statusRow}>
        <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.statusLabel, { color: colors.subtext }]}>
          {loading
            ? 'Consultando turnos vigentes...'
            : `${filteredData.length} farmacias ${sortByGps ? 'ordenadas por cercanía' : `en ${selectedCommune === 'Todas' ? (region === '8' ? "Región de O'Higgins" : 'Región Metropolitana') : selectedCommune}`}`}
        </Text>
      </View>

      {/* Lista */}
      {hasError ? (
        <View style={styles.errorBox}>
          <Ionicons name="wifi-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Error de conexión</Text>
          <Text style={[styles.errorSubtitle, { color: colors.subtext }]}>
            No pudimos contactar a los servidores del MINSAL. Revisa tu internet e inténtalo nuevamente.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => loadData(region)}
            activeOpacity={0.8}
          >
            <Ionicons name="reload" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Reintentar conexión</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingMessage, { color: colors.subtext }]}>
            Conectando con el MINSAL...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item.local_id}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const formattedDist = formatDistance(item.distanceKm);

            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.dutyBadge}>
                    <View style={[styles.dutyDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.dutyText, { color: colors.primary }]}>EN TURNO</Text>
                  </View>

                  <View style={styles.topRightRow}>
                    {formattedDist && (
                      <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={11} color="#0284C7" />
                        <Text style={styles.distanceText}>{formattedDist}</Text>
                      </View>
                    )}
                    <Text style={[styles.communeTag, { color: colors.subtext }]}>
                      {item.comuna_nombre}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.pharmacyName, { color: colors.text }]}>
                  {item.local_nombre}
                </Text>
                <Text style={[styles.addressLine, { color: colors.subtext }]}>
                  {item.local_direccion}
                </Text>

                <View style={[styles.scheduleBox, { backgroundColor: colors.chipBackground }]}>
                  <Ionicons name="time-outline" size={14} color="#0284C7" />
                  <Text style={[styles.scheduleDetail, { color: colors.subtext }]}>
                    Horario: {item.funcionamiento_hora_apertura || '09:00'} a{' '}
                    {item.funcionamiento_hora_cierre || '08:30'} hrs
                  </Text>
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.navButton, { backgroundColor: colors.primary }]}
                    onPress={() => openNavigation(item.local_lat, item.local_lng)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={15} color="#FFFFFF" />
                    <Text style={styles.navButtonText}>Cómo llegar</Text>
                  </TouchableOpacity>

                  {item.local_telefono ? (
                    <TouchableOpacity
                      style={[
                        styles.phoneButton,
                        { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                      ]}
                      onPress={() => callPhone(item.local_telefono)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call" size={15} color={colors.text} />
                      <Text style={[styles.phoneButtonText, { color: colors.text }]}>Llamar</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="alert-circle-outline" size={44} color={colors.subtext} />
              <Text style={[styles.emptyTitle, { color: colors.subtext }]}>Sin resultados</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
                No se encontraron farmacias de turno para {selectedCommune}.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Comunas */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Comuna</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.modalSearchBox,
                { backgroundColor: colors.chipBackground },
              ]}
            >
              <Ionicons name="search" size={16} color={colors.subtext} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Filtrar comuna..."
                placeholderTextColor={colors.subtext}
                value={modalSearch}
                onChangeText={setModalSearch}
              />
            </View>

            <FlatList
              data={filteredCommunesModal}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedCommune === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      { borderBottomColor: colors.cardBorder },
                      isSelected && {
                        backgroundColor: isDark
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(5, 150, 105, 0.1)',
                      },
                    ]}
                    onPress={() => {
                      setSelectedCommune(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: colors.text },
                        isSelected && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 28 : 14,
    paddingBottom: 14,
    gap: 12,
  },
  headerTop: {
    gap: 2,
  },
  brandTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  brandSubtitle: { fontSize: 13 },
  regionContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  regionOption: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9 },
  regionOptionText: { fontSize: 12, fontWeight: '700' },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    marginHorizontal: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  offlineBannerText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  controlsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  dropdownLabel: { fontSize: 12 },
  dropdownValue: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  gpsButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 6,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  dutyDot: { width: 5, height: 5, borderRadius: 2.5 },
  dutyText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  communeTag: { fontSize: 12, fontWeight: '700' },
  pharmacyName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  addressLine: { fontSize: 13, marginBottom: 10 },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  scheduleDetail: { fontSize: 12 },
  buttonGroup: { flexDirection: 'row', gap: 8 },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  navButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  phoneButtonText: { fontSize: 13, fontWeight: '600' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingMessage: { fontSize: 13 },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: { fontSize: 18, fontWeight: '800' },
  errorSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  retryButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', maxWidth: 240 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
  },
  modalSearchInput: { flex: 1, fontSize: 14, padding: 0 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  modalItemText: { fontSize: 15, flex: 1, paddingRight: 8 },
});
