export interface Farmacia {
  id: string;
  nombre: string;
  comuna: string;
  direccion: string;
  telefono: string;
  horarioApertura: string;
  horarioCierre: string;
  esDeTurno: boolean;
  lat: number;
  lng: number;
  distancia?: number;
}

export async function getFarmaciasOHiggins(): Promise<Farmacia[]> {
  try {
    // 1. Obtener farmacias de turno del MINSAL
    const resTurnos = await fetch('https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php');
    const dataTurnos = resTurnos.ok ? await resTurnos.json() : [];

    // 2. Obtener la lista completa de locales del MINSAL
    let dataTodos: any[] = [];
    try {
      const resTodos = await fetch('https://midas.minsal.cl/farmacia_v2/WS/getLocales.php');
      if (resTodos.ok) dataTodos = await resTodos.json();
    } catch (e) {}

    // Filtrar O'Higgins (Región 8 en MINSAL o nombre O'Higgins)
    const esOHiggins = (item: any) =>
      item.fk_region === '8' ||
      item.fk_region === 8 ||
      item.region_nombre?.toLowerCase().includes('higgins');

    const turnosOHiggins = Array.isArray(dataTurnos) ? dataTurnos.filter(esOHiggins) : [];
    const todosOHiggins = Array.isArray(dataTodos) ? dataTodos.filter(esOHiggins) : [];

    // Conjunto con IDs de locales que están de turno hoy
    const idsTurno = new Set(turnosOHiggins.map((t: any) => String(t.local_id)));

    // Si dataTodos está vacío o falla, usamos al menos los de turno
    const fuentePrincipal = todosOHiggins.length > 0 ? todosOHiggins : turnosOHiggins;

    const farmaciasMap = new Map<string, Farmacia>();

    // Primero agregamos todos los locales
    fuentePrincipal.forEach((item: any) => {
      const id = String(item.local_id || Math.random());
      farmaciasMap.set(id, {
        id,
        nombre: item.local_nombre?.trim() || 'Farmacia',
        comuna: item.comuna_nombre?.trim() || 'O\'Higgins',
        direccion: item.local_direccion?.trim() || '',
        telefono: item.local_telefono?.trim() || '',
        horarioApertura: item.funcionamiento_hora_apertura || '09:00',
        horarioCierre: item.funcionamiento_hora_cierre || '21:00',
        esDeTurno: idsTurno.has(id),
        lat: parseFloat(item.local_lat) || -34.1701,
        lng: parseFloat(item.local_lng) || -70.7407,
      });
    });

    // Asegurar que los de turno figuren siempre activos
    turnosOHiggins.forEach((item: any) => {
      const id = String(item.local_id || Math.random());
      farmaciasMap.set(id, {
        id,
        nombre: item.local_nombre?.trim() || 'Farmacia',
        comuna: item.comuna_nombre?.trim() || 'O\'Higgins',
        direccion: item.local_direccion?.trim() || '',
        telefono: item.local_telefono?.trim() || '',
        horarioApertura: item.funcionamiento_hora_apertura || '08:00',
        horarioCierre: item.funcionamiento_hora_cierre || '08:00',
        esDeTurno: true,
        lat: parseFloat(item.local_lat) || -34.1701,
        lng: parseFloat(item.local_lng) || -70.7407,
      });
    });

    return Array.from(farmaciasMap.values());
  } catch (error) {
    console.warn('Fallo cargando farmacias MINSAL');
    return [];
  }
}
