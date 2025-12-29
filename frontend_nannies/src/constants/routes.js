/**
 * Constantes para rutas de la aplicación
 */

export const ROUTES = {
  // Públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  NANNY_DASHBOARD: '/nanny/dashboard',
  PARENT_DASHBOARD: '/parent/dashboard',
  
  // Perfiles
  PROFILE: '/profile',
  ADMIN_PROFILE: '/admin/profile',
  NANNY_PROFILE: '/nanny/profile',
  PARENT_PROFILE: '/parent/profile',
  
  // Funcionalidades
  CATALOG: '/catalog',
  BOOKINGS: '/bookings',
  MY_BOOKINGS: '/my-bookings',
  NANNY_REQUESTS: '/nanny-requests',
  NANNY_HISTORY: '/nanny/booking-history',
  FAVORITES: '/favorites',
  AVAILABILITY: '/availability',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  REVIEWS: '/reviews',
  
  // Admin
  ADMIN_REVIEWS: '/admin/reviews',
  
  // Errores
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
};

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
];

export const PROTECTED_ROUTES_BY_ROLE = {
  admin: [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_PROFILE,
    ROUTES.ADMIN_REVIEWS,
  ],
  nanny: [
    ROUTES.NANNY_DASHBOARD,
    ROUTES.NANNY_PROFILE,
    ROUTES.NANNY_REQUESTS,
    ROUTES.NANNY_HISTORY,
    ROUTES.AVAILABILITY,
  ],
  parent: [
    ROUTES.PARENT_DASHBOARD,
    ROUTES.PARENT_PROFILE,
    ROUTES.CATALOG,
    ROUTES.BOOKINGS,
    ROUTES.MY_BOOKINGS,
    ROUTES.FAVORITES,
  ],
};
