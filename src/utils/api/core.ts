
import { ApiResponse } from '@/types';
import { toast } from '@/components/ui/use-toast';

// API base URL - dynamically determine based on environment
export const API_BASE_URL = import.meta.env.DEV 
  ? (window.location.hostname.includes('github.dev') 
      ? `${window.location.protocol}//${window.location.hostname.replace('-8080', '-8000')}/api`
      : 'http://localhost:8000/api')
  : window.location.origin + '/api';

console.log('Using API base URL:', API_BASE_URL);

// Helper function to simulate API latency in development for smoother UX
export const simulateLatency = async () => {
  if (import.meta.env.DEV) {
    const latency = 100 + Math.random() * 200;
    return new Promise(resolve => setTimeout(resolve, latency));
  }
};

// Function to handle API errors consistently
export const handleError = (error: any): ApiResponse<never> => {
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

// Generic fetch function with improved error handling
export const fetchApi = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    await simulateLatency();
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API error (${response.status}): ${errorData.error || response.statusText}`);
      return {
        success: false,
        error: errorData.error || `Error: ${response.status} ${response.statusText}`,
      };
    }
    
    const data = await response.json();
    console.log(`API response from ${endpoint}:`, data);
    
    return data;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    return handleError(error);
  }
};
