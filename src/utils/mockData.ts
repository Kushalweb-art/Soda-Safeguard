
import { CsvDataset, PostgresConnection, ValidationCheck, ValidationResult } from '../types';

// Mock PostgreSQL connections
export const mockPostgresConnections: PostgresConnection[] = [
  {
    id: '1',
    name: 'Production Database',
    host: 'db.example.com',
    port: 5432,
    database: 'production',
    username: 'admin',
    password: '********',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tables: [
      {
        name: 'customers',
        schema: 'public',
        columns: [
          { name: 'id', dataType: 'uuid' },
          { name: 'first_name', dataType: 'varchar' },
          { name: 'last_name', dataType: 'varchar' },
          { name: 'email', dataType: 'varchar' },
          { name: 'created_at', dataType: 'timestamp' },
        ],
      },
      {
        name: 'orders',
        schema: 'public',
        columns: [
          { name: 'id', dataType: 'uuid' },
          { name: 'customer_id', dataType: 'uuid' },
          { name: 'order_date', dataType: 'timestamp' },
          { name: 'total_amount', dataType: 'numeric' },
          { name: 'status', dataType: 'varchar' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Staging Database',
    host: 'staging-db.example.com',
    port: 5432,
    database: 'staging',
    username: 'dev',
    password: '********',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tables: [
      {
        name: 'users',
        schema: 'public',
        columns: [
          { name: 'id', dataType: 'uuid' },
          { name: 'username', dataType: 'varchar' },
          { name: 'email', dataType: 'varchar' },
          { name: 'created_at', dataType: 'timestamp' },
        ],
      },
    ],
  },
];

// Mock CSV datasets
export const mockCsvDatasets: CsvDataset[] = [
  {
    id: '1',
    name: 'Customer Data 2023',
    fileName: 'customer_data_2023.csv',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    columns: ['id', 'name', 'email', 'country', 'signup_date'],
    rowCount: 1243,
    previewData: [
      { id: 1, name: 'John Doe', email: 'john@example.com', country: 'US', signup_date: '2023-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', country: 'UK', signup_date: '2023-01-16' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', country: 'CA', signup_date: '2023-01-17' },
    ],
  },
  {
    id: '2',
    name: 'Sales Data Q1',
    fileName: 'sales_q1_2023.csv',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    columns: ['order_id', 'product_id', 'quantity', 'price', 'date'],
    rowCount: 587,
    previewData: [
      { order_id: 1001, product_id: 'P001', quantity: 2, price: 29.99, date: '2023-01-05' },
      { order_id: 1002, product_id: 'P002', quantity: 1, price: 49.99, date: '2023-01-06' },
      { order_id: 1003, product_id: 'P001', quantity: 3, price: 29.99, date: '2023-01-07' },
    ],
  },
];

// Mock validation checks
export const mockValidationChecks: ValidationCheck[] = [
  {
    id: '1',
    name: 'Customer Email Validation',
    type: 'regex_match',
    dataset: {
      id: '1',
      name: 'Customer Data 2023',
      type: 'csv',
    },
    column: 'email',
    parameters: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Order Amount Range Check',
    type: 'value_range',
    dataset: {
      id: '1',
      name: 'Production Database',
      type: 'postgres',
    },
    table: 'orders',
    column: 'total_amount',
    parameters: {
      min: 0,
      max: 10000,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock validation results
export const mockValidationResults: ValidationResult[] = [
  {
    id: '1',
    checkId: '1',
    checkName: 'Customer Email Validation',
    dataset: {
      id: '1',
      name: 'Customer Data 2023',
      type: 'csv',
    },
    column: 'email',
    status: 'failed',
    metrics: {
      rowCount: 1243,
      passedCount: 1240,
      failedCount: 3,
      erroredCount: 0,
      executionTimeMs: 456,
    },
    failedRows: [
      { id: 145, name: 'Invalid User', email: 'invalid-email', country: 'US', signup_date: '2023-01-20' },
      { id: 287, name: 'Wrong Format', email: 'wrong@format', country: 'CA', signup_date: '2023-02-14' },
      { id: 932, name: 'No Domain', email: 'nodomain@', country: 'UK', signup_date: '2023-03-05' },
    ],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    checkId: '2',
    checkName: 'Order Amount Range Check',
    dataset: {
      id: '1',
      name: 'Production Database',
      type: 'postgres',
    },
    table: 'orders',
    column: 'total_amount',
    status: 'passed',
    metrics: {
      rowCount: 5429,
      passedCount: 5429,
      failedCount: 0,
      erroredCount: 0,
      executionTimeMs: 678,
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];
