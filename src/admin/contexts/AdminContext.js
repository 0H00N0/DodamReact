import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 초기 상태
const initialState = {
  user: null,
  isAuthenticated: false,
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

// 액션 타입
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
    
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
    
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload,
          timestamp: new Date()
        }]
      };
    
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ACTION_TYPES.SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: action.payload
      };
    
    case ACTION_TYPES.LOGOUT:
      return {
        ...initialState
      };
    
    default:
      return state;
  }
}

// 컨텍스트 생성
const AdminContext = createContext();

// 컨텍스트 훅
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// 프로바이더 컴포넌트
export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // 사용자 인증 확인
  useEffect(() => {
    checkAuthentication();
  }, []);

  // 인증 확인 함수
  const checkAuthentication = async () => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    
    try {
      // 실제로는 API 호출
      const token = localStorage.getItem('adminToken');
      if (token) {
        // 토큰 검증 및 사용자 정보 가져오기
        const userData = {
          id: 1,
          name: '관리자',
          email: 'admin@example.com',
          role: 'admin'
        };
        dispatch({ type: ACTION_TYPES.SET_USER, payload: userData });
      } else {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // 로그인 함수
  const login = async (credentials) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 가짜 지연
      
      const userData = {
        id: 1,
        name: '관리자',
        email: credentials.email,
        role: 'admin'
      };
      
      localStorage.setItem('adminToken', 'sample-admin-token');
      dispatch({ type: ACTION_TYPES.SET_USER, payload: userData });
      
      addNotification('로그인 성공', 'success');
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      addNotification('로그인 실패', 'error');
      return { success: false, error: error.message };
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('adminToken');
    dispatch({ type: ACTION_TYPES.LOGOUT });
    addNotification('로그아웃되었습니다', 'info');
  };

  // 사이드바 토글
  const toggleSidebar = () => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR });
  };

  // 알림 추가
  const addNotification = (message, type = 'info') => {
    dispatch({
      type: ACTION_TYPES.ADD_NOTIFICATION,
      payload: { message, type }
    });
  };

  // 알림 제거
  const removeNotification = (id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
  };

  // 대시보드 데이터 업데이트
  const updateDashboardData = (data) => {
    dispatch({ type: ACTION_TYPES.SET_DASHBOARD_DATA, payload: data });
  };

  // 컨텍스트 값
  const contextValue = {
    // 상태
    ...state,
    
    // 액션
    login,
    logout,
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