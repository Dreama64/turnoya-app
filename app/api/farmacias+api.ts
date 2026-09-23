export async function GET(request: Request) {
  try {
    const res = await fetch(
      'https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (TurnoYa)',
        },
      }
    );

    if (!res.ok) {
      return Response.json(
        { error: 'Error al consultar MINSAL' },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Filtramos solo O'Higgins (fk_region = 8) en el backend
    const ohiggins = data.filter((f: any) => f.fk_region === '8');

    return Response.json(ohiggins);
  } catch (error) {
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
