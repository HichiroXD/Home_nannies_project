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
} from './profileApi';

// Nanny API
export {
  getNannies,
  getNannyById,
} from './nannyApi';

// Booking API
export {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from './bookingApi';

// Availability API
export {
  getAvailabilities,
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
  deleteFavorite,
} from './favoriteApi';

// Notification API
export {
  getNotifications,
  getUnreadNotifications,
  getNotification,
  markNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from './notificationApi';

// OCR API
export {
  uploadOCRDocument,
  getOCRStatus,
  extractRUTFromDocument,
  retryOCRDocument,
  cancelOCRProcessing,
} from './ocrApi';

// Children API
export {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
} from './childrenApi';

// Base API instance (para casos especiales)
export { default as API } from './api';
