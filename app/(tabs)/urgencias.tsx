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
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';

export interface HealthCenter {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'SAR' | 'SAPU';
  region: '8' | '7';
  commune: string;
  address: string;
  phone: string;
  isOpen24: boolean;
  lat: number;
  lng: number;
}

interface HealthWithDistance extends HealthCenter {
  distanceKm?: number;
}

const HEALTH_CENTERS: HealthCenter[] = [
  // --- O'HIGGINS ---
  { id: 'oh-1', name: 'Hospital Regional L.B. O’Higgins', type: 'HOSPITAL', region: '8', commune: 'Rancagua', address: 'Av. Libertador Bernardo O’Higgins 3065', phone: '722338000', isOpen24: true, lat: -34.1601, lng: -70.7602 },
  { id: 'oh-2', name: 'Hospital San Juan de Dios de San Fernando', type: 'HOSPITAL', region: '8', commune: 'San Fernando', address: 'Negrete 1401', phone: '722336100', isOpen24: true, lat: -34.5828, lng: -70.9882 },
  { id: 'oh-3', name: 'Hospital Ricardo Valenzuela Sáez', type: 'HOSPITAL', region: '8', commune: 'Rengo', address: 'Av. Renato Correa 120', phone: '722337300', isOpen24: true, lat: -34.4079, lng: -70.8592 },
  { id: 'oh-4', name: 'Hospital Santa Cruz', type: 'HOSPITAL', region: '8', commune: 'Santa Cruz', address: '21 de Mayo 200', phone: '722332100', isOpen24: true, lat: -34.6367, lng: -71.3653 },
  { id: 'oh-5', name: 'Hospital San Vicente de Tagua Tagua', type: 'HOSPITAL', region: '8', commune: 'San Vicente', address: 'Av. Juan Soler Manfredini 102', phone: '722337700', isOpen24: true, lat: -34.4443, lng: -71.0772 },
  { id: 'oh-6', name: 'Hospital de Graneros (Santa Margarita)', type: 'HOSPITAL', region: '8', commune: 'Graneros', address: 'Santa Elena 040', phone: '722337800', isOpen24: true, lat: -34.0621, lng: -70.7289 },
  { id: 'oh-7', name: 'Hospital Mercedes de Chimbarongo', type: 'HOSPITAL', region: '8', commune: 'Chimbarongo', address: 'Miraflores 441', phone: '722337900', isOpen24: true, lat: -34.7078, lng: -71.0425 },
  { id: 'oh-8', name: 'Hospital de Pichilemu', type: 'HOSPITAL', region: '8', commune: 'Pichilemu', address: 'Ortúzar 402', phone: '722333600', isOpen24: true, lat: -34.3871, lng: -72.0042 },
  { id: 'oh-9', name: 'Hospital de Peumo', type: 'HOSPITAL', region: '8', commune: 'Peumo', address: 'Av. Libertador Bernardo O’Higgins 111', phone: '722338600', isOpen24: true, lat: -34.3948, lng: -71.1685 },
  { id: 'oh-10', name: 'Hospital de Pichidegua', type: 'HOSPITAL', region: '8', commune: 'Pichidegua', address: 'Avenida Independencia 340', phone: '722338700', isOpen24: true, lat: -34.3541, lng: -71.2821 },
  { id: 'oh-11', name: 'Hospital de Coinco', type: 'HOSPITAL', region: '8', commune: 'Coinco', address: 'Av. Libertador Bernardo O’Higgins 112', phone: '722338800', isOpen24: true, lat: -34.2541, lng: -70.9321 },
  { id: 'oh-12', name: 'Hospital de Marchigüe', type: 'HOSPITAL', region: '8', commune: 'Marchigüe', address: 'Cardenal Caro s/n', phone: '722338900', isOpen24: true, lat: -34.3972, lng: -71.6214 },
  { id: 'oh-13', name: 'Hospital de Litueche', type: 'HOSPITAL', region: '8', commune: 'Litueche', address: 'Avenida Cardenal Caro 815', phone: '722339100', isOpen24: true, lat: -34.1132, lng: -71.7328 },
  { id: 'oh-14', name: 'Hospital de Lolol', type: 'HOSPITAL', region: '8', commune: 'Lolol', address: 'Los Aromos s/n', phone: '722339200', isOpen24: true, lat: -34.7262, lng: -71.6441 },
  { id: 'oh-15', name: 'SAR Oriente Rancagua', type: 'SAR', region: '8', commune: 'Rancagua', address: 'Av. Alberto Einstein 290', phone: '722241680', isOpen24: true, lat: -34.1782, lng: -70.7241 },
  { id: 'oh-16', name: 'SAR Poniente Rancagua', type: 'SAR', region: '8', commune: 'Rancagua', address: 'Av. Baquedano 750', phone: '722241690', isOpen24: true, lat: -34.1685, lng: -70.7554 },
  { id: 'oh-17', name: 'SAPU Machalí', type: 'SAPU', region: '8', commune: 'Machalí', address: 'Miranda 450', phone: '722731131', isOpen24: true, lat: -34.1822, lng: -70.6514 },
  { id: 'oh-18', name: 'SAPU San Francisco Mostazal', type: 'SAPU', region: '8', commune: 'Mostazal', address: 'Independencia 200', phone: '722491114', isOpen24: true, lat: -33.9856, lng: -70.7161 },
  { id: 'oh-19', name: 'SAPU Codegua', type: 'SAPU', region: '8', commune: 'Codegua', address: 'Andrés Calvo 315', phone: '722481077', isOpen24: false, lat: -34.0351, lng: -70.6712 },
  { id: 'oh-20', name: 'SAPU Requínoa', type: 'SAPU', region: '8', commune: 'Requínoa', address: 'El Abra 400', phone: '722551322', isOpen24: false, lat: -34.2789, lng: -70.8123 },
  { id: 'oh-21', name: 'SAPU Doñihue', type: 'SAPU', region: '8', commune: 'Doñihue', address: 'Rancagua 241', phone: '722462211', isOpen24: false, lat: -34.2251, lng: -70.9632 },
  { id: 'oh-22', name: 'SAPU Coltauco', type: 'SAPU', region: '8', commune: 'Coltauco', address: 'Arturo Prat 45', phone: '722581023', isOpen24: false, lat: -34.2741, lng: -71.0782 },
  { id: 'oh-23', name: 'SAPU Las Cabras', type: 'SAPU', region: '8', commune: 'Las Cabras', address: 'John Kennedy 410', phone: '722501233', isOpen24: true, lat: -34.2912, lng: -71.3092 },
  { id: 'oh-24', name: 'SAPU Oriente San Fernando', type: 'SAPU', region: '8', commune: 'San Fernando', address: 'Mansilla s/n', phone: '722718900', isOpen24: false, lat: -34.5889, lng: -70.9782 },
  // --- METROPOLITANA ---
  { id: 'rm-1', name: 'Hospital Asistencia Pública (Posta Central)', type: 'HOSPITAL', region: '7', commune: 'Santiago', address: 'Curicó 345', phone: '225681000', isOpen24: true, lat: -33.4471, lng: -70.6433 },
  { id: 'rm-2', name: 'Hospital San Juan de Dios (Posta 3)', type: 'HOSPITAL', region: '7', commune: 'Santiago', address: 'Huérfanos 3255', phone: '225742000', isOpen24: true, lat: -33.4418, lng: -70.6784 },
  { id: 'rm-3', name: 'Complejo Hospitalario Barros Luco Trudeau', type: 'HOSPITAL', region: '7', commune: 'San Miguel', address: 'Gran Avenida 3204', phone: '225763000', isOpen24: true, lat: -33.4867, lng: -70.6521 },
  { id: 'rm-4', name: 'Hospital Dr. Sótero del Río', type: 'HOSPITAL', region: '7', commune: 'Puente Alto', address: 'Av. Concha y Toro 3459', phone: '225765000', isOpen24: true, lat: -33.5828, lng: -70.5846 },
  { id: 'rm-5', name: 'Hospital Clínico San Borja Arriarán', type: 'HOSPITAL', region: '7', commune: 'Santiago', address: 'Santa Rosa 1234', phone: '225749000', isOpen24: true, lat: -33.4589, lng: -70.6465 },
  { id: 'rm-6', name: 'Hospital del Salvador', type: 'HOSPITAL', region: '7', commune: 'Providencia', address: 'Av. Salvador 364', phone: '225754000', isOpen24: true, lat: -33.4398, lng: -70.6226 },
  { id: 'rm-7', name: 'Hospital San José (Norte)', type: 'HOSPITAL', region: '7', commune: 'Independencia', address: 'San José 1196', phone: '225748000', isOpen24: true, lat: -33.4182, lng: -70.6558 },
  { id: 'rm-8', name: 'Hospital El Carmen Dr. Luis Valentín Ferrada', type: 'HOSPITAL', region: '7', commune: 'Maipú', address: 'Camino a Rinconada 1201', phone: '226121000', isOpen24: true, lat: -33.5181, lng: -70.7761 },
  { id: 'rm-9', name: 'Hospital Dra. Eloísa Díaz (La Florida)', type: 'HOSPITAL', region: '7', commune: 'La Florida', address: 'Av. Froilán Roa 6524', phone: '225769000', isOpen24: true, lat: -33.5186, lng: -70.5982 },
  { id: 'rm-10', name: 'Hospital Padre Hurtado', type: 'HOSPITAL', region: '7', commune: 'San Ramón', address: 'Esperanza 2150', phone: '225760000', isOpen24: true, lat: -33.5358, lng: -70.6441 },
  { id: 'rm-11', name: 'Hospital Clínico Félix Bulnes', type: 'HOSPITAL', region: '7', commune: 'Cerro Navia', address: 'Av. Mapocho 7432', phone: '225744000', isOpen24: true, lat: -33.4241, lng: -70.7289 },
  { id: 'rm-12', name: 'Hospital Dr. Luis Tisné Brousse', type: 'HOSPITAL', region: '7', commune: 'Peñalolén', address: 'Av. Las Torres 5150', phone: '224725000', isOpen24: true, lat: -33.4771, lng: -70.5692 },
  { id: 'rm-13', name: 'Hospital Parroquial de San Bernardo', type: 'HOSPITAL', region: '7', commune: 'San Bernardo', address: 'O’Higgins 04', phone: '228588000', isOpen24: true, lat: -33.5932, lng: -70.7028 },
  { id: 'rm-14', name: 'Hospital Pediátrico Dr. Exequiel González Cortés', type: 'HOSPITAL', region: '7', commune: 'San Miguel', address: 'Gran Avenida 3300', phone: '225765500', isOpen24: true, lat: -33.4881, lng: -70.6528 },
  { id: 'rm-15', name: 'Hospital de Niños Dr. Roberto del Río', type: 'HOSPITAL', region: '7', commune: 'Independencia', address: 'Profesor Zañartu 1085', phone: '225758000', isOpen24: true, lat: -33.4192, lng: -70.6534 },
  { id: 'rm-16', name: 'Hospital Dr. Luis Calvo Mackenna', type: 'HOSPITAL', region: '7', commune: 'Providencia', address: 'Antonio Varas 360', phone: '225757000', isOpen24: true, lat: -33.4356, lng: -70.6128 },
  { id: 'rm-17', name: 'Hospital San José de Melipilla', type: 'HOSPITAL', region: '7', commune: 'Melipilla', address: 'O’Higgins 551', phone: '225745000', isOpen24: true, lat: -33.6892, lng: -71.2145 },
  { id: 'rm-18', name: 'Hospital de Talagante', type: 'HOSPITAL', region: '7', commune: 'Talagante', address: 'Balmaceda 1458', phone: '225746000', isOpen24: true, lat: -33.6642, lng: -70.9271 },
  { id: 'rm-19', name: 'Hospital de Peñaflor', type: 'HOSPITAL', region: '7', commune: 'Peñaflor', address: 'Vicente Matus 145', phone: '225747000', isOpen24: true, lat: -33.6067, lng: -70.8762 },
  { id: 'rm-20', name: 'Hospital San Luis de Buin', type: 'HOSPITAL', region: '7', commune: 'Buin', address: 'San Martín 448', phone: '225764000', isOpen24: true, lat: -33.7312, lng: -70.7391 },
  { id: 'rm-21', name: 'Complejo Hospitalario San José de Maipo', type: 'HOSPITAL', region: '7', commune: 'San José de Maipo', address: 'Comercio 1941', phone: '225767000', isOpen24: true, lat: -33.6421, lng: -70.3541 },
  { id: 'rm-22', name: 'Hospital de Curacaví', type: 'HOSPITAL', region: '7', commune: 'Curacaví', address: 'Ambrosio O’Higgins 1500', phone: '225745500', isOpen24: true, lat: -33.4072, lng: -71.1342 },
  { id: 'rm-23', name: 'SAR La Reina', type: 'SAR', region: '7', commune: 'La Reina', address: 'Echeñique 8567', phone: '225201448', isOpen24: true, lat: -33.4475, lng: -70.5421 },
  { id: 'rm-24', name: 'SAR Carol Urzúa', type: 'SAR', region: '7', commune: 'Peñalolén', address: 'Av. Consistorial 1960', phone: '229397101', isOpen24: true, lat: -33.4795, lng: -70.5489 },
  { id: 'rm-25', name: 'SAR San Luis', type: 'SAR', region: '7', commune: 'Peñalolén', address: 'Av. Las Torres 5555', phone: '224855000', isOpen24: true, lat: -33.4812, lng: -70.5662 },
  { id: 'rm-26', name: 'SAR Bicentenario Maipú', type: 'SAR', region: '7', commune: 'Maipú', address: 'Av. El Conquistador 1541', phone: '226776100', isOpen24: true, lat: -33.5234, lng: -70.7789 },
  { id: 'rm-27', name: 'SAR Dr. Raúl Silva Henríquez', type: 'SAR', region: '7', commune: 'Pudahuel', address: 'Teniente Cruz 800', phone: '226442100', isOpen24: true, lat: -33.4429, lng: -70.7391 },
  { id: 'rm-28', name: 'SAR Los Quillayes', type: 'SAR', region: '7', commune: 'La Florida', address: 'Julio César 10905', phone: '225769200', isOpen24: true, lat: -33.5467, lng: -70.5798 },
  { id: 'rm-29', name: 'SAR La Bandera', type: 'SAR', region: '7', commune: 'San Ramón', address: 'Av. Américo Vespucio 1501', phone: '225761900', isOpen24: true, lat: -33.5412, lng: -70.6481 },
  { id: 'rm-30', name: 'SAR Conchalí', type: 'SAR', region: '7', commune: 'Conchalí', address: 'Av. Independencia 5661', phone: '228286200', isOpen24: true, lat: -33.3854, lng: -70.6721 },
  { id: 'rm-31', name: 'SAR Recoleta (Zapadores)', type: 'SAR', region: '7', commune: 'Recoleta', address: 'Av. Zapadores 1099', phone: '229457800', isOpen24: true, lat: -33.4012, lng: -70.6412 },
  { id: 'rm-32', name: 'SAR Quinta Normal', type: 'SAR', region: '7', commune: 'Quinta Normal', address: 'Radal 1690', phone: '227732144', isOpen24: true, lat: -33.4382, lng: -70.6991 },
  { id: 'rm-33', name: 'SAR Amador Neghme', type: 'SAR', region: '7', commune: 'Pedro Aguirre Cerda', address: 'La Marina 2494', phone: '223965100', isOpen24: true, lat: -33.4912, lng: -70.6791 },
  { id: 'rm-34', name: 'SAR Dr. Alberto Bachelet', type: 'SAR', region: '7', commune: 'Huechuraba', address: 'Av. Recoleta 5580', phone: '224856000', isOpen24: true, lat: -33.3761, lng: -70.6389 },
  { id: 'rm-35', name: 'SAPU Alejandro del Río', type: 'SAPU', region: '7', commune: 'Puente Alto', address: 'Gandarillas 105', phone: '224854101', isOpen24: true, lat: -33.6062, lng: -70.5768 },
  { id: 'rm-36', name: 'SAPU San José de Chuchunco', type: 'SAPU', region: '7', commune: 'Estación Central', address: 'Coyhaique 6025', phone: '227763600', isOpen24: true, lat: -33.4612, lng: -70.6975 },
  { id: 'rm-37', name: 'SAPU El Aguilucho', type: 'SAPU', region: '7', commune: 'Providencia', address: 'El Aguilucho 3292', phone: '227067000', isOpen24: false, lat: -33.4452, lng: -70.6053 },
  { id: 'rm-38', name: 'SAPU Dr. Norman Voullieme', type: 'SAPU', region: '7', commune: 'Cerrillos', address: 'Salomón Sack 324', phone: '225573400', isOpen24: true, lat: -33.4981, lng: -70.7182 },
  { id: 'rm-39', name: 'SAPU Renca (Hernán Urzúa)', type: 'SAPU', region: '7', commune: 'Renca', address: 'Balmaceda 4015', phone: '226411200', isOpen24: true, lat: -33.4072, lng: -70.7198 },
  { id: 'rm-40', name: 'SAPU Quilicura', type: 'SAPU', region: '7', commune: 'Quilicura', address: 'Manuel Antonio Matta 1250', phone: '226071400', isOpen24: true, lat: -33.3645, lng: -70.7382 },
  { id: 'rm-41', name: 'SAPU Lo Barnechea', type: 'SAPU', region: '7', commune: 'Lo Barnechea', address: 'Av. Las Condes 14891', phone: '227543800', isOpen24: true, lat: -33.3612, lng: -70.5121 },
  { id: 'rm-42', name: 'SAPU Aníbal Ariztía', type: 'SAPU', region: '7', commune: 'Las Condes', address: 'Paul Harris 1000', phone: '229507600', isOpen24: false, lat: -33.4112, lng: -70.5412 },
  { id: 'rm-43', name: 'SAPU Santiago de Nueva Extremadura', type: 'SAPU', region: '7', commune: 'La Pintana', address: 'Av. Juanita 13558', phone: '225750055', isOpen24: true, lat: -33.5681, lng: -70.6321 },
  { id: 'rm-44', name: 'SAPU San Gerónimo', type: 'SAPU', region: '7', commune: 'Puente Alto', address: 'San Pedro 450', phone: '224854300', isOpen24: true, lat: -33.6212, lng: -70.5891 },
  { id: 'rm-45', name: 'SAPU Lo Espejo', type: 'SAPU', region: '7', commune: 'Lo Espejo', address: 'Américo Vespucio 01280', phone: '225056800', isOpen24: true, lat: -33.5189, lng: -70.6912 },
  { id: 'rm-46', name: 'SAPU Edgardo Enríquez', type: 'SAPU', region: '7', commune: 'San Joaquín', address: 'Carlos Valdovinos 240', phone: '225531900', isOpen24: false, lat: -33.4812, lng: -70.6312 },
  { id: 'rm-47', name: 'SAPU Macul', type: 'SAPU', region: '7', commune: 'Macul', address: 'Madreselvas 3200', phone: '228108400', isOpen24: false, lat: -33.4891, lng: -70.5982 },
  { id: 'rm-48', name: 'SAPU Santa Anita', type: 'SAPU', region: '7', commune: 'Lo Prado', address: 'Santa Anita 580', phone: '223887500', isOpen24: true, lat: -33.4441, lng: -70.7231 },
  { id: 'rm-49', name: 'SAPU San Manuel', type: 'SAPU', region: '7', commune: 'Melipilla', address: 'Ruta G-60 s/n', phone: '228323411', isOpen24: false, lat: -33.7412, lng: -71.2589 },
  { id: 'rm-50', name: 'SAPU Isla de Maipo', type: 'SAPU', region: '7', commune: 'Isla de Maipo', address: 'Av. Santelices 761', phone: '228192300', isOpen24: true, lat: -33.7541, lng: -70.8989 },
];

export default function HealthScreen() {
  const { colors, isDark, region, setRegion } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [selectedCommune, setSelectedCommune] = useState<string>('Todas');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sortByGps, setSortByGps] = useState(false);

  const regionCenters = useMemo(() => {
    return HEALTH_CENTERS.filter((item) => item.region === region);
  }, [region]);

  const communes = useMemo(() => {
    const list = Array.from(new Set(regionCenters.map((item) => item.commune.trim()))).sort();
    return ['Todas', ...list];
  }, [regionCenters]);

  const filteredCommunesModal = useMemo(() => {
    if (!modalSearch.trim()) return communes;
    return communes.filter((c) =>
      c.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [communes, modalSearch]);

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
          'Concede permiso de ubicación para ordenar los recintos de urgencia más cercanos.'
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

  const filteredList = useMemo(() => {
    let list: HealthWithDistance[] = regionCenters.map((item) => {
      if (userCoords) {
        return {
          ...item,
          distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, item.lat, item.lng),
        };
      }
      return item;
    });

    list = list.filter((item) => {
      const matchSearch =
        search.trim() === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.address.toLowerCase().includes(search.toLowerCase());

      const matchType = selectedType === 'TODOS' || item.type === selectedType;
      const matchCommune =
        selectedCommune === 'Todas' || item.commune === selectedCommune;

      return matchSearch && matchType && matchCommune;
    });

    if (sortByGps && userCoords) {
      list.sort((a, b) => {
        const da = a.distanceKm ?? 99999;
        const db = b.distanceKm ?? 99999;
        return da - db;
      });
    }

    return list;
  }, [regionCenters, search, selectedType, selectedCommune, sortByGps, userCoords]);

  const openNavigation = (lat: number, lng: number) => {
    const url =
      Platform.select({
        ios: `maps://app?daddr=${lat},${lng}`,
        android: `google.navigation:q=${lat},${lng}`,
      }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
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
          <Text style={[styles.brandTitle, { color: colors.text }]}>Red Urgencias</Text>
          <Text style={[styles.brandSubtitle, { color: colors.subtext }]}>
            Hospitales, SAR y SAPU
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
            onPress={() => {
              setRegion('8');
              setSelectedCommune('Todas');
              setSearch('');
              setSortByGps(false);
            }}
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
            onPress={() => {
              setRegion('7');
              setSelectedCommune('Todas');
              setSearch('');
              setSortByGps(false);
            }}
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
          placeholder="Buscar hospital, SAR, SAPU o calle..."
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

      {/* Controles Comuna + GPS */}
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
            {sortByGps ? 'Más cercanos' : 'Por GPS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de Tipo */}
      <View style={styles.filterRow}>
        {['TODOS', 'HOSPITAL', 'SAR', 'SAPU'].map((cat) => {
          const active = selectedType === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                active && {
                  backgroundColor: isDark ? '#334155' : '#E2E8F0',
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedType(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.subtext },
                  active && { color: colors.primary },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contador */}
      <View style={styles.statusRow}>
        <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.statusLabel, { color: colors.subtext }]}>
          {filteredList.length} recintos {sortByGps ? 'ordenados por cercanía' : `en ${selectedCommune === 'Todas' ? (region === '8' ? "Región de O'Higgins" : 'Región Metropolitana') : selectedCommune}`}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
                <View
                  style={[
                    styles.typeBadge,
                    item.type === 'HOSPITAL' && styles.typeHospital,
                    item.type === 'SAR' && styles.typeSar,
                  ]}
                >
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>

                <View style={styles.topRightRow}>
                  {formattedDist && (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location" size={11} color="#0284C7" />
                      <Text style={styles.distanceText}>{formattedDist}</Text>
                    </View>
                  )}
                  <View style={styles.timeTag}>
                    <Ionicons
                      name={item.isOpen24 ? 'time' : 'time-outline'}
                      size={12}
                      color={item.isOpen24 ? colors.primary : '#F59E0B'}
                    />
                    <Text
                      style={[
                        styles.timeText,
                        { color: item.isOpen24 ? colors.primary : '#F59E0B' },
                      ]}
                    >
                      {item.isOpen24 ? '24 HORAS' : 'CONTINUADO'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.centerName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.addressLine, { color: colors.subtext }]}>
                {item.address} • {item.commune}
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: colors.primary }]}
                  onPress={() => openNavigation(item.lat, item.lng)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={15} color="#FFFFFF" />
                  <Text style={styles.navButtonText}>Cómo llegar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.phoneButton,
                    { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}
                  onPress={() => callPhone(item.phone)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={15} color={colors.text} />
                  <Text style={[styles.phoneButtonText, { color: colors.text }]}>Llamar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="alert-circle-outline" size={44} color={colors.subtext} />
            <Text style={[styles.emptyTitle, { color: colors.subtext }]}>Sin resultados</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
              No se encontraron centros de urgencia para el filtro seleccionado.
            </Text>
          </View>
        }
      />

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
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 13,
  },
  regionContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  regionOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  regionOptionText: {
    fontSize: 12,
    fontWeight: '700',
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: { fontSize: 11, fontWeight: '700' },
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
  typeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeHospital: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  typeSar: { backgroundColor: 'rgba(168, 85, 247, 0.15)' },
  typeText: { color: '#38BDF8', fontSize: 11, fontWeight: '800' },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, fontWeight: '700' },
  centerName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  addressLine: { fontSize: 13, marginBottom: 14 },
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
  modalItemText: { fontSize: 15 },
});
