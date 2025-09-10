import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api-config';

// Axios 인스턴스 설정
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 데이터 모델 변환 함수
// Frontend -> Backend
const toBackendProduct = (productData) => {
  return {
    productName: productData.proname,
    price: productData.proprice,
    description: productData.prodetai1,
    stockQuantity: 100, // 임시값
    categoryId: productData.catenum,
    brandId: 1, // 임시값
    status: productData.prostat,
  };
};

// Backend -> Frontend
const fromBackendProduct = (product) => {
  return {
    pronum: product.productId,
    proname: product.productName,
    proprice: product.price,
    prodetai1: product.description,
    stockQuantity: product.stockQuantity,
    category: {
      catenum: product.categoryId, // 백엔드 응답에 categoryId가 있다고 가정
      catename: product.categoryName,
    },
    brand: {
      brandId: product.brandId, // 백엔드 응답에 brandId가 있다고 가정
      brandName: product.brandName,
    },
    prostat: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};


// 초기 상태
const initialState = {
  user: {
    username: 'admin',
    role: 'ADMIN',
    name: 'Admin User',
    isAuthenticated: true
  },
  isAuthenticated: true,
  loading: false,
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

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const addNotification = (message, type = 'info') => {
    dispatch({
      type: ACTION_TYPES.ADD_NOTIFICATION,
      payload: { message, type }
    });
  };

  // 회원 관리 API (기존 코드 유지)
  const getAllMembers = async () => { /* ... */ };
  const getMemberById = async (id) => { /* ... */ };
  const deleteMember = async (id) => { /* ... */ };

  // 상품 관리 API 함수
  const getAllProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      return response.data.map(fromBackendProduct);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      addNotification('상품 목록을 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return fromBackendProduct(response.data);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      addNotification('상품을 조회하지 못했습니다.', 'error');
      throw error;
    }
  };

  const createProduct = async (productData) => {
    try {
      const backendProduct = toBackendProduct(productData);
      const response = await api.post('/admin/products', backendProduct);
      addNotification('상품이 성공적으로 등록되었습니다.', 'success');
      return fromBackendProduct(response.data);
    } catch (error) {
      console.error('Failed to create product:', error);
      addNotification(error.response?.data?.message || '상품 등록에 실패했습니다.', 'error');
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const backendProduct = toBackendProduct(productData);
      const response = await api.put(`/admin/products/${id}`, backendProduct);
      addNotification('상품이 성공적으로 수정되었습니다.', 'success');
      return fromBackendProduct(response.data);
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      addNotification(error.response?.data?.message || '상품 수정에 실패했습니다.', 'error');
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      addNotification('상품이 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      addNotification(error.response?.data?.message || '상품 삭제에 실패했습니다.', 'error');
      throw error;
    }
  };

  // 카테고리 및 브랜드 API
  const getAllCategories = async () => {
    try {
      // 이 부분은 실제 백엔드 엔드포인트에 맞게 수정해야 할 수 있습니다.
      //   const response = await api.get('/admin/categories');
      //   return response.data;
      // 임시 데이터
      return [{ catenum: 1, catename: '장난감' }, { catenum: 2, catename: '유모차' }];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      addNotification('카테고리 목록을 불러오지 못했습니다.', 'error');
      throw error;
    }
  };

  const getAllBrands = async () => {
    try {
        // 이 부분은 실제 백엔드 엔드포인트에 맞게 수정해야 할 수 있습니다.
        //   const response = await api.get('/admin/brands');
        //   return response.data;
        // 임시 데이터
        return [{ brandId: 1, brandName: '뽀로로' }, { brandId: 2, brandName: '타요' }];
    } catch (error) {
        console.error('Failed to fetch brands:', error);
        addNotification('브랜드 목록을 불러오지 못했습니다.', 'error');
        throw error;
    }
  };


  // 기타 함수들 (기존 코드 유지)
  const logout = async () => { /* ... */ };
  const toggleSidebar = () => { /* ... */ };
  const removeNotification = (id) => { /* ... */ };
  const updateDashboardData = (data) => { /* ... */ };
  const checkAuthentication = () => { /* ... */ };
  const login = async (credentials) => { /* ... */ };
  const getAllPlans = async () => { /* ... */ };
  const getPlanById = async (id) => { /* ... */ };
  const createPlan = async (planData) => { /* ... */ };
  const updatePlan = async (id, planData) => { /* ... */ };
  const deletePlan = async (id) => { /* ... */ };


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
    getAllBrands, // 추가
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
