/**
 * API Barrel Export
 * 
 * Exporta todas las funciones de la API para imports más limpios.
 * 
 * Uso:
 *   import { loginUser, getProfile, getBookings } from '@/api'
 * 
 * En lugar de:
 *   import { loginUser, getProfile } from '@/api/userApi'
 *   import { getBookings } from '@/api/bookingApi'
 */

// User API
export {
  registerUser,
  loginUser,
  getProfile,
  verifyUser,
  requestPasswordReset,
  resetPassword,
} from './userApi';

// Profile API
export {
  getParentProfile,
  updateParentProfile,
  getNannyProfile,
  updateNannyProfile,
  uploadProfileImage,
} from './profileApi';

// Nanny API
export {
  getNannies,
  getNannyById,
  getNannyReviews,
  searchNannies,
} from './nannyApi';

// Booking API
export {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from './bookingApi';

// Availability API
export {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from './availabilityApi';

// Review API
export {
  getReviews,
  createReview,
  deleteReview,
} from './reviewApi';

// Favorite API
export {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from './favoriteApi';

// Notification API
export {
  getNotifications,
  markAsRead,
  deleteNotification,
} from './notificationApi';

// OCR API
export {
  uploadOCRDocument,
  getOCRResults,
  verifyOCRData,
} from './ocrApi';

// Base API instance (para casos especiales)
export { default as API } from './api';
