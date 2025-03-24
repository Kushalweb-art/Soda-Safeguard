
import { ApiResponse, ApiSchemaResponse, PostgresConnection, PostgresTable, SchemaFetchParams } from '@/types';
import { fetchApi, simulateLatency, handleError, API_BASE_URL } from './core';

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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Error: ${response.status} ${response.statusText}`,
      };
    }
    
    const data = await response.json();
    
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
