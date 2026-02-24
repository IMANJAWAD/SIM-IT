import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const simulationApi = {
  runSimulation: async (params) => {
    const response = await api.post('/simulation/run', params);
    return response.data;
  },
  
  getDefaultParams: async () => {
    const response = await api.get('/simulation/default-params');
    return response.data;
  },
};

export const markovApi = {
  analyze: async (params) => {
    const response = await api.post('/markov/analyze', params);
    return response.data;
  },
  
  checkStability: async (arrivalRate, serviceRate, numServers) => {
    const response = await api.get('/markov/stability-check', {
      params: { arrival_rate: arrivalRate, service_rate: serviceRate, num_servers: numServers }
    });
    return response.data;
  },
};

export const analysisApi = {
  runSensitivity: async (params) => {
    const response = await api.post('/analysis/sensitivity', params);
    return response.data;
  },
  
  compare: async (arrivalRate, serviceRate, numServers, numReplications) => {
    const response = await api.post('/analysis/compare', null, {
      params: { arrival_rate: arrivalRate, service_rate: serviceRate, num_servers: numServers, num_replications: numReplications }
    });
    return response.data;
  },
  
  getLongTermBehavior: async (arrivalRate, serviceRate, numServers) => {
    const response = await api.get('/analysis/long-term-behavior', {
      params: { arrival_rate: arrivalRate, service_rate: serviceRate, num_servers: numServers }
    });
    return response.data;
  },
};

export default api;
