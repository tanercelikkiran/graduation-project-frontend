import { AxiosError } from 'axios';
import { TFunction } from 'react-i18next';

/**
 * Extract and format error messages from API responses, with special handling for content validation errors
 */
export const getErrorMessage = (error: unknown, t: TFunction): string => {
  if (error instanceof Error) {
    // Check if it's an Axios error with response data
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    if (axiosError.response?.data?.detail) {
      const errorDetail = axiosError.response.data.detail;
      
      // Check for inappropriate content error
      if (errorDetail.toLowerCase().includes('inappropriate') || 
          errorDetail.toLowerCase().includes('content contains') ||
          errorDetail.toLowerCase().includes('inappropriate material')) {
        return t('common.errors.inappropriateContent');
      }
      
      // Check for content validation service failure
      if (errorDetail.toLowerCase().includes('content validation') ||
          errorDetail.toLowerCase().includes('service is currently unavailable') ||
          errorDetail.toLowerCase().includes('content moderation')) {
        return t('common.errors.contentValidationFailed');
      }
      
      // Return the raw error detail for other errors
      return errorDetail;
    }
    
    // Return the general error message
    return error.message;
  }
  
  // Fallback to general error
  return t('common.errors.generalError');
};

/**
 * Check if an error is related to inappropriate content
 */
export const isInappropriateContentError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    if (axiosError.response?.data?.detail) {
      const errorDetail = axiosError.response.data.detail.toLowerCase();
      return errorDetail.includes('inappropriate') || 
             errorDetail.includes('content contains') ||
             errorDetail.includes('inappropriate material');
    }
  }
  
  return false;
};

/**
 * Check if an error is related to content validation service failure
 */
export const isContentValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    if (axiosError.response?.data?.detail) {
      const errorDetail = axiosError.response.data.detail.toLowerCase();
      return errorDetail.includes('content validation') ||
             errorDetail.includes('service is currently unavailable') ||
             errorDetail.includes('content moderation');
    }
  }
  
  return false;
};

/**
 * Log content validation errors for debugging
 */
export const logContentError = (error: unknown, context: string) => {
  if (isInappropriateContentError(error) || isContentValidationError(error)) {
    console.warn(`Content validation error in ${context}:`, error);
  }
};