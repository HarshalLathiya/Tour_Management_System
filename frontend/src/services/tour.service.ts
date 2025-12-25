import api from './api';

export const getTours = () => api.get('/tours');
export const createTour = (data: any) => api.post('/tours', data);
