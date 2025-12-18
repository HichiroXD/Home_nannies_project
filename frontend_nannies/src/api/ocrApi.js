/**
 * OCR API Integration Layer
 * Handles communication with Django OCR endpoints
 */

import api from './api';import logger from '../utils/logger';
/**
 * Upload document for OCR processing
 * @param {FormData} formData - Form data containing:
 *   - document_file: File object (JPG, PNG, BMP, GIF, PDF)
 *   - document_type: 'identity_card' | 'passport' | 'other'
 * @returns {Promise} Response with document_id and initial status
 * @throws {Error} Upload error from server
 */
export const uploadOCRDocument = async (formData) => {
  try {
    const response = await api.post('/ocr/upload-document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    logger.error('Error uploading OCR document', { error: error.message });
    throw error;
  }
};

/**
 * Get OCR processing status for a document
 * @param {string} documentId - Document ID returned from uploadOCRDocument
 * @returns {Promise} Response with current status and extracted data if complete
 * @throws {Error} Status check error from server
 */
export const getOCRStatus = async (documentId) => {
  try {
    const response = await api.get(`/ocr/document-status/${documentId}/`);
    return response;
  } catch (error) {
    logger.error('Error getting OCR status', { documentId, error: error.message });
    throw error;
  }
};

/*
 * Extract RUT from uploaded document
 * @param {string} documentId - Document ID
 * @param {string} rawText - Raw text from document for context
 * @returns {Promise} Response with extracted RUT and metadata
 * @throws {Error} Extraction error from server
 */
export const extractRUTFromDocument = async (documentId, rawText = null) => {
  try {
    const payload = {
      document_id: documentId,
    };

    if (rawText) {
      payload.raw_text = rawText;
    }

    const response = await api.post('/ocr/extract-rut/', payload);
    return response;
  } catch (error) {
    logger.error('Error extracting RUT', { error: error.message });
    throw error;
  }
};

/**
 * Retry OCR processing for a document
 * Useful when confidence is low or previous attempt failed
 * @param {string} documentId - Document ID to retry
 * @returns {Promise} Response with new processing attempt
 * @throws {Error} Retry error from server
 */
export const retryOCRDocument = async (documentId) => {
  try {
    const response = await api.post(`/ocr/retry-processing/${documentId}/`);
    return response;
  } catch (error) {
    logger.error('Error retrying OCR', { documentId, error: error.message });
    throw error;
  }
};

/**
 * Cancel OCR processing for a document
 * @param {string} documentId - Document ID to cancel
 * @returns {Promise} Response confirming cancellation
 * @throws {Error} Cancellation error from server
 */
export const cancelOCRProcessing = async (documentId) => {
  try {
    const response = await api.post(`/ocr/cancel-processing/${documentId}/`);
    return response;
  } catch (error) {
    logger.error('Error cancelling OCR', { documentId, error: error.message });
    throw error;
  }
};

/**
 * Get OCR document details
 * @param {string} documentId - Document ID
 * @returns {Promise} Response with full document metadata
 * @throws {Error} Retrieval error from server
 */
export const getOCRDocumentDetails = async (documentId) => {
  try {
    const response = await api.get(`/ocr/document-details/${documentId}/`);
    return response;
  } catch (error) {
    logger.error('Error getting OCR document details', { documentId, error: error.message });
    throw error;
  }
};

/**
 * List user's OCR documents with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise} Response with paginated document list
 * @throws {Error} Retrieval error from server
 */
export const listOCRDocuments = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get('/ocr/documents/', {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response;
  } catch (error) {
    logger.error('Error listing OCR documents', { error: error.message });
    throw error;
  }
};

/**
 * Validate extracted RUT format
 * @param {string} rut - RUT to validate (with or without dashes)
 * @returns {Promise} Response with validation result and formatted RUT
 * @throws {Error} Validation error from server
 */
export const validateRUT = async (rut) => {
  try {
    const response = await api.post('/ocr/validate-rut/', { rut });
    return response;
  } catch (error) {
    logger.error('Error validating RUT', { rut, error: error.message });
    throw error;
  }
};

/**
 * Delete OCR document
 * @param {string} documentId - Document ID to delete
 * @returns {Promise} Response confirming deletion
 * @throws {Error} Deletion error from server
 */
export const deleteOCRDocument = async (documentId) => {
  try {
    const response = await api.delete(`/ocr/documents/${documentId}/`);
    return response;
  } catch (error) {
    logger.error('Error deleting OCR document', { documentId, error: error.message });
    throw error;
  }
};

/**
 * Get OCR processing statistics
 * @returns {Promise} Response with stats (total processed, success rate, etc)
 * @throws {Error} Retrieval error from server
 */
export const getOCRStats = async () => {
  try {
    const response = await api.get('/ocr/statistics/');
    return response;
  } catch (error) {
    logger.error('Error getting OCR statistics', { error: error.message });
    throw error;
  }
};

export default {
  uploadOCRDocument,
  getOCRStatus,
  extractRUTFromDocument,
  retryOCRDocument,
  cancelOCRProcessing,
  getOCRDocumentDetails,
  listOCRDocuments,
  validateRUT,
  deleteOCRDocument,
  getOCRStats,
};
