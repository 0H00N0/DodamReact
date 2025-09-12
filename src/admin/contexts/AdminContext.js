// src/contexts/AdminContext.js

import React, { createContext, useContext, useReducer, useState } from 'react';
import { API_BASE_URL } from '../../api-config'; // API 기본 URL 가져오기

// --- Mock 데이터 (백엔드 대체) ---
let mockProducts = [
  {
    productId: 1,
    productName: '뽀로로 인형',
    price: 25000,
    description: '말하고 노래하는 뽀로로 인형입니다.',
    stockQuantity: 50,
    categoryId: 1,
    categoryName: '장난감',
    brandId: 1,
    brandName: '뽀로로',
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: 2,
    productName: '타요 접이식 유모차',
    price: 150000,
    description: '가볍고 튼튼한 휴대용 유모차입니다.',
    stockQuantity: 20,
    categoryId: 2,
    categoryName: '유모차',
    brandId: 2,
    brandName: '타요',
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: 3,
    productName: '타요 미니카 세트',
    price: 32000,
    description: '타요와 친구들 미니카 4종 세트.',
    stockQuantity: 100,
    categoryId: 1,
    categoryName: '장난감',
    brandId: 2,
    brandName: '타요',
    status: 'RENTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCategories = [
  { catenum: 1, catename: '장난감' },
  { catenum: 2, catename: '유모차' },
  { catenum: 3, catename: '카시트' },
];

const mockBrands = [
  { brandId: 1, brandName: '뽀로로' },
  { brandId: 2, brandName: '타요' },
  { brandId: 3, brandName: '핑크퐁' },
];

// Mock 플랜 이름 데이터 추가
const mockPlanNames = [
  { planNameId: 1, planName: '베이직 플랜' },
  { planNameId: 2, planName: '프리미엄 플랜' },
  { planNameId: 3, planName: '엔터프라이즈 플랜' },
];
// --- Mock 데이터 끝 ---

// 데이터 모델 변환 함수 (기존 유지)
const fromBackendProduct = (product) => {
  return {
    pronum: product.productId,
    proname: product.productName,
    proprice: product.price,
    prodetai1: product.description,
    stockQuantity: product.stockQuantity,
    category: {
      catenum: product.categoryId,
      catename: product.categoryName,
    },
    brand: {
      brandId: product.brandId,
      brandName: product.brandName,
    },
    prostat: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

// 초기 상태 (기존 유지)
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

// 액션 타입 및 리듀서 (기존 유지)
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
  
  // 상태 훅을 사용하여 mockProducts를 관리
  const [products, setProducts] = useState(mockProducts);

  const addNotification = (message, type = 'info') => {
    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: { message, type } });
  };
  
  // --- 상품 관리 API 함수 (Mock 데이터 사용) ---
  const getAllProducts = async () => {
    console.log("Fetching all mock products...");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(products.map(fromBackendProduct));
      }, 500); // 0.5초 지연 시뮬레이션
    });
  };
  
  const getProductById = async (id) => {
    console.log(`Fetching mock product with id: ${id}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.productId === parseInt(id));
        if (product) {
          resolve(fromBackendProduct(product));
        } else {
          reject(new Error('Product not found'));
        }
      }, 300);
    });
  };

  const createProduct = async (productData) => {
    console.log("Creating new mock product:", productData);
    return new Promise(resolve => {
      setTimeout(() => {
        const category = mockCategories.find(c => c.catenum === productData.catenum);
        const brand = mockBrands.find(b => b.brandId === productData.brandId);

        const newProduct = {
          productId: Date.now(), // Unique ID
          productName: productData.proname,
          price: productData.proprice,
          description: productData.prodetai1,
          stockQuantity: productData.stockQuantity,
          categoryId: productData.catenum,
          categoryName: category?.catename || 'N/A',
          brandId: productData.brandId,
          brandName: brand?.brandName || 'N/A',
          status: productData.prostat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setProducts(prev => [...prev, newProduct]);
        addNotification('상품이 성공적으로 등록되었습니다.', 'success');
        resolve(fromBackendProduct(newProduct));
      }, 500);
    });
  };

  const updateProduct = async (id, productData) => {
    console.log(`Updating mock product ${id}:`, productData);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const productIndex = products.findIndex(p => p.productId === parseInt(id));

        if (productIndex === -1) {
          return reject(new Error('Product not found'));
        }
        
        const category = mockCategories.find(c => c.catenum === productData.catenum);
        const brand = mockBrands.find(b => b.brandId === productData.brandId);

        const updatedProduct = {
          ...products[productIndex],
          productName: productData.proname,
          price: productData.proprice,
          description: productData.prodetai1,
          stockQuantity: productData.stockQuantity,
          categoryId: productData.catenum,
          categoryName: category?.catename || 'N/A',
          brandId: productData.brandId,
          brandName: brand?.brandName || 'N/A',
          status: productData.prostat,
          updatedAt: new Date().toISOString(),
        };
        
        const updatedProducts = [...products];
        updatedProducts[productIndex] = updatedProduct;
        setProducts(updatedProducts);
        
        addNotification('상품이 성공적으로 수정되었습니다.', 'success');
        resolve(fromBackendProduct(updatedProduct));
      }, 500);
    });
  };
  
  const deleteProduct = async (id) => {
    console.log(`Deleting mock product with id: ${id}`);
    return new Promise(resolve => {
      setTimeout(() => {
        setProducts(prev => prev.filter(p => p.productId !== id));
        addNotification('상품이 성공적으로 삭제되었습니다.', 'success');
        resolve();
      }, 500);
    });
  };
  
  // 카테고리 및 브랜드 API (Mock 데이터 사용)
  const getAllCategories = async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockCategories), 200));
  };
  
  const getAllBrands = async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockBrands), 200));
  };

  // --- 기타 함수들 (기존 유지) ---
  const logout = async () => { dispatch({ type: ACTION_TYPES.LOGOUT }) };
  const toggleSidebar = () => { dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR }) };
  const removeNotification = (id) => { dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id }) };
  const updateDashboardData = (data) => { dispatch({ type: ACTION_TYPES.SET_DASHBOARD_DATA, payload: data }) };
  const checkAuthentication = () => { /* no-op */ };
  const login = async (credentials) => { /* no-op */ };
  
  // --- 회원 관리 API 함수 ---

  // API 요청을 위한 헬퍼 함수
  const request = async (url, options = {}) => {
    try {
      // CORS 및 credentials 설정 추가
      const defaultOptions = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: '서버 오류가 발생했습니다.' };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // 내용이 없는 응답 (e.g., 204 No Content) 처리
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      }
      return {}; 
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  // 모든 회원 목록 가져오기
  const getAllMembers = async () => {
    try {
      return await request(`${API_BASE_URL}/api/v1/admin/members`);
    } catch (error) {
      addNotification(`회원 목록 로딩 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // ID로 특정 회원 정보 가져오기
  const getMemberById = async (id) => {
    try {
      return await request(`${API_BASE_URL}/api/v1/admin/members/${id}`);
    } catch (error) {
      addNotification(`회원 정보 로딩 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // 회원 삭제 (강제 탈퇴)
  const deleteMember = async (id) => {
    try {
      await request(`${API_BASE_URL}/api/v1/admin/members/${id}`, {
        method: 'DELETE',
      });
      addNotification(`회원(ID: ${id})이 성공적으로 삭제되었습니다.`, 'success');
    } catch (error) {
      addNotification(`회원 삭제 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // --- 플랜 관리 API 함수 (백엔드 API 연동) ---

  // 플랜 이름 목록 가져오기 (새로 추가)
  const getAllPlanNames = async () => {
    // 실제 백엔드에 플랜 이름 API가 있다면 사용, 없다면 mock 데이터 사용
    return new Promise(resolve => setTimeout(() => resolve(mockPlanNames), 200));
  };

  // 모든 플랜 목록 가져오기
  const getAllPlans = async () => {
    try {
      // 백엔드 API 엔드포인트에 맞게 수정
      const response = await request(`${API_BASE_URL}/api/v1/admin/plans`);
      
      // 백엔드 응답 데이터를 프론트엔드 형식으로 변환
      return response.map(plan => ({
        planId: plan.planId,
        planName: plan.planName,
        planCode: plan.planCode,
        planActive: plan.planActive,
        planCreate: plan.planCreate,
        // prices와 benefits는 별도 API나 확장 필요
        prices: [], // 임시로 빈 배열
        benefits: [] // 임시로 빈 배열
      }));
    } catch (error) {
      addNotification(`플랜 목록 로딩 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // ID로 특정 플랜 정보 가져오기
  const getPlanById = async (id) => {
    try {
      const response = await request(`${API_BASE_URL}/api/v1/admin/plans/${id}`);
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      return {
        planId: response.planId,
        planName: response.planName,
        planCode: response.planCode,
        planActive: response.planActive,
        planCreate: response.planCreate,
        // prices와 benefits는 별도 처리 필요
        prices: [], // 임시로 빈 배열
        benefits: [] // 임시로 빈 배열
      };
    } catch (error) {
      addNotification(`플랜 정보 로딩 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // 새 플랜 등록
  const createPlan = async (planData) => {
    try {
      // planName을 planNameId로 변환
      let planNameId = planData.planNameId;
      if (!planNameId && planData.planName) {
        // planName으로 planNameId를 찾아서 변환
        const planNames = await getAllPlanNames();
        const foundPlanName = planNames.find(pn => pn.planName === planData.planName);
        if (foundPlanName) {
          planNameId = foundPlanName.planNameId;
        } else {
          throw new Error('유효하지 않은 플랜 이름입니다.');
        }
      }

      // 백엔드 API 형식에 맞게 데이터 변환
      const requestData = {
        planNameId: planNameId,
        planCode: planData.planCode,
        planActive: planData.planActive !== undefined ? planData.planActive : true
      };

      const response = await request(`${API_BASE_URL}/api/v1/admin/plans`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      addNotification('플랜이 성공적으로 등록되었습니다.', 'success');
      
      // 응답 데이터를 프론트엔드 형식으로 변환하여 반환
      return {
        planId: response.planId,
        planName: response.planName,
        planCode: response.planCode,
        planActive: response.planActive,
        planCreate: response.planCreate,
        prices: planData.prices || [],
        benefits: planData.benefits || []
      };
    } catch (error) {
      addNotification(`플랜 등록 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // 플랜 수정
  const updatePlan = async (id, planData) => {
    try {
      // planName을 planNameId로 변환
      let planNameId = planData.planNameId;
      if (!planNameId && planData.planName) {
        const planNames = await getAllPlanNames();
        const foundPlanName = planNames.find(pn => pn.planName === planData.planName);
        if (foundPlanName) {
          planNameId = foundPlanName.planNameId;
        } else {
          throw new Error('유효하지 않은 플랜 이름입니다.');
        }
      }

      // 백엔드 API 형식에 맞게 데이터 변환
      const requestData = {
        planNameId: planNameId,
        planCode: planData.planCode,
        planActive: planData.planActive
      };

      const response = await request(`${API_BASE_URL}/api/v1/admin/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });

      addNotification('플랜이 성공적으로 수정되었습니다.', 'success');
      
      // 응답 데이터를 프론트엔드 형식으로 변환하여 반환
      return {
        planId: response.planId,
        planName: response.planName,
        planCode: response.planCode,
        planActive: response.planActive,
        planCreate: response.planCreate,
        prices: planData.prices || [],
        benefits: planData.benefits || []
      };
    } catch (error) {
      addNotification(`플랜 수정 실패: ${error.message}`, 'error');
      throw error;
    }
  };

  // 플랜 삭제
  const deletePlan = async (id) => {
    try {
      await request(`${API_BASE_URL}/api/v1/admin/plans/${id}`, {
        method: 'DELETE',
      });
      addNotification(`플랜(ID: ${id})이 성공적으로 삭제되었습니다.`, 'success');
    } catch (error) {
      addNotification(`플랜 삭제 실패: ${error.message}`, 'error');
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
    getAllBrands,
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlanNames, // 새로 추가
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