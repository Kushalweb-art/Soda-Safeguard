
import { ApiResponse, CsvDataset } from '@/types';
import { fetchApi, simulateLatency, handleError, API_BASE_URL } from './core';

export const fetchCsvDatasets = async (): Promise<ApiResponse<CsvDataset[]>> => {
  return fetchApi<CsvDataset[]>('/datasets/csv');
};

export const uploadCsvFile = async (file: File): Promise<ApiResponse<CsvDataset>> => {
  try {
    await simulateLatency();
    
    console.log(`Uploading CSV file: ${file.name} (${file.size} bytes)`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${API_BASE_URL}/datasets/csv/upload`;
    console.log(`Making upload request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Upload error (${response.status}): ${errorData.error || response.statusText}`);
      return {
        success: false,
        error: errorData.error || `Error: ${response.status} ${response.statusText}`,
      };
    }
    
    const data = await response.json();
    console.log('CSV upload successful, response:', data);
    
    return data;
  } catch (error) {
    console.error('CSV upload failed:', error);
    return handleError(error);
  }
};
