
// Storage keys
const STORAGE_KEYS = {
  POSTGRES_CONNECTIONS: 'data_validator_postgres_connections',
  CSV_DATASETS: 'data_validator_csv_datasets',
  VALIDATION_RESULTS: 'data_validator_validation_results',
  VALIDATION_CHECKS: 'data_validator_validation_checks',
};

// Generic get function with type safety
export function getStoredData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving data from localStorage (${key}):`, error);
    return [];
  }
}

// Generic store function
export function storeData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data to localStorage (${key}):`, error);
  }
}

// Store individual item and return updated array
export function storeItem<T extends { id: string }>(key: string, item: T): T[] {
  const existingData = getStoredData<T>(key);
  const newData = [item, ...existingData.filter(d => d.id !== item.id)];
  storeData(key, newData);
  return newData;
}

// Postgres connections
export const getPostgresConnections = () => getStoredData(STORAGE_KEYS.POSTGRES_CONNECTIONS);
export const storePostgresConnection = (connection) => storeItem(STORAGE_KEYS.POSTGRES_CONNECTIONS, connection);

// CSV datasets
export const getCsvDatasets = () => getStoredData(STORAGE_KEYS.CSV_DATASETS);
export const storeCsvDataset = (dataset) => storeItem(STORAGE_KEYS.CSV_DATASETS, dataset);

// Validation checks
export const getValidationChecks = () => getStoredData(STORAGE_KEYS.VALIDATION_CHECKS);
export const storeValidationCheck = (check) => storeItem(STORAGE_KEYS.VALIDATION_CHECKS, check);

// Validation results
export const getValidationResults = () => getStoredData(STORAGE_KEYS.VALIDATION_RESULTS);
export const storeValidationResult = (result) => storeItem(STORAGE_KEYS.VALIDATION_RESULTS, result);
