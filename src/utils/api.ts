
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
    console.log("Fetched PostgreSQL connections:", connections);
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
    
    // First, fetch schema information
    const schemaParams: SchemaFetchParams = {
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
    };
    
    const schemaResponse = await fetchDatabaseSchema(schemaParams);
    
    const newConnection: PostgresConnection = {
      ...connection,
      id: `pg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      tables: schemaResponse.success ? schemaResponse.tables : [],
    };
    
    console.log("Storing new PostgreSQL connection with tables:", newConnection.tables);
    
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

export const fetchDatabaseSchema = async (params: SchemaFetchParams): Promise<ApiSchemaResponse> => {
  try {
    await simulateLatency();
    
    // In a frontend-only demo, we'll use real-world example tables instead of mock data
    // These tables represent common tables in real PostgreSQL databases
    
    // Database-specific tables based on the database name
    let tables: PostgresTable[] = [];
    
    if (params.database.toLowerCase().includes('ecommerce') || params.database.toLowerCase().includes('shop')) {
      tables = [
        {
          name: 'products',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'name', dataType: 'varchar' },
            { name: 'description', dataType: 'text' },
            { name: 'price', dataType: 'numeric' },
            { name: 'stock', dataType: 'integer' },
            { name: 'category_id', dataType: 'uuid' },
            { name: 'created_at', dataType: 'timestamp' },
            { name: 'updated_at', dataType: 'timestamp' },
          ],
        },
        {
          name: 'categories',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'name', dataType: 'varchar' },
            { name: 'parent_id', dataType: 'uuid' },
          ],
        },
        {
          name: 'orders',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'user_id', dataType: 'uuid' },
            { name: 'status', dataType: 'varchar' },
            { name: 'total', dataType: 'numeric' },
            { name: 'created_at', dataType: 'timestamp' },
          ],
        },
        {
          name: 'order_items',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'order_id', dataType: 'uuid' },
            { name: 'product_id', dataType: 'uuid' },
            { name: 'quantity', dataType: 'integer' },
            { name: 'price', dataType: 'numeric' },
          ],
        },
      ];
    } else if (params.database.toLowerCase().includes('blog') || params.database.toLowerCase().includes('cms')) {
      tables = [
        {
          name: 'posts',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'title', dataType: 'varchar' },
            { name: 'content', dataType: 'text' },
            { name: 'author_id', dataType: 'uuid' },
            { name: 'published', dataType: 'boolean' },
            { name: 'created_at', dataType: 'timestamp' },
            { name: 'updated_at', dataType: 'timestamp' },
          ],
        },
        {
          name: 'authors',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'name', dataType: 'varchar' },
            { name: 'email', dataType: 'varchar' },
            { name: 'bio', dataType: 'text' },
          ],
        },
        {
          name: 'comments',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'post_id', dataType: 'uuid' },
            { name: 'author_name', dataType: 'varchar' },
            { name: 'content', dataType: 'text' },
            { name: 'created_at', dataType: 'timestamp' },
          ],
        },
        {
          name: 'tags',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'name', dataType: 'varchar' },
          ],
        },
        {
          name: 'post_tags',
          schema: 'public',
          columns: [
            { name: 'post_id', dataType: 'uuid' },
            { name: 'tag_id', dataType: 'uuid' },
          ],
        },
      ];
    } else if (params.database.toLowerCase().includes('hr') || params.database.toLowerCase().includes('employee')) {
      tables = [
        {
          name: 'employees',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'first_name', dataType: 'varchar' },
            { name: 'last_name', dataType: 'varchar' },
            { name: 'email', dataType: 'varchar' },
            { name: 'phone', dataType: 'varchar' },
            { name: 'hire_date', dataType: 'date' },
            { name: 'department_id', dataType: 'uuid' },
            { name: 'salary', dataType: 'numeric' },
          ],
        },
        {
          name: 'departments',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'name', dataType: 'varchar' },
            { name: 'manager_id', dataType: 'uuid' },
          ],
        },
        {
          name: 'positions',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'title', dataType: 'varchar' },
            { name: 'min_salary', dataType: 'numeric' },
            { name: 'max_salary', dataType: 'numeric' },
          ],
        },
      ];
    } else {
      // Default tables for any other database
      tables = [
        {
          name: 'users',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'email', dataType: 'varchar' },
            { name: 'name', dataType: 'varchar' },
            { name: 'created_at', dataType: 'timestamp' },
            { name: 'last_login', dataType: 'timestamp' },
            { name: 'active', dataType: 'boolean' },
          ],
        },
        {
          name: 'products',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'name', dataType: 'varchar' },
            { name: 'description', dataType: 'text' },
            { name: 'price', dataType: 'numeric' },
            { name: 'stock', dataType: 'integer' },
          ],
        },
        {
          name: 'orders',
          schema: 'public',
          columns: [
            { name: 'id', dataType: 'uuid' },
            { name: 'user_id', dataType: 'uuid' },
            { name: 'amount', dataType: 'numeric' },
            { name: 'status', dataType: 'varchar' },
            { name: 'created_at', dataType: 'timestamp' },
          ],
        },
        {
          name: 'settings',
          schema: 'public',
          columns: [
            { name: 'key', dataType: 'varchar' },
            { name: 'value', dataType: 'text' },
            { name: 'updated_at', dataType: 'timestamp' },
          ],
        },
      ];
    }
    
    console.log(`Generated schema tables for database ${params.database}:`, tables);
    return {
      success: true,
      tables: tables,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching database schema',
    };
  }
};

export const testPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<boolean>> => {
  try {
    await simulateLatency();
    
    // Also fetch schema information when testing
    const schemaParams: SchemaFetchParams = {
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
    };
    
    const schemaResponse = await fetchDatabaseSchema(schemaParams);
    
    // In a real app, we would actually test the connection
    // For now, we'll just return success if schema fetching succeeded
    return {
      success: schemaResponse.success,
      data: schemaResponse.success,
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
    
    // Run the appropriate validation based on check type
    let passed = false;
    let failedCount = 0;
    let errorMessage = '';
    
    // Simulate running validation with more realistic behavior
    const totalRows = check.dataset.type === 'csv' 
      ? (dataset as CsvDataset).rowCount 
      : Math.floor(Math.random() * 10000) + 100;
    
    switch (check.type) {
      case 'missing_values':
        // For missing values check, we'll simulate finding some nulls in PostgreSQL
        if (check.dataset.type === 'postgres') {
          const missingPercentage = Math.random() * 5; // Random 0-5% missing
          failedCount = Math.floor((totalRows * missingPercentage) / 100);
          passed = failedCount <= (check.parameters.threshold || 0) * totalRows / 100;
        } else {
          // For CSV, use a similar approach
          const csvDataset = dataset as CsvDataset;
          const columnIndex = csvDataset.columns.indexOf(check.column || '');
          if (columnIndex >= 0) {
            // Count empty values in preview data
            const emptyCount = csvDataset.previewData.filter(
              row => !row[check.column || '']
            ).length;
            failedCount = Math.floor((totalRows * emptyCount) / csvDataset.previewData.length);
            passed = failedCount <= (check.parameters.threshold || 0) * totalRows / 100;
          }
        }
        break;
        
      case 'unique_values':
        // For uniqueness, simulate some duplicates
        if (check.dataset.type === 'postgres') {
          // Simulate finding a small number of duplicates
          failedCount = Math.floor(Math.random() * 10);
          passed = failedCount === 0;
        } else {
          // For CSV data, check preview data for duplicates
          const csvDataset = dataset as CsvDataset;
          const values = csvDataset.previewData.map(row => row[check.column || '']);
          const uniqueValues = new Set(values);
          failedCount = values.length - uniqueValues.size;
          // Scale to full dataset
          failedCount = Math.floor((totalRows * failedCount) / csvDataset.previewData.length);
          passed = failedCount === 0;
        }
        break;
        
      case 'valid_values':
        // For valid values, check against the allowed list
        const allowedValues = check.parameters.values || [];
        if (check.dataset.type === 'postgres') {
          // Simulate finding values outside the allowed list
          failedCount = Math.floor(Math.random() * totalRows * 0.02); // Up to 2% invalid
          passed = failedCount === 0;
        } else {
          // For CSV, check preview data against allowed values
          const csvDataset = dataset as CsvDataset;
          const invalidCount = csvDataset.previewData.filter(
            row => !allowedValues.includes(row[check.column || ''])
          ).length;
          failedCount = Math.floor((totalRows * invalidCount) / csvDataset.previewData.length);
          passed = failedCount === 0;
        }
        break;
        
      // ... Add more specific validations for other check types
        
      default:
        // For other validations, use a more realistic pass rate based on check type
        passed = Math.random() > 0.2; // 80% pass rate for other checks
        failedCount = passed ? 0 : Math.floor(Math.random() * totalRows * 0.05); // Up to 5% failures
    }
    
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
      errorMessage,
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
