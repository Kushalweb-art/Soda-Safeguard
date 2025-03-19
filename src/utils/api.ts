
import { toast } from '@/hooks/use-toast';
import { ApiResponse, CsvDataset, PostgresConnection, ValidationCheck, ValidationResult } from '@/types';
import { mockCsvDatasets, mockPostgresConnections, mockValidationChecks, mockValidationResults } from './mockData';

// Since we don't have a real backend, we'll simulate API calls with mock data
// In a real app, these would be actual fetch calls to the backend

// Helper function to simulate API latency
const simulateLatency = async () => {
  const latency = 500 + Math.random() * 1000;
  return new Promise(resolve => setTimeout(resolve, latency));
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

// Datasets API
export const fetchPostgresConnections = async (): Promise<ApiResponse<PostgresConnection[]>> => {
  try {
    await simulateLatency();
    return {
      success: true,
      data: mockPostgresConnections,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const createPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<PostgresConnection>> => {
  try {
    await simulateLatency();
    const newConnection: PostgresConnection = {
      ...connection,
      id: `pg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      tables: [],
    };
    
    // In a real app, we would make a POST request to the backend
    // For now, we'll just return the new connection
    return {
      success: true,
      data: newConnection,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const testPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<boolean>> => {
  try {
    await simulateLatency();
    // Simulate connection test
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const fetchCsvDatasets = async (): Promise<ApiResponse<CsvDataset[]>> => {
  try {
    await simulateLatency();
    return {
      success: true,
      data: mockCsvDatasets,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const uploadCsvFile = async (file: File): Promise<ApiResponse<CsvDataset>> => {
  try {
    await simulateLatency();
    
    // Simulate file upload and processing
    const newDataset: CsvDataset = {
      id: `csv_${Date.now()}`,
      name: file.name.replace('.csv', ''),
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      columns: ['id', 'name', 'email', 'created_at'], // Simulated columns
      rowCount: Math.floor(Math.random() * 1000) + 100,
      previewData: [
        { id: 1, name: 'Sample Name 1', email: 'sample1@example.com', created_at: '2023-01-01' },
        { id: 2, name: 'Sample Name 2', email: 'sample2@example.com', created_at: '2023-01-02' },
        { id: 3, name: 'Sample Name 3', email: 'sample3@example.com', created_at: '2023-01-03' },
      ],
    };
    
    return {
      success: true,
      data: newDataset,
    };
  } catch (error) {
    return handleError(error);
  }
};

// Validation API
export const fetchValidationChecks = async (): Promise<ApiResponse<ValidationCheck[]>> => {
  try {
    await simulateLatency();
    return {
      success: true,
      data: mockValidationChecks,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const createValidationCheck = async (check: Omit<ValidationCheck, 'id' | 'createdAt'>): Promise<ApiResponse<ValidationCheck>> => {
  try {
    await simulateLatency();
    const newCheck: ValidationCheck = {
      ...check,
      id: `check_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: newCheck,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const runValidation = async (checkId: string): Promise<ApiResponse<ValidationResult>> => {
  try {
    await simulateLatency();
    
    // Find the check in our mock data
    const check = mockValidationChecks.find(c => c.id === checkId);
    if (!check) {
      throw new Error('Validation check not found');
    }
    
    // Simulate running the validation
    const result: ValidationResult = {
      id: `result_${Date.now()}`,
      checkId,
      checkName: check.name,
      dataset: check.dataset,
      table: check.table,
      column: check.column,
      status: Math.random() > 0.3 ? 'passed' : 'failed',
      metrics: {
        rowCount: Math.floor(Math.random() * 10000) + 100,
        executionTimeMs: Math.floor(Math.random() * 2000) + 200,
      },
      createdAt: new Date().toISOString(),
    };
    
    if (result.status === 'passed') {
      result.metrics.passedCount = result.metrics.rowCount;
      result.metrics.failedCount = 0;
    } else {
      const failedCount = Math.floor(Math.random() * 20) + 1;
      result.metrics.passedCount = result.metrics.rowCount - failedCount;
      result.metrics.failedCount = failedCount;
      
      // Generate mock failed rows
      result.failedRows = Array.from({ length: failedCount }).map((_, i) => ({
        id: Math.floor(Math.random() * 1000) + 1,
        [check.column || 'value']: `Invalid value ${i + 1}`,
      }));
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
  try {
    await simulateLatency();
    return {
      success: true,
      data: mockValidationResults,
    };
  } catch (error) {
    return handleError(error);
  }
};
