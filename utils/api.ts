import Constants from 'expo-constants';

export function getApiUrl(path: string): string {
  // Obtiene la IP y puerto del servidor Metro desde Expo
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8081${path.startsWith('/') ? path : `/${path}`}`;
  }

  // Fallback si no detecta hostUri
  return path;
}
