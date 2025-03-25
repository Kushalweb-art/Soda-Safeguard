// Dataset Types
export interface PostgresConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  createdAt: string;
  tables?: PostgresTable[];
}

export interface PostgresTable {
  name: string;
  schema: string;
  columns: PostgresColumn[];
}

export interface PostgresColumn {
  name: string;
  dataType: string;
}

export interface CsvDataset {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  columns: string[];
  rowCount: number;
  previewData: unknown[];
}

export type Dataset = PostgresConnection | CsvDataset;

// Validation Types
export type ValidationCheckType = 
  | 'missing_values' 
  | 'unique_values' 
  | 'valid_values' 
  | 'value_range' 
  | 'regex_match' 
  | 'schema' 
  | 'custom_sql';

export interface ValidationCheck {
  id: string;
  name: string;
  type: ValidationCheckType;
  dataset: {
    id: string;
    name: string;
    type: 'postgres' | 'csv';
  };
  table?: string;
  column?: string;
  parameters: Record<string, unknown>;
  createdAt: string;
}

export interface FailedRow {
  [key: string]: unknown;
  _reason?: string;
}

export interface ValidationResult {
  id: string;
  checkId: string;
  checkName: string;
  dataset: {
    id: string;
    name: string;
    type: 'postgres' | 'csv';
  };
  table?: string;
  column?: string;
  status: 'passed' | 'warning' | 'failed' | 'error';
  metrics: {
    rowCount?: number;
    passedCount?: number;
    failedCount?: number;
    erroredCount?: number;
    executionTimeMs?: number;
  };
}

// Schema fetching types
export interface SchemaFetchParams {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface ApiSchemaResponse {
  success: boolean;
  tables?: PostgresTable[];
  error?: string;
  message?: string; // Added message property to fix the type error
}

// Component Props
export interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<unknown>;
  label: string;
  active: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export interface PageProps {
  children: React.ReactNode;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
