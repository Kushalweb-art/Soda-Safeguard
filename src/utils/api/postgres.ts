
import { ApiResponse, ApiSchemaResponse, PostgresConnection, PostgresTable, SchemaFetchParams } from '@/types';
import { fetchApi, simulateLatency, handleError, API_BASE_URL } from './core';

export const fetchPostgresConnections = async (): Promise<ApiResponse<PostgresConnection[]>> => {
  return fetchApi<PostgresConnection[]>('/postgres/connections');
};

export const createPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<PostgresConnection>> => {
  try {
    await simulateLatency();
    
    const url = `${API_BASE_URL}/postgres/connections`;
    console.log(`Creating PostgreSQL connection at: ${url}`, connection);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(connection),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorMessage = `Create connection error (${response.status}): ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      console.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    const data = await response.json();
    console.log('Connection created successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Failed to create PostgreSQL connection:', error);
    return handleError(error);
  }
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
    
    const url = `${API_BASE_URL}/postgres/schema?${queryParams.toString()}`;
    console.log(`Fetching database schema from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorMessage = `Schema fetch error (${response.status}): ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      console.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    const data = await response.json();
    console.log('Schema fetched successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch database schema:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching database schema',
    };
  }
};

export const testPostgresConnection = async (connection: Omit<PostgresConnection, 'id' | 'createdAt'>): Promise<ApiResponse<boolean> & { tables?: PostgresTable[], message?: string }> => {
  try {
    await simulateLatency();
    
    const url = `${API_BASE_URL}/postgres/connections/test`;
    console.log(`Testing PostgreSQL connection at: ${url}`, connection);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(connection),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorMessage = `Test connection error (${response.status}): ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      console.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    const data = await response.json();
    console.log('Connection tested successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Failed to test PostgreSQL connection:', error);
    return handleError(error);
  }
};
