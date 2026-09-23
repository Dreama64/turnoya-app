export interface ContactoSOS {
  id: string;
  nombre: string;
  descripcion: string;
  numero: string;
  tipo: 'NACIONAL' | 'COMUNAL';
  color: string;
  icono: string;
}

export const CONTACTOS_SOS: ContactoSOS[] = [
  // Nacionales
  {
    id: '1',
    nombre: 'SAMU Urgencia Médica',
    descripcion: 'Ambulancias y emergencias vitales',
    numero: '131',
    tipo: 'NACIONAL',
    color: '#EF4444',
    icono: 'medical',
  },
  {
    id: '2',
    nombre: 'Bomberos de Chile',
    descripcion: 'Incendios, rescate vehicular y materiales',
    numero: '132',
    tipo: 'NACIONAL',
    color: '#F97316',
    icono: 'flame',
  },
  {
    id: '3',
    nombre: 'Carabineros de Chile',
    descripcion: 'Emergencias policiales y delitos',
    numero: '133',
    tipo: 'NACIONAL',
    color: '#10B981',
    icono: 'shield',
  },
  {
    id: '4',
    nombre: 'PDI (Investigaciones)',
    descripcion: 'Denuncias y emergencias policiales',
    numero: '134',
    tipo: 'NACIONAL',
    color: '#3B82F6',
    icono: 'finger-print',
  },
  {
    id: '5',
    nombre: 'Fono Familia Carabineros',
    descripcion: 'Violencia intrafamiliar y contención',
    numero: '149',
    tipo: 'NACIONAL',
    color: '#8B5CF6',
    icono: 'people',
  },

  // Seguridad Comunal Regional
  {
    id: '6',
    nombre: 'Seguridad Ciudadana Rancagua',
    descripcion: 'Patrullaje preventivo comunal 24/7',
    numero: '1451',
    tipo: 'COMUNAL',
    color: '#0284C7',
    icono: 'car',
  },
  {
    id: '7',
    nombre: 'Seguridad Pública Mostazal',
    descripcion: 'Central de vigilancia y patrullaje comunal',
    numero: '+56722358300',
    tipo: 'COMUNAL',
    color: '#0284C7',
    icono: 'car',
  },
  {
    id: '8',
    nombre: 'Seguridad Machalí',
    descripcion: 'Móvil de seguridad y asistencia comunal',
    numero: '1452',
    tipo: 'COMUNAL',
    color: '#0284C7',
    icono: 'car',
  },
  {
    id: '9',
    nombre: 'Seguridad Pública Rengo',
    descripcion: 'Central telefónica de patrullaje municipal',
    numero: '+56722511400',
    tipo: 'COMUNAL',
    color: '#0284C7',
    icono: 'car',
  },
  {
    id: '10',
    nombre: 'Seguridad San Fernando',
    descripcion: 'Emergencias comunales y patrullaje',
    numero: '1455',
    tipo: 'COMUNAL',
    color: '#0284C7',
    icono: 'car',
  },
];
