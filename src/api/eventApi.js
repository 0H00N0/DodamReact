import axios from 'axios';

// Spring Boot 백엔드 서버 주소
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
    withCredentials: true, // ✅ JSESSIONID 쿠키 포함

});

/** 모든 이벤트 목록을 가져옵니다. (GET /events) */
export const getAllEvents = () => apiClient.get('/events2');

/** ID로 특정 이벤트 정보를 가져옵니다. (GET /events/{evNum}) */
export const getEventById = (evNum) => apiClient.get(`/events2/${evNum}`);

/** 이벤트 참여를 요청합니다. (POST /events/join) */
export const joinEvent = (joinRequestData) => apiClient.post('/events2/join', joinRequestData);