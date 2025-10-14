// src/admin/contexts/AdminContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { API_BASE_URL, api } from '../../utils/api';

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
    try { await response.text(); } catch (_) {}
    return {};
  };

// --- API Request Helper ---
const request = async (url, options = {}) => {
  try {
    console.log('=== 요청 정보 ===');
    console.log('URL:', url);
    console.log('Method:', options.method);
    console.log('Headers:', options.headers);
    console.log('Body:', options.body);

    const { data } = await api({
      url,
      method: options.method || 'GET',
      headers: options.headers,
      data: options.body instanceof FormData ? options.body : JSON.parse(options.body || '{}')
    });

    console.log('=== 응답 데이터 ===');
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Request 전체 오류:', error);
    throw error;
  }
};



  // --- VOC ---
  const getAllVocs = async (page = 0, size = 10) => {
    return await request(`${API_BASE_URL}/admin/voc?page=${page}&size=${size}`);
  };
  const getVocById = async (vocId) => request(`${API_BASE_URL}/admin/voc/${vocId}`);
  const updateVoc = async (vocId, updateData) => {
    const updatedVoc = await request(`${API_BASE_URL}/admin/voc/${vocId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    addNotification('VOC 정보가 성공적으로 업데이트되었습니다.', 'success');
    return updatedVoc;
  };

  // --- Product ---
const getAllProductStates = async () => request(`${API_BASE_URL}/admin/prostates`);
const getAllProducts = async () => request(`${API_BASE_URL}/admin/products`);
const getProductById = async (id) => request(`${API_BASE_URL}/admin/products/${id}`);

const createProduct = async (productData) => {
  const newProduct = await request(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  addNotification('상품이 성공적으로 등록되었습니다.', 'success');
  return newProduct;
};

const updateProduct = async (id, productData) => {
  const updated = await request(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  addNotification('상품이 성공적으로 수정되었습니다.', 'success');
  return updated;
};

const bulkUploadProducts = async (csvFile) => {
  const formData = new FormData();
  formData.append("file", csvFile);

  const response = await fetch(`${API_BASE_URL}/admin/products/bulk-upload`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("상품 일괄 등록 실패");
  }
  return response.json(); // { registeredCount: n }
};

const deleteProduct = async (id) => {
  await request(`${API_BASE_URL}/admin/products/${id}`, { method: 'DELETE' });
  addNotification('상품이 성공적으로 삭제되었습니다.', 'success');
};


  // --- Category ---
  const getAllCategories = async () => request(`${API_BASE_URL}/admin/categories`);
  const createCategory = async (categoryData) => {
    const newCategory = await request(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    addNotification('카테고리가 성공적으로 등록되었습니다.', 'success');
    return newCategory;
  };
  const updateCategory = async (id, categoryData) => {
    const updatedCategory = await request(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    addNotification('카테고리가 성공적으로 수정되었습니다.', 'success');
    return updatedCategory;
  };
  const deleteCategory = async (id) => {
    await request(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
    addNotification('카테고리가 성공적으로 삭제되었습니다.', 'success');
  };

  // --- Orders ---
  const getAllOrders = async () => {
    console.log('Fetching orders from:', `${API_BASE_URL}/admin/orders`);
    try {
      const data = await api.get(`/admin/orders`);
      console.log('Orders response:', data);
      return data.data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      throw err;
    }
  };
// ✅ 수정된 코드
const getOrderById = async (orderId) => {
  const { data } = await api.get(`/admin/orders/${orderId}`);
  return data;
};
  // --- Members ---
  const getAllMembers = async () => request(`${API_BASE_URL}/admin/members`);
  const getMemberById = async (id) => request(`${API_BASE_URL}/admin/members/${id}`);
  // ✅ 기존 deleteMember → forceDeleteMember로 변경
  const forceDeleteMember = async (id, reason) => {
  await request(`${API_BASE_URL}/admin/members/${id}`, {
    method: 'DELETE',
    headers: { "Content-Type": "application/json" },
    body: reason ? JSON.stringify({ reason }) : null
  });
  addNotification(`회원(ID: ${id})이 성공적으로 탈퇴 처리되었습니다.`, 'success');
};
// ✅ 상태별 회원 조회
  const getMembersByStatus = async (status) => {
  return await request(`${API_BASE_URL}/admin/members/status/${status}`);
};

  // --- Deliveryman ---
  const getAllDeliverymen = async () => request(`${API_BASE_URL}/admin/deliverymen`);
  const getDeliveryEligibleMembers = async () => {
    const members = await getAllMembers();
    return (members || []).filter(m => {
      const role = (m.role || m.mrole || m.roleName || m.mroleName || '').toString().toUpperCase();
      return role.includes('DELIVERY') || role.includes('딜리버') || role.includes('라이더');
    });
  };
  const getDeliverymanById = async (delnum) => request(`${API_BASE_URL}/admin/deliverymen/${delnum}`);
  const createDeliveryman = async (payload) => {
    const created = await request(`${API_BASE_URL}/admin/deliverymen`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    addNotification('배송기사가 성공적으로 등록되었습니다.', 'success');
    return created;
  };
  const updateDeliveryman = async (delnum, payload) => {
    const updated = await request(`${API_BASE_URL}/admin/deliverymen/${delnum}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    addNotification(`배송기사(#${delnum})가 성공적으로 수정되었습니다.`, 'success');
    return updated;
  };
  const deleteDeliveryman = async (delnum) => {
    await request(`${API_BASE_URL}/admin/deliverymen/${delnum}`, { method: 'DELETE' });
    addNotification(`배송기사(#${delnum})가 성공적으로 삭제되었습니다.`, 'success');
  };

  // --- Plan ---
  const getAllPlanNames = async () =>
    new Promise(resolve => setTimeout(() => resolve(mockPlanNames), 200));
  const getAllPlans = async () => {
    const response = await request(`${API_BASE_URL}/admin/plans`);
    return response.map(plan => ({ ...plan, prices: plan.prices || [], benefits: plan.benefits || [] }));
  };
  const getPlanById = async (id) => {
    const response = await request(`${API_BASE_URL}/admin/plans/${id}`);
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
    await request(`${API_BASE_URL}/admin/plans`, { method: 'POST', body: JSON.stringify(requestData) });
  };
  const updatePlan = async (id, planData) => {
    const requestData = {
      planName: planData.planName,
      planActive: planData.planActive,
      prices: planData.prices.map(p => ({ termMonth: parseInt(p.termMonth), ppriceBilMode: p.billMode, ppriceAmount: parseFloat(p.amount), ppriceCurr: p.currency, ppriceActive: true })),
      benefits: planData.benefits.map(b => ({ pbNote: b.note, pbPriceCap: b.priceCap ? parseFloat(b.priceCap) : null }))
    };
    await request(`${API_BASE_URL}/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(requestData) });
  };
  const deletePlan = async (id) => {
    await request(`${API_BASE_URL}/admin/plans/${id}`, { method: 'DELETE' });
    addNotification(`플랜(ID: ${id})이 성공적으로 삭제되었습니다.`, 'success');
  };
    const getAllSubscriptions = async () => {
  return await request(`${API_BASE_URL}/admin/plans/subscriptions`);
};
const getAllInvoices = async () => {
  return await request(`${API_BASE_URL}/admin/plans/invoices`);
};
  // --- Board ---
  const getAllBoardCategories = async () => request(`${API_BASE_URL}/admin/boards`);
  const createBoardCategory = async (categoryData) => {
    const newCategory = await request(`${API_BASE_URL}/admin/boards`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    addNotification('새로운 게시판이 성공적으로 생성되었습니다.', 'success');
    return newCategory;
  };
  const deleteBoardCategory = async (id) => {
    await request(`${API_BASE_URL}/admin/boards/${id}`, { method: 'DELETE' });
    addNotification('게시판이 성공적으로 삭제되었습니다.', 'success');
  };
  // ✅ 새로 추가
const updateBoardCategory = async (id, data) => {
  const updated = await request(`${API_BASE_URL}/admin/boards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  addNotification('게시판이 성공적으로 수정되었습니다.', 'success');
  return updated;
};
  const getPostsByCategory = async (categoryId) =>
    request(`${API_BASE_URL}/admin/boards/${categoryId}/posts`);
  const deletePost = async (postId) => {
    await request(`${API_BASE_URL}/admin/boards/posts/${postId}`, { method: 'DELETE' });
    addNotification('게시글이 성공적으로 삭제되었습니다.', 'success');
  };
  const getPostById = async (postId) => request(`${API_BASE_URL}/admin/boards/posts/${postId}`);
  const createPost = async (postData) =>
  request(`${API_BASE_URL}/admin/boards/posts`, {
    method: 'POST',
    headers: { // 👈 이 부분을 추가해주세요
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  // ✅ 새로 추가
const updatePost = async (postId, data) => {
  const updated = await request(`${API_BASE_URL}/admin/boards/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  addNotification('게시글이 성공적으로 수정되었습니다.', 'success');
  return updated;
};

  // --- Events ---
  const getAllEvents = async () => request(`${API_BASE_URL}/admin/events`);
  const getEventById = async (evNum) => request(`${API_BASE_URL}/admin/events/${evNum}`);
  const getFirstEventWinners = async (evNum) =>
  request(`${API_BASE_URL}/admin/events/${evNum}/winners`);

  const createEvent = async (eventData) => {
  const newEvent = await request(`${API_BASE_URL}/admin/events`, {
    method: 'POST',
    body: JSON.stringify({
      ...eventData,
      eventType: eventData.eventType || 'FIRST',
      capacity: eventData.eventType === 'FIRST' ? eventData.capacity : null // ✅ 추가
    }),
  });
  addNotification('이벤트가 성공적으로 생성되었습니다.', 'success');
  return newEvent;
};

const updateEvent = async (evNum, eventData) => {
  const updatedEvent = await request(`${API_BASE_URL}/admin/events/${evNum}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...eventData,
      eventType: eventData.eventType || 'FIRST',
      capacity: eventData.eventType === 'FIRST' ? eventData.capacity : null // ✅ 추가
    }),
  });
  addNotification('이벤트가 성공적으로 수정되었습니다.', 'success');
  return updatedEvent;
};

const deleteEvent = async (evNum) => {
  await request(`${API_BASE_URL}/admin/events/${evNum}`, { method: 'DELETE' });
  addNotification('이벤트가 성공적으로 삭제되었습니다.', 'success');
};
// --- Discount ---
const getAllDiscounts = async () => request(`${API_BASE_URL}/admin/discounts`);
// AdminContext에서 createDiscount 함수 확인
const createDiscount = async (data) => {
  console.log('API 호출 전 데이터:', data);
  console.log('JSON 문자열:', JSON.stringify(data));
  
  try {
    const result = await request(`${API_BASE_URL}/admin/discounts`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    console.log('API 응답:', result);
    return result;
  } catch (error) {
    console.error('createDiscount 에러:', error);
    throw error;
  }
};

const updateDiscount = async (id, data) =>
  request(`${API_BASE_URL}/admin/discounts/${id}`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
const deleteDiscount = async (id) =>
  request(`${API_BASE_URL}/admin/discounts/${id}`, { method: 'DELETE' });
// --- PlanTerms ---
const getAllPlanTerms = async () => request(`${API_BASE_URL}/admin/planterms`);


  const contextValue = {
    ...state,
    login: async () => {},
    logout: () => dispatch({ type: ACTION_TYPES.LOGOUT }),
    toggleSidebar: () => dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR }),
    addNotification,
    removeNotification: (id) => dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id }),
    updateDashboardData: (data) => dispatch({ type: ACTION_TYPES.SET_DASHBOARD_DATA, payload: data }),
    checkAuthentication: () => {},
    // Expose APIs
    getAllMembers,
    getMemberById,
    getDeliveryEligibleMembers,
    forceDeleteMember, // ✅ 이름 변경된 함수
    getMembersByStatus, // ✅ 상태별 회원 조회 함수 추가
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
    getAllProductStates,
    getAllOrders,
    getOrderById,
    getAllDeliverymen,
    getDeliverymanById,
    createDeliveryman,
    updateDeliveryman,
    deleteDeliveryman,
    getAllVocs,
    getVocById,
    updateVoc,
    getAllBoardCategories,
    createBoardCategory,
    deleteBoardCategory,
    getPostsByCategory,
    updateBoardCategory, // ✅ 새로 추가
    updatePost,         // ✅ 새로 추가
    deletePost,
    getPostById,
    createPost,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    // Discount APIs
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getAllPlanTerms,
    bulkUploadProducts,
    getFirstEventWinners,
    // Plan related APIs
    getAllSubscriptions,
    getAllInvoices
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}
