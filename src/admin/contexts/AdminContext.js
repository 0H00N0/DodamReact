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

  // --- Product Management API ---
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
  
  // --- Category & Brand API ---
  const getAllCategories = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/categories`);
  };

  const createCategory = async (categoryData) => {
    const newCategory = await request(`${API_BASE_URL}/api/v1/admin/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    addNotification('카테고리가 성공적으로 등록되었습니다.', 'success');
    return newCategory;
  };
  
  const getAllBrands = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/brands`);
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
    getAllBrands,
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
    checkAuthentication
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}