export const featuredProjects = [
  {
    id: 'contenido-ia', title: 'Contenido IA', category: 'IA aplicada', status: 'Producto propio',
    description: 'De una idea a contenido listo para tus redes. Texto e imágenes con IA en un flujo sencillo.',
    scope: 'Desarrollo full stack e integración de modelos de IA.',
    stack: ['React', 'FastAPI', 'Hugging Face'],
    url: 'https://contenido-ia.app/app', image: 'contenido-ia.png',
    alt: 'Interfaz de Contenido IA para elegir las redes de una publicación',
  },
  {
    id: 'monitorias', title: 'Gestión de Monitorías', category: 'Software académico', status: 'Producto propio',
    description: 'Horarios, inscripciones y asistencia en un mismo espacio para estudiantes, monitores y coordinación.',
    scope: 'Desarrollo de la aplicación y sus flujos por rol.',
    stack: ['React', 'FastAPI', 'PostgreSQL'],
    url: 'https://contenido-ia.app/gestion-monitorias/app', image: 'monitorias.png',
    alt: 'Vista de la aplicación de Gestión de Monitorías',
  },
  {
    id: 'bistro', title: 'Bistro Suite', category: 'Producto web', status: 'Demo pública',
    description: 'Una carta digital que conecta la experiencia de pedir con la administración de un restaurante.',
    scope: 'Carta, pedidos y panel de administración.',
    stack: ['Laravel', 'Mithril', 'PostgreSQL'],
    url: 'https://bistro-web-production.up.railway.app/', image: 'bistro.png',
    alt: 'Carta digital de Bistro Suite con platos y categorías',
    note: 'Demo con datos ficticios. No procesa pagos.',
  },
];
