/**
 * API service for system metrics and reports
 * Sprint 4 - Admin Dashboard Metrics
 */
import api from './api';

const metricsApi = {
  /**
   * Get overview metrics (users, bookings, reviews)
   * @returns {Promise<Object>} Overview metrics
   */
  getOverview: async () => {
    const response = await api.get('/reports/metrics/overview/');
    return response.data;
  },

  /**
   * Get booking metrics by status and period
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Booking metrics
   */
  getBookingMetrics: async (days = 30) => {
    const response = await api.get('/reports/metrics/bookings/', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get revenue metrics
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Revenue metrics
   */
  getRevenueMetrics: async (days = 30) => {
    const response = await api.get('/reports/metrics/revenue/', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get top performing nannies
   * @param {number} limit - Number of results
   * @returns {Promise<Object>} Top nannies list
   */
  getTopNannies: async (limit = 10) => {
    const response = await api.get('/reports/metrics/top-nannies/', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get user activity metrics
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} User activity metrics
   */
  getUserActivityMetrics: async (days = 30) => {
    const response = await api.get('/reports/metrics/user-activity/', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get verification metrics
   * @returns {Promise<Object>} Verification metrics
   */
  getVerificationMetrics: async () => {
    const response = await api.get('/reports/metrics/verification/');
    return response.data;
  },

  /**
   * Get notification metrics
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Notification metrics
   */
  getNotificationMetrics: async (days = 30) => {
    const response = await api.get('/reports/metrics/notifications/', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Download payment report for parents
   * @param {Object} params - Report parameters
   * @param {string} params.format - Report format (csv, pdf, excel)
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {number} params.nannyId - Nanny ID filter
   * @returns {Promise<Blob>} Report file
   */
  downloadPaymentReport: async (params = {}) => {
    const response = await api.get('/bookings/payment-report/', {
      params: {
        format: params.format || 'csv',
        start_date: params.startDate,
        end_date: params.endDate,
        nanny_id: params.nannyId
      },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download bookings report (admin)
   * @param {Object} params - Report parameters
   * @returns {Promise<Blob>} Report file
   */
  downloadBookingsReport: async (params = {}) => {
    const response = await api.get('/reports/bookings-report/', {
      params: {
        format: params.format || 'csv',
        start_date: params.startDate,
        end_date: params.endDate,
        status: params.status,
        nanny_id: params.nannyId,
        parent_id: params.parentId
      },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download users report (admin)
   * @param {Object} params - Report parameters
   * @returns {Promise<Blob>} Report file
   */
  downloadUsersReport: async (params = {}) => {
    const response = await api.get('/reports/users-report/', {
      params: {
        format: params.format || 'csv',
        role: params.role,
        verified: params.verified,
        active: params.active
      },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download payments report (admin)
   * @param {Object} params - Report parameters
   * @returns {Promise<Blob>} Report file
   */
  downloadPaymentsReport: async (params = {}) => {
    const response = await api.get('/reports/payments-report/', {
      params: {
        format: params.format || 'csv',
        start_date: params.startDate,
        end_date: params.endDate,
        nanny_id: params.nannyId,
        parent_id: params.parentId
      },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default metricsApi;
