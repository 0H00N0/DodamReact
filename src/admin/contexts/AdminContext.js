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
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const addNotification = (message, type = 'info') => {
    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: { message, type } });
  };

  // --- Safe JSON parser ---
  const parseResponse = async (response) => {
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return response.json();
    }
    // 비 JSON 응답일 경우 텍스트만 소거
    try { await response.text(); } catch (_) {}
    return {};
  };

  // --- API Request Helper (Preflight 최소화) ---
  const request = async (url, options = {}) => {
    try {
      const method = (options.method || 'GET').toUpperCase();
      const hasBody = options.body !== undefined && options.body !== null;
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

      const headers = { ...(options.headers || {}) };

      // 👉 GET/HEAD에는 절대 Content-Type을 넣지 않음
      if (hasBody) {
        // 👉 JSON 바디에만 Content-Type 지정, FormData는 브라우저가 자동 설정
        if (!isFormData && !('Content-Type' in headers)) {
          headers['Content-Type'] = 'application/json';
        }
      } else {
        // body가 없으면 잘못 들어온 Content-Type 제거
        if ('Content-Type' in headers) delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        credentials: 'include',
        ...options,
        method,
        headers
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const maybeJson = await response.clone().json();
          message = maybeJson?.message || maybeJson?.error || message;
        } catch (_) {
          try { message = await response.clone().text() || message; } catch (_) {}
        }
        throw new Error(message);
      }

      return await parseResponse(response);
    } catch (error) {
      console.error('API Request failed:', error);
      addNotification(error.message || '네트워크 오류가 발생했습니다.', 'error');
      throw error;
    }
  };
  // --- ⬇️ VOC 관리 API 함수 추가 ⬇️ ---
  const getAllVocs = async (page = 0, size = 10) => {
    return await request(`${API_BASE_URL}/api/v1/admin/voc?page=${page}&size=${size}`);
  };

  const getVocById = async (vocId) => {
    return await request(`${API_BASE_URL}/api/v1/admin/voc/${vocId}`);
  };

  const updateVoc = async (vocId, updateData) => {
    const updatedVoc = await request(`${API_BASE_URL}/api/v1/admin/voc/${vocId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    addNotification('VOC 정보가 성공적으로 업데이트되었습니다.', 'success');
    return updatedVoc;
  };

  // ⬇️ 새로운 함수 추가
  const getAllProductStates = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/prostates`);
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

  // --- 주문(Order) ---
  const getAllOrders = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/orders`);
  };

  const getOrderById = async (orderId) => {
    return await request(`${API_BASE_URL}/api/v1/admin/orders/${orderId}`);
  };

  const updateOrderApproval = async (orderId) => {
    return await request(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ renApproval: 1 }),
    });
  };

  const assignOrderRider = async (orderId, riderData) => {
    return await request(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/rider`, {
      method: 'PATCH',
      body: JSON.stringify(riderData),
    });
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

  // --- Category ---
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
  

  // --- 기타 컨트롤 ---
  const logout = async () => { dispatch({ type: ACTION_TYPES.LOGOUT }) };
  const toggleSidebar = () => { dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR }) };
  const removeNotification = (id) => { dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id }) };
  const updateDashboardData = (data) => { dispatch({ type: ACTION_TYPES.SET_DASHBOARD_DATA, payload: data }) };
  const checkAuthentication = () => {};
  const login = async () => {};

  // --- Member ---
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

  // --- Deliveryman ---
  const getAllDeliverymen = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/deliverymen`);
  };

  const getDeliveryEligibleMembers = async () => {
  const members = await getAllMembers(); // 기존 함수 재사용
  // 역할 필드명이 프로젝트마다 다를 수 있으니 방어적으로 필터
  return (members || []).filter(m => {
    const role = (m.role || m.mrole || m.roleName || m.mroleName || '').toString().toUpperCase();
    return role.includes('DELIVERY') || role.includes('딜리버') || role.includes('라이더');
  });
  };

  const getDeliverymanById = async (delnum) => {
    return await request(`${API_BASE_URL}/api/v1/admin/deliverymen/${delnum}`);
  };

  const createDeliveryman = async (payload) => {
    const created = await request(`${API_BASE_URL}/api/v1/admin/deliverymen`, { 
      method: 'POST',
      body: JSON.stringify(payload) });
    addNotification('배송기사가 성공적으로 등록되었습니다.', 'success');
    return created;
  };

  const updateDeliveryman = async (delnum, payload) => {
    const updated = await request(`${API_BASE_URL}/api/v1/admin/deliverymen/${delnum}`, {
      method: 'PUT',
      body: JSON.stringify(payload) });
    addNotification(`배송기사(#${delnum})가 성공적으로 수정되었습니다.`, 'success');
    return updated;
  };

  const deleteDeliveryman = async (delnum) => {
   await request(`${API_BASE_URL}/api/v1/admin/deliverymen/${delnum}`, { method: 'DELETE' });
    addNotification(`배송기사(#${delnum})가 성공적으로 삭제되었습니다.`, 'success');
  };

  // --- Plan ---
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

  // --- 이미지 업로드 ---
  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      // FormData는 request 헬퍼로 보내도 되지만, 파일 업로드 특성상 fetch를 직접 사용
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.');
      return response.json();
    } catch (error) {
      console.error('Image upload failed:', error);
      addNotification(error.message, 'error');
      throw error;
    }
  };
  // --- ⬇️ 게시판 관리 API 함수 추가 ⬇️ ---
  const getAllBoardCategories = async () => {
    return await request(`${API_BASE_URL}/api/v1/admin/boards`);
  };

  const createBoardCategory = async (categoryData) => {
    const newCategory = await request(`${API_BASE_URL}/api/v1/admin/boards`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    addNotification('새로운 게시판이 성공적으로 생성되었습니다.', 'success');
    return newCategory;
  };

  const deleteBoardCategory = async (id) => {
    await request(`${API_BASE_URL}/api/v1/admin/boards/${id}`, { method: 'DELETE' });
    addNotification('게시판이 성공적으로 삭제되었습니다.', 'success');
  };
  // --- ⬇️ 게시글 관리 API 함수 추가 ⬇️ ---
  const getPostsByCategory = async (categoryId) => {
    return await request(`${API_BASE_URL}/api/v1/admin/boards/${categoryId}/posts`);
  };

  const deletePost = async (postId) => {
    await request(`${API_BASE_URL}/api/v1/admin/boards/posts/${postId}`, { method: 'DELETE' });
    addNotification('게시글이 성공적으로 삭제되었습니다.', 'success');
  };
  // --- ⬇️ 게시글 상세조회, 생성 API 함수 추가 ⬇️ ---
  const getPostById = async (postId) => {
    return await request(`${API_BASE_URL}/api/v1/admin/boards/posts/${postId}`);
  };

  const createPost = async (postData) => {
    return await request(`${API_BASE_URL}/api/v1/admin/boards/posts`, {
        method: 'POST',
        body: JSON.stringify(postData),
    });
  };
  const getAllEvents = async () => {
  return await request(`${API_BASE_URL}/api/v1/admin/events`);
};

const getEventById = async (evNum) => {
  return await request(`${API_BASE_URL}/api/v1/admin/events/${evNum}`);
};

const createEvent = async (eventData) => {
  const newEvent = await request(`${API_BASE_URL}/api/v1/admin/events`, {
    method: 'POST',
    body: JSON.stringify({
      ...eventData,
      eventType: eventData.eventType || 'FIRST'
    }),
  });
  addNotification('이벤트가 성공적으로 생성되었습니다.', 'success');
  return newEvent;
};

const updateEvent = async (evNum, eventData) => {
  const updatedEvent = await request(`${API_BASE_URL}/api/v1/admin/events/${evNum}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...eventData,
      eventType: eventData.eventType || 'FIRST'
    }),
  });
  addNotification('이벤트가 성공적으로 수정되었습니다.', 'success');
  return updatedEvent;
};


const deleteEvent = async (evNum) => {
  await request(`${API_BASE_URL}/api/v1/admin/events/${evNum}`, { method: 'DELETE' });
  addNotification('이벤트가 성공적으로 삭제되었습니다.', 'success');
};

  const contextValue = {
    ...state,
    login,
    logout,
    getAllMembers,
    getMemberById,
    getDeliveryEligibleMembers,
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
    getAllProductStates,
    getAllOrders,
    getOrderById,
    getAllDeliverymen,
    getDeliverymanById,
    createDeliveryman,
    updateDeliveryman,
    deleteDeliveryman,
    updateOrderApproval,
    assignOrderRider,
    getAllVocs,
    getVocById,
    updateVoc,
    getAllBoardCategories,
    createBoardCategory,
    deleteBoardCategory,
    getPostsByCategory,
    deletePost,
    getPostById,
    createPost,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
} 
