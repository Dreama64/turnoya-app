import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RawPharmacy {
  fecha: string;
  local_id: string;
  local_nombre: string;
  comuna_nombre: string;
  localidad_nombre: string;
  local_direccion: string;
  funcionamiento_hora_apertura: string;
  funcionamiento_hora_cierre: string;
  local_telefono: string;
  local_lat: string;
  local_lng: string;
  funcionamiento_dia: string;
  fk_region: string;
}

const CACHE_PREFIX = '@turnoya_pharmacy_cache_';

export async function fetchFarmacias(
  regionId: string = '8'
): Promise<{ data: RawPharmacy[]; isFromCache: boolean; error: boolean }> {
  const cacheKey = `${CACHE_PREFIX}${regionId}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 segundos de timeout

    const response = await fetch('https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Respuesta inválida del servidor MINSAL');

    const rawData: RawPharmacy[] = await response.json();
    const regionData = rawData.filter((item) => item.fk_region === regionId);

    if (regionData.length > 0) {
      // Guardar en respaldo local
      AsyncStorage.setItem(cacheKey, JSON.stringify(regionData)).catch(() => {});
      return { data: regionData, isFromCache: false, error: false };
    }
  } catch (err) {
    console.warn('Fallo al obtener farmacias en vivo, buscando respaldo local...', err);
  }

  // Si falló la red o timeout, intentamos leer la caché guardada
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsedData: RawPharmacy[] = JSON.parse(cached);
      return { data: parsedData, isFromCache: true, error: false };
    }
  } catch (cacheErr) {
    console.error('Error leyendo caché local:', cacheErr);
  }

  return { data: [], isFromCache: false, error: true };
}
