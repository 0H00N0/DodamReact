// src/logistics/service/api.js
import axios from 'axios';
import { API_BASE_URL } from '../../api-config';  // ⬅️ 경로 수정

const baseURL = API_BASE_URL ?? `http://${window.location.hostname}:8080`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const DeliveryAPI = {
  me: () => api.get('/delivery/me').then(r=>r.data),
  today: () => api.get('/delivery/assignments/today').then(r=>r.data),
  areas: () => api.get('/delivery/areas').then(r=>r.data),
  mapPoints: () => api.get('/delivery/map/points').then(r=>r.data),
  customerList: (q) => api.get('/delivery/customers', { params: { q }}).then(r=>r.data),
  productCheck: (key) => api.get('/delivery/products/check', { params: { key }}).then(r=>r.data),
  returnCreate: (payload) => api.post('/delivery/returns', payload).then(r=>r.data),
  performance: (from, to) => api.get('/delivery/performance', { params: { from, to }}).then(r=>r.data),
  charges: (from, to) => api.get('/delivery/charges', { params: { from, to }}).then(r=>r.data),
};
