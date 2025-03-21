
import { toast } from '@/hooks/use-toast';
import { 
  ApiResponse, 
  ApiSchemaResponse,
  CsvDataset, 
  PostgresConnection, 
  PostgresTable,
  SchemaFetchParams,
  ValidationCheck, 
  ValidationCheckType,
  ValidationResult 
} from '@/types';

// API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to simulate API latency in development for smoother UX
const simulateLatency = async () => {
  if (process.env.NODE_ENV === 'development') {
    const latency = 500 + Math.random() * 500;
    return new Promise(resolve => setTimeout(resolve, latency));
  }
};

// Function to handle API errors consistently
const handleError = (error: any): ApiResponse<never> => {
  const errorMessage = error?.message || 'An unexpected error occurred';
  console.error('API Error:', error);
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
  return {
    success: false,
    error: errorMessage,
  };
};

// Generic fetch function
const fetchApi = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    await simulateLatency();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status} ${response.statusText}`,
      };
    }
    
    return data;
  } catch (error) {
    return handleError(error);
  }
};

// Postgres Connections API
export const fetchPostgresConnections = async (): Promise<ApiResponse<PostgresConnection[]>> => {
  return fetchApi<PostgresConnection[]>('/postgres/connections');
};

export const createPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<PostgresConnection>> => {
  return fetchApi<PostgresConnection>('/postgres/connections', {
    method: 'POST',
    body: JSON.stringify(connection),
  });
};

export const fetchDatabaseSchema = async (params: SchemaFetchParams): Promise<ApiSchemaResponse> => {
  try {
    await simulateLatency();
    
    const queryParams = new URLSearchParams({
      host: params.host,
      port: params.port.toString(),
      database: params.database,
      username: params.username,
      password: params.password,
    });
    
    const response = await fetch(`${API_BASE_URL}/postgres/schema?${queryParams.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status} ${response.statusText}`,
      };
    }
    
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching database schema',
    };
  }
};

export const testPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<boolean> & { tables?: PostgresTable[], message?: string }> => {
  return fetchApi<boolean>('/postgres/connections/test', {
    method: 'POST',
    body: JSON.stringify(connection),
  });
};

// CSV Datasets API
export const fetchCsvDatasets = async (): Promise<ApiResponse<CsvDataset[]>> => {
  return fetchApi<CsvDataset[]>('/datasets/csv');
};

export const uploadCsvFile = async (file: File): Promise<ApiResponse<CsvDataset>> => {
  try {
    await simulateLatency();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/datasets/csv/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status} ${response.statusText}`,
      };
    }
    
    return data;
  } catch (error) {
    return handleError(error);
  }
};

// Validation API
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
    const startResponse = await fetchApi<any>(`/validation/run/${checkId}`, {
      method: 'POST',
    });
    
    if (!startResponse.success) {
      return startResponse;
    }
    
    // Get the latest validation results
    const resultsResponse = await fetchApi<ValidationResult[]>('/validation/results');
    
    if (!resultsResponse.success || !resultsResponse.data) {
      return resultsResponse;
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
