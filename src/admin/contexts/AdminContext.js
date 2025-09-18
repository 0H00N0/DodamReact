// src/admin/contexts/AdminContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { API_BASE_URL } from '../../api-config';

const mockPlanNames = [
  { planNameId: 1, planName: '베이직 플랜' },
  { planNameId: 2, planName: '프리미엄 플랜' },
  { planNameId: 3, planName: '엔터프라이즈 플랜' },
];



// --- Initial State and Reducer ---
const initialState = {
  user: { username: 'admin', role: 'ADMIN', name: 'Admin User', isAuthenticated: true },
  isAuthenticated: true,
  loading: false,
  sidebarCollapsed: false,
  notifications: [],
  dashboardData: { totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0, recentOrders: [], topProducts: [] }
};

const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  LOGOUT: 'LOGOUT'
};

function adminReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case ACTION_TYPES.LOGOUT:
      return { ...state, notifications: [{ id: Date.now(), message: '로그아웃 기능이 비활성화되었습니다.', type: 'info' }] };
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
    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: { message, type } });
  };

  // --- API Request Helper ---
  const request = async (url, options = {}) => {
    try {
      const defaultOptions = {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers }
      };
      const response = await fetch(url, { ...defaultOptions, ...options });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'An error occurred on the server.' };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      }
      return {}; 
    } catch (error) {
      console.error('API Request failed:', error);
      addNotification(error.message, 'error');
      throw error;
    }
  };
  // ⬇️ 새로운 함수 추가
  const getAllProductStates = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/prostates`);
  };

  // --- Product Management API ---
   // ⬇️ 새로운 함수 추가
  const getAllProducts = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/products`);
  };
  
  const getProductById = async (id) => {
    return await request(`${API_BASE_URL}/api/v1/admin/products/${id}`);
  };

  const createProduct = async (productData) => {
    const newProduct = await request(`${API_BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    addNotification('상품이 성공적으로 등록되었습니다.', 'success');
    return newProduct;
  };

  const updateProduct = async (id, productData) => {
    const updatedProduct = await request(`${API_BASE_URL}/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    addNotification('상품이 성공적으로 수정되었습니다.', 'success');
    return updatedProduct;
  };
  
  const deleteProduct = async (id) => {
    await request(`${API_BASE_URL}/api/v1/admin/products/${id}`, { method: 'DELETE' });
    addNotification('상품이 성공적으로 삭제되었습니다.', 'success');
  };
  
  // --- Category Management API ---
  const getAllCategories = async () => {
    // 이 함수는 이미 존재할 수 있습니다. URL이 올바른지 확인하세요.
    return await request(`${API_BASE_URL}/api/v1/admin/categories`);
  };

  // ⬇️ 아래 새로운 함수들을 추가합니다 ⬇️
  const createCategory = async (categoryData) => {
    const newCategory = await request(`${API_BASE_URL}/api/v1/admin/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    addNotification('카테고리가 성공적으로 등록되었습니다.', 'success');
    return newCategory;
  };

  const updateCategory = async (id, categoryData) => {
    const updatedCategory = await request(`${API_BASE_URL}/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    addNotification('카테고리가 성공적으로 수정되었습니다.', 'success');
    return updatedCategory;
  };

  const deleteCategory = async (id) => {
    await request(`${API_BASE_URL}/api/v1/admin/categories/${id}`, { method: 'DELETE' });
    addNotification('카테고리가 성공적으로 삭제되었습니다.', 'success');
  };

  // --- Other Functions ---
  const logout = async () => { dispatch({ type: ACTION_TYPES.LOGOUT }) };
  const toggleSidebar = () => { dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR }) };
  const removeNotification = (id) => { dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id }) };
  const updateDashboardData = (data) => { dispatch({ type: ACTION_TYPES.SET_DASHBOARD_DATA, payload: data }) };
  const checkAuthentication = () => { /* no-op */ };
  const login = async (credentials) => { /* no-op */ };
  
  // --- Member Management API ---
  const getAllMembers = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/members`);
  };

  const getMemberById = async (id) => {
    return await request(`${API_BASE_URL}/api/v1/admin/members/${id}`);
  };

  const deleteMember = async (id) => {
    await request(`${API_BASE_URL}/api/v1/admin/members/${id}`, { method: 'DELETE' });
    addNotification(`회원(ID: ${id})이 성공적으로 삭제되었습니다.`, 'success');
  };

  // --- Plan Management API ---
  const getAllPlanNames = async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockPlanNames), 200));
  };

  const getAllPlans = async () => {
    const response = await request(`${API_BASE_URL}/api/v1/admin/plans`);
    return response.map(plan => ({ ...plan, prices: plan.prices || [], benefits: plan.benefits || [] }));
  };

  const getPlanById = async (id) => {
    const response = await request(`${API_BASE_URL}/api/v1/admin/plans/${id}`);
    return { ...response, prices: response.prices || [], benefits: response.benefits || [] };
  };

  const createPlan = async (planData) => {
    const requestData = {
      planName: planData.planName,
      planCode: planData.planCode,
      planActive: planData.planActive,
      prices: planData.prices.map(p => ({ termMonth: parseInt(p.termMonth), ppriceBilMode: p.billMode, ppriceAmount: parseFloat(p.amount), ppriceCurr: p.currency, ppriceActive: true })),
      benefits: planData.benefits.map(b => ({ pbNote: b.note, pbPriceCap: b.priceCap ? parseFloat(b.priceCap) : null }))
    };
    await request(`${API_BASE_URL}/api/v1/admin/plans`, { method: 'POST', body: JSON.stringify(requestData) });
  };

  const updatePlan = async (id, planData) => {
    const requestData = {
      planName: planData.planName,
      planActive: planData.planActive,
      prices: planData.prices.map(p => ({ termMonth: parseInt(p.termMonth), ppriceBilMode: p.billMode, ppriceAmount: parseFloat(p.amount), ppriceCurr: p.currency, ppriceActive: true })),
      benefits: planData.benefits.map(b => ({ pbNote: b.note, pbPriceCap: b.priceCap ? parseFloat(b.priceCap) : null }))
    };
    await request(`${API_BASE_URL}/api/v1/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(requestData) });
  };

  const deletePlan = async (id) => {
    await request(`${API_BASE_URL}/api/v1/admin/plans/${id}`, { method: 'DELETE' });
    addNotification(`플랜(ID: ${id})이 성공적으로 삭제되었습니다.`, 'success');
  };
  
  // --- ⬇️ 1. 이미지 업로드 API 함수 추가 ⬇️ ---
  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile); // 'image'는 백엔드에서 받을 key 이름입니다.

    try {
      // 파일 업로드는 Content-Type을 브라우저가 자동으로 설정하도록 해야 하므로
      // 별도의 fetch 요청을 사용하거나, request 헬퍼를 수정해야 합니다.
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/upload/image`, { // 👈 새 API 엔드포인트
        method: 'POST',
        body: formData,
        credentials: 'include', // 필요 시 포함
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }
      
      // 서버에서는 { "imageUrl": "저장된_경로/이미지.jpg" } 와 같은 JSON을 반환해야 합니다.
      return response.json(); 
    } catch (error) {
      console.error('Image upload failed:', error);
      addNotification(error.message, 'error');
      throw error;
    }
  };

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
    createCategory,
    updateCategory,
    deleteCategory,
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlanNames,
    toggleSidebar,
    addNotification,
    removeNotification,
    updateDashboardData,
    checkAuthentication,
    uploadImage,
    getAllProductStates
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}