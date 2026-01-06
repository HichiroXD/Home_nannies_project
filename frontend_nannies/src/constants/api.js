/**
 * Constantes relacionadas con la API
 */

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/users/login/',
  REGISTER: '/users/register/',
  LOGOUT: '/users/logout/',
  REFRESH_TOKEN: '/users/token/refresh/',
  VERIFY_EMAIL: '/users/verify-email/',
  FORGOT_PASSWORD: '/users/password-reset/',
  RESET_PASSWORD: '/users/password-reset/confirm/',
  
  // User
  USER_ME: '/users/me/',
  USER_PROFILE: '/users/profile/',
  
  // Nannies
  NANNIES: '/nannies/',
  NANNY_PROFILE: '/nannies/profile/',
  NANNY_AVAILABILITY: '/nannies/availability/',
  NANNY_VERIFY: '/nannies/verify/',
  
  // Parents
  PARENTS: '/parents/',
  PARENT_PROFILE: '/parents/profile/',
  PARENT_CHILDREN: '/parents/children/',
  
  // Bookings
  BOOKINGS: '/bookings/',
  BOOKING_REQUESTS: '/bookings/requests/',
  BOOKING_HISTORY: '/bookings/history/',
  
  // Favorites
  FAVORITES: '/favorites/',
  
  // Reviews
  REVIEWS: '/reviews/',
  
  // Notifications
  NOTIFICATIONS: '/notifications/',
  
  // Reports (Admin)
  REPORTS: '/reports/',
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
