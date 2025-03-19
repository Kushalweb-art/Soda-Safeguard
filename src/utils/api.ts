
import { toast } from '@/hooks/use-toast';
import { ApiResponse, CsvDataset, PostgresConnection, ValidationCheck, ValidationResult } from '@/types';
import { 
  getPostgresConnections, storePostgresConnection,
  getCsvDatasets, storeCsvDataset,
  getValidationChecks, storeValidationCheck,
  getValidationResults, storeValidationResult 
} from './storage';

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

// Postgres Connections API
export const fetchPostgresConnections = async (): Promise<ApiResponse<PostgresConnection[]>> => {
  try {
    await simulateLatency();
    const connections = getPostgresConnections();
    return {
      success: true,
      data: connections,
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
    
    // Store the new connection in localStorage
    storePostgresConnection(newConnection);
    
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
    // In a real app with a backend, this would make an actual connection test
    // For now, we'll just simulate success
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return handleError(error);
  }
};

// CSV Datasets API
export const fetchCsvDatasets = async (): Promise<ApiResponse<CsvDataset[]>> => {
  try {
    await simulateLatency();
    const datasets = getCsvDatasets();
    return {
      success: true,
      data: datasets,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const uploadCsvFile = async (file: File): Promise<ApiResponse<CsvDataset>> => {
  try {
    // Parse the CSV file using FileReader
    const parseCSV = (content: string) => {
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
      
      const rows = [];
      for (let i = 1; i < Math.min(lines.length, 4); i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
      
      return { headers, rows, rowCount: lines.length - 1 };
    };
    
    // Read file content
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    
    const { headers, rows, rowCount } = parseCSV(fileContent);
    
    // Create dataset object
    const newDataset: CsvDataset = {
      id: `csv_${Date.now()}`,
      name: file.name.replace('.csv', ''),
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      columns: headers,
      rowCount,
      previewData: rows,
    };
    
    // Store in localStorage
    storeCsvDataset(newDataset);
    
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
    const checks = getValidationChecks();
    return {
      success: true,
      data: checks,
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
    
    // Store in localStorage
    storeValidationCheck(newCheck);
    
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
    
    // Find the check in our stored data
    const checks = getValidationChecks();
    const check = checks.find(c => c.id === checkId);
    if (!check) {
      throw new Error('Validation check not found');
    }
    
    // Get the dataset
    let dataset;
    if (check.dataset.type === 'csv') {
      const csvDatasets = getCsvDatasets();
      dataset = csvDatasets.find(d => d.id === check.dataset.id);
    } else {
      const pgConnections = getPostgresConnections();
      dataset = pgConnections.find(c => c.id === check.dataset.id);
    }
    
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    
    // Simulate running validation
    // In a real app, this would use a validation library or backend service
    const totalRows = check.dataset.type === 'csv' 
      ? (dataset as CsvDataset).rowCount 
      : Math.floor(Math.random() * 10000) + 100;
    
    // Generate a random result with about 70% pass rate
    const passed = Math.random() > 0.3;
    const failedCount = passed ? 0 : Math.floor(Math.random() * 20) + 1;
    
    const result: ValidationResult = {
      id: `result_${Date.now()}`,
      checkId,
      checkName: check.name,
      dataset: check.dataset,
      table: check.table,
      column: check.column,
      status: passed ? 'passed' : 'failed',
      metrics: {
        rowCount: totalRows,
        executionTimeMs: Math.floor(Math.random() * 2000) + 200,
        passedCount: totalRows - failedCount,
        failedCount,
      },
      createdAt: new Date().toISOString(),
    };
    
    // Add failed rows for CSV datasets if validation failed
    if (!passed && check.dataset.type === 'csv') {
      const csvDataset = dataset as CsvDataset;
      result.failedRows = Array.from({ length: Math.min(failedCount, csvDataset.previewData.length) })
        .map((_, i) => ({
          ...csvDataset.previewData[i],
          _reason: `Failed ${check.type} validation`,
        }));
    }
    
    // Store the result
    storeValidationResult(result);
    
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
    const results = getValidationResults();
    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return handleError(error);
  }
};
