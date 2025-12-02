/**
 * Constantes de mensajes en español para toda la aplicación.
 * Centraliza todos los textos para facilitar traducción y mantenimiento.
 */

// ===== MENSAJES DE ERROR =====
export const ERROR_MESSAGES = {
  generic: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
  network: 'Error de conexión. Verifica tu internet.',
  unauthorized: 'No tienes permisos para realizar esta acción.',
  notFound: 'El recurso solicitado no existe.',
  sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  serverError: 'Error del servidor. Intenta más tarde.',
  
  // Errores de autenticación
  auth: {
    invalidCredentials: 'Usuario o contraseña incorrectos.',
    emailExists: 'Este correo electrónico ya está registrado.',
    usernameExists: 'Este nombre de usuario no está disponible.',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    loginRequired: 'Debes iniciar sesión para acceder a esta página.',
  },
  
  // Errores de validación
  validation: {
    required: 'Este campo es obligatorio',
    email: 'Ingresa un correo electrónico válido',
    phone: 'Ingresa un número telefónico válido',
    positive: 'Debe ser un número positivo',
    minLength: 'Debe tener al menos {min} caracteres',
    maxLength: 'No puede exceder {max} caracteres',
    invalidFormat: 'Formato inválido',
    pastDate: 'No puedes seleccionar una fecha pasada',
    invalidDateRange: 'La fecha de inicio debe ser anterior a la fecha de fin',
  },
  
  // Errores de reservas
  booking: {
    notAvailable: 'La niñera no está disponible en este horario.',
    alreadyBooked: 'Ya tienes una reserva en este horario.',
    invalidTime: 'Horario inválido seleccionado.',
    tooShort: 'La reserva debe ser de al menos 1 hora.',
    cannotEdit: 'Solo puedes editar reservas pendientes.',
    cannotCancel: 'No puedes cancelar esta reserva.',
  },
  
  // Errores de perfil
  profile: {
    updateFailed: 'Error al actualizar el perfil.',
    imageTooBig: 'La imagen debe ser menor a 5MB.',
    invalidImageFormat: 'Formato de imagen no válido. Usa JPG, PNG o GIF.',
  },
};

// ===== MENSAJES DE ÉXITO =====
export const SUCCESS_MESSAGES = {
  saved: 'Cambios guardados exitosamente',
  deleted: 'Eliminado correctamente',
  created: 'Creado exitosamente',
  updated: 'Actualizado exitosamente',
  
  // Autenticación
  auth: {
    loginSuccess: '¡Bienvenido de vuelta!',
    registerSuccess: '¡Cuenta creada exitosamente!',
    logoutSuccess: 'Sesión cerrada correctamente',
    passwordChanged: 'Contraseña actualizada exitosamente',
  },
  
  // Reservas
  booking: {
    created: 'Reserva creada exitosamente. La niñera será notificada.',
    updated: 'Reserva actualizada exitosamente ✅',
    cancelled: 'Reserva cancelada correctamente',
    accepted: 'Reserva aceptada exitosamente',
    rejected: 'Reserva rechazada',
    completed: 'Reserva marcada como completada',
  },
  
  // Perfil
  profile: {
    updated: 'Perfil actualizado correctamente',
    imageUploaded: 'Imagen subida exitosamente',
  },
  
  // Favoritos
  favorite: {
    added: '¡Niñera añadida a favoritos! ❤️',
    removed: 'Niñera eliminada de favoritos',
  },
  
  // Reseñas
  review: {
    created: 'Reseña publicada exitosamente',
    updated: 'Reseña actualizada',
    deleted: 'Reseña eliminada',
  },
};

// ===== MENSAJES DE ADVERTENCIA =====
export const WARNING_MESSAGES = {
  unsavedChanges: 'Tienes cambios sin guardar. ¿Estás seguro de salir?',
  confirmDelete: '¿Estás seguro de eliminar este elemento?',
  confirmCancel: '¿Estás seguro de cancelar esta reserva?',
  lowRating: 'Tu calificación es baja. Por favor, proporciona comentarios constructivos.',
  incompleteProfile: 'Completa tu perfil para mejorar tu visibilidad',
};

// ===== ESTADOS DE RESERVA =====
export const BOOKING_STATUS = {
  pending: {
    label: 'Pendiente',
    color: '#f59e0b',
    icon: '⏳',
    description: 'Esperando confirmación de la niñera',
  },
  confirmed: {
    label: 'Confirmada',
    color: '#10b981',
    icon: '✅',
    description: 'Reserva confirmada',
  },
  rejected: {
    label: 'Rechazada',
    color: '#ef4444',
    icon: '❌',
    description: 'Reserva rechazada por la niñera',
  },
  cancelled: {
    label: 'Cancelada',
    color: '#6b7280',
    icon: '🚫',
    description: 'Reserva cancelada',
  },
  completed: {
    label: 'Completada',
    color: '#8b5cf6',
    icon: '🎉',
    description: 'Servicio completado',
  },
};

// ===== LABELS DE INTERFAZ =====
export const UI_LABELS = {
  // Navegación
  nav: {
    home: 'Inicio',
    catalog: 'Catálogo',
    myBookings: 'Mis Reservas',
    favorites: 'Favoritos',
    profile: 'Mi Perfil',
    dashboard: 'Panel',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
  },
  
  // Botones
  buttons: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    accept: 'Aceptar',
    reject: 'Rechazar',
    complete: 'Completar',
    back: 'Volver',
    next: 'Siguiente',
    submit: 'Enviar',
    search: 'Buscar',
    filter: 'Filtrar',
    reset: 'Restablecer',
    viewMore: 'Ver más',
    viewLess: 'Ver menos',
    loadMore: 'Cargar más',
  },
  
  // Formularios
  forms: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    username: 'Nombre de usuario',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    address: 'Dirección',
    description: 'Descripción',
    date: 'Fecha',
    time: 'Hora',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    notes: 'Notas adicionales',
  },
  
  // Filtros
  filters: {
    all: 'Todas',
    pending: 'Pendientes',
    confirmed: 'Confirmadas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    rejected: 'Rechazadas',
    verified: 'Verificadas',
    unverified: 'No verificadas',
  },
  
  // Estados de carga
  loading: {
    default: 'Cargando...',
    saving: 'Guardando...',
    deleting: 'Eliminando...',
    uploading: 'Subiendo...',
    processing: 'Procesando...',
  },
  
  // Estados vacíos
  empty: {
    bookings: 'No tienes reservas',
    favorites: 'No tienes niñeras favoritas',
    notifications: 'No hay notificaciones',
    reviews: 'No hay reseñas disponibles',
    results: 'No se encontraron resultados',
  },
};

// ===== PLACEHOLDERS =====
export const PLACEHOLDERS = {
  search: 'Buscar...',
  searchNanny: 'Buscar niñera por nombre...',
  email: 'ejemplo@correo.com',
  phone: '+56 9 1234 5678',
  description: 'Cuéntanos sobre ti...',
  notes: 'Agrega notas adicionales (opcional)',
  comment: 'Escribe tu comentario...',
};

// ===== TOOLTIPS =====
export const TOOLTIPS = {
  addFavorite: 'Agregar a favoritos',
  removeFavorite: 'Quitar de favoritos',
  viewProfile: 'Ver perfil completo',
  editProfile: 'Editar perfil',
  markAsRead: 'Marcar como leída',
  deleteNotification: 'Eliminar notificación',
  dismissNotification: 'Descartar (marcar como leída y ocultar)',
  rating: 'Calificación promedio',
  experience: 'Años de experiencia',
  hourlyRate: 'Tarifa por hora',
  verified: 'Perfil verificado',
  unverified: 'Perfil no verificado',
};

// ===== MENSAJES DE CONFIRMACIÓN =====
export const CONFIRM_MESSAGES = {
  deleteBooking: {
    title: '¿Cancelar reserva?',
    message: 'Esta acción no se puede deshacer. La niñera será notificada.',
    confirm: 'Sí, cancelar',
    cancel: 'No, mantener',
  },
  rejectBooking: {
    title: '¿Rechazar reserva?',
    message: 'El padre será notificado del rechazo.',
    confirm: 'Sí, rechazar',
    cancel: 'No, mantener',
  },
  deleteReview: {
    title: '¿Eliminar reseña?',
    message: 'Esta acción no se puede deshacer.',
    confirm: 'Sí, eliminar',
    cancel: 'Cancelar',
  },
  logout: {
    title: '¿Cerrar sesión?',
    message: 'Tendrás que iniciar sesión nuevamente.',
    confirm: 'Sí, cerrar sesión',
    cancel: 'Cancelar',
  },
};

// ===== MENSAJES INFORMATIVOS =====
export const INFO_MESSAGES = {
  priceExplanation: '💡 El costo total se calcula según las horas reservadas',
  ratingExplanation: 'Calificación basada en {count} reseñas',
  verifiedBadge: '✓ Perfil verificado por el equipo',
  completeProfile: 'Completa tu perfil para aparecer en el catálogo',
  firstBooking: '¡Esta será tu primera reserva con esta niñera!',
  editOnlyPending: 'Solo puedes editar reservas pendientes',
  nannyCannotBook: 'Las niñeras no pueden contactar a otras niñeras',
};

export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  BOOKING_STATUS,
  UI_LABELS,
  PLACEHOLDERS,
  TOOLTIPS,
  CONFIRM_MESSAGES,
  INFO_MESSAGES,
};
