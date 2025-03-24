
import { ApiResponse, ValidationCheck, ValidationResult } from '@/types';
import { fetchApi, handleError } from './core';

export const fetchValidationChecks = async (): Promise<ApiResponse<ValidationCheck[]>> => {
  return fetchApi<ValidationCheck[]>('/validation/checks');
};

export const createValidationCheck = async (check: Omit<ValidationCheck, 'id' | 'createdAt'>): Promise<ApiResponse<ValidationCheck>> => {
  return fetchApi<ValidationCheck>('/validation/checks', {
    method: 'POST',
    body: JSON.stringify(check),
  });
};

export const runValidation = async (checkId: string): Promise<ApiResponse<ValidationResult>> => {
  try {
    // Start the validation in the background
    const startResponse = await fetchApi<unknown>(`/validation/run/${checkId}`, {
      method: 'POST',
    });
    
    if (!startResponse.success) {
      return {
        success: false,
        error: 'Unexpected response type from validation start API',
      };
    }
    
    // Get the latest validation results
    const resultsResponse = await fetchApi<ValidationResult[]>('/validation/results');
    
    if (!resultsResponse.success || !resultsResponse.data) {
      return {
        success: false,
        error: resultsResponse.error || 'Failed to fetch validation results',
      };
    }
    
    // Find the result for this check
    const result = resultsResponse.data.find(r => r.checkId === checkId);
    
    if (!result) {
      return {
        success: false,
        error: 'Validation result not found',
      };
    }
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const fetchValidationResults = async (): Promise<ApiResponse<ValidationResult[]>> => {
  return fetchApi<ValidationResult[]>('/validation/results');
};
