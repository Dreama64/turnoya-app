export async function GET() {
  try {
    const res = await fetch(
      'https://api.cne.cl/v3/combustibles/vehicular/estaciones?token=none&region=6',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (TurnoYa)',
        },
      }
    );

    // Si la API pública requiere token directo o falla, usamos el endpoint de respaldo de la CNE
    if (!res.ok) {
      const fallbackRes = await fetch(
        'https://www.bencinaenlinea.cl/ws/estaciones.php?region=6'
      );
      if (!fallbackRes.ok) {
        return Response.json(
          { error: 'No se pudo consultar el servicio de bencinas' },
          { status: 502 }
        );
      }
      const fallbackData = await fallbackRes.json();
      return Response.json(fallbackData);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: 'Error interno en API de bencinas' },
      { status: 500 }
    );
  }
}
