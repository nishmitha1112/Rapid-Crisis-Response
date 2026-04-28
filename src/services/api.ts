import axios from 'axios';
import { EmergencyEvent, EmergencyResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emergencyApi = {
  processEvent: async (event: EmergencyEvent): Promise<EmergencyResponse> => {
    const response = await api.post('/process', event);
    return response.data;
  },
  
  checkHealth: async (): Promise<{ message: string }> => {
    const response = await api.get('/');
    return response.data;
  },

  getGlobalIntelligence: async (): Promise<any> => {
    const response = await api.get('/global-intelligence');
    return response.data;
  },
};

export default api;
