import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 초기 상태
const initialState = {
  user: { // 기본 사용자 정보 추가
    username: 'admin',
    role: 'ADMIN',
    name: 'Admin User',
    isAuthenticated: true
  },
  isAuthenticated: true, // 👈 로그인 상태로 변경
  loading: false, // 👈 로딩 상태 제거
  sidebarCollapsed: false,
  notifications: [],
  dashboardData: {
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
  }
};

// 액션 타입 정의
const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  LOGOUT: 'LOGOUT'
};

// 리듀서 함수
function adminReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };
    case ACTION_TYPES.LOGOUT:
        // 로그아웃 시에도 로그인 상태 유지 (요청사항)
      return {
        ...state,
        notifications: [{ id: Date.now(), message: '로그아웃 기능이 비활성화되었습니다.', type: 'info' }]
      };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case ACTION_TYPES.ADD_NOTIFICATION:
      return { ...state, notifications: [{ id: Date.now(), ...action.payload }, ...state.notifications] };
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case ACTION_TYPES.SET_DASHBOARD_DATA:
      return { ...state, dashboardData: action.payload };
    default:
      return state;
  }
}

// React Context 생성
const AdminContext = createContext();

// 커스텀 훅
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Axios 인스턴스 설정
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Provider 컴포넌트
export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // 🚨 앱 로드 시 인증 상태 확인 로직 비활성화
  useEffect(() => {
    // checkAuthentication(); // 주석 처리
  }, []);

  // 쿠키에서 사용자 정보 가져오기 (이제 사용되지 않음)
  const getCookie = (name) => {
    // ... (코드는 유지하되 호출되지 않음)
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // 인증 상태 확인 함수 (이제 사용되지 않음)
  const checkAuthentication = async () => {
    // ... (기능은 유지하되 호출되지 않음)
  };

  // 로그인 함수 (이제 사용되지 않음)
  const login = async (credentials) => {
    addNotification('로그인 기능이 현재 비활성화되어 있습니다.', 'info');
    return { success: true };
  };

  // 로그아웃 함수 (기능 변경)
  const logout = async () => {
    dispatch({ type: ACTION_TYPES.LOGOUT });
  };

  // 회원 관리 API 함수들
  const getAllMembers = async () => {
    try {
      const response = await api.get('/admin/members');
      return response.data; // MemberResponseDTO 배열 반환
    } catch (error) {
      console.error('Failed to fetch members:', error);
      addNotification('회원 목록을 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  const getMemberById = async (id) => {
    try {
      const response = await api.get(`/admin/members/${id}`);
      return response.data; // MemberResponseDTO 반환
    } catch (error) {
      console.error(`Failed to fetch member ${id}:`, error);
      addNotification('회원을 조회하지 못했습니다.', 'error');
      throw error;
    }
  };

  const deleteMember = async (id) => {
    try {
      await api.delete(`/admin/members/${id}`);
      addNotification('회원이 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error(`Failed to delete member ${id}:`, error);
      addNotification('회원 삭제에 실패했습니다.', 'error');
      throw error;
    }
  };

  // 상품 관리 API 함수
  const getAllProducts = async () => {
    try {
      const response = await api.get('/api/admin/products');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      addNotification('상품 목록을 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await api.get(`/api/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      addNotification('상품을 조회하지 못했습니다.', 'error');
      throw error;
    }
  };

  const createProduct = async (productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          formData.append(key, productData[key]);
        }
      });
      const response = await api.post('/admin/product/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        addNotification(response.data.message, 'success');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      addNotification(error.response?.data?.message || '상품 등록에 실패했습니다.', 'error');
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          formData.append(key, productData[key]);
        }
      });
      const response = await api.post(`/admin/product/edit/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        addNotification(response.data.message, 'success');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      addNotification(error.response?.data?.message || '상품 수정에 실패했습니다.', 'error');
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await api.delete(`/api/admin/products/${id}`);
      if (response.data.success) {
        addNotification(response.data.message, 'success');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      addNotification(error.response?.data?.message || '상품 삭제에 실패했습니다.', 'error');
      throw error;
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      addNotification('카테고리 목록을 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  // 구독 플랜 관리 API 함수
  const getAllPlans = async () => {
    try {
      const response = await api.get('/api/admin/plans');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      addNotification('플랜 목록을 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  const getPlanById = async (id) => {
    try {
      const response = await api.get(`/api/admin/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch plan ${id}:`, error);
      addNotification('플랜 정보를 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  const createPlan = async (planData) => {
    try {
      const response = await api.post('/api/admin/plans', planData);
      addNotification('새로운 플랜이 성공적으로 등록되었습니다.', 'success');
      return response.data;
    } catch (error) {
      console.error('Failed to create plan:', error);
      addNotification(error.response?.data?.message || '플랜 등록에 실패했습니다.', 'error');
      throw error;
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      const response = await api.put(`/api/admin/plans/${id}`, planData);
      addNotification('플랜 정보가 성공적으로 수정되었습니다.', 'success');
      return response.data;
    } catch (error) {
      console.error(`Failed to update plan ${id}:`, error);
      addNotification(error.response?.data?.message || '플랜 수정에 실패했습니다.', 'error');
      throw error;
    }
  };
  
  const deletePlan = async (id) => {
    try {
      await api.delete(`/api/admin/plans/${id}`);
      addNotification('플랜이 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error(`Failed to delete plan ${id}:`, error);
      addNotification('플랜 삭제에 실패했습니다.', 'error');
      throw error;
    }
  };

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR });
  };

  // 알림 추가 함수
  const addNotification = (message, type = 'info') => {
    dispatch({
      type: ACTION_TYPES.ADD_NOTIFICATION,
      payload: { message, type }
    });
  };

  // 알림 제거 함수
  const removeNotification = (id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
  };

  // 대시보드 데이터 업데이트 함수
  const updateDashboardData = (data) => {
    dispatch({ type: ACTION_TYPES.SET_DASHBOARD_DATA, payload: data });
  };

  // Context 값
  const contextValue = {
    ...state,
    login,
    logout,
    getAllMembers,
    getMemberById,
    deleteMember,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllCategories,
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    toggleSidebar,
    addNotification,
    removeNotification,
    updateDashboardData,
    checkAuthentication
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}