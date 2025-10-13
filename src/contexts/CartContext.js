import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api';   // ✅ 서버 호출용 axios 인스턴스 (withCredentials:true)

const CartContext = createContext();

// 액션 타입 (서버 단일 소스 기준으로 단순화)
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_FROM_SERVER: 'LOAD_FROM_SERVER',
};

// 초기 상태 (기존 shape 유지)
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0
};

// 서버 DTO → 프론트 아이템 매핑
function mapServerItems(list) {
  return (list || []).map(v => ({
    id: v.pronum,
    name: v.proname ?? `상품 #${v.pronum}`,
    price: Number(v.price ?? 0),
    originalPrice: Number(v.price ?? 0),
    image: v.thumbnail || undefined,
    quantity: Number(v.qty ?? 1),  // 현재 서버 qty=1 고정
    selectedOptions: {},           // 옵션 미사용
    addedAt: new Date().toISOString()
  }));
}

// 총합 계산 함수 (기존 calculateTotals와 호환)
const calculateTotals = (state) => {
  const totalItems = state.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmount = state.items.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
  return { ...state, totalItems, totalAmount };
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return state; // 필요 시 로딩 상태를 state에 추가해도 됨(이번엔 간단히 패스)

    case CART_ACTIONS.SET_ERROR:
      console.error('[Cart] ', action.payload);
      return state;

    case CART_ACTIONS.LOAD_FROM_SERVER: {
      const items = mapServerItems(action.payload || []);
      return calculateTotals({ ...state, items });
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ✅ 서버에서 장바구니 불러오기
  const refreshFromServer = async () => {
    try {
      const { data } = await api.get('/cart/my');     // 세션 필요 → withCredentials:true
      dispatch({ type: CART_ACTIONS.LOAD_FROM_SERVER, payload: data });
    } catch (e) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: e?.message || '장바구니 조회 실패' });
    }
  };

  // 앱 시작 시 1회 적재 (로그인 상태라면 서버 기준으로 초기화)
  useEffect(() => {
    refreshFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ✅ 서버 UPSERT → 성공 후 목록 재적재
   * 기존 시그니처 유지: addToCart(productId, quantity, selectedOptions)
   * quantity/selectedOptions는 현재 서버에서 쓰지 않지만 호환을 위해 받기만 한다.
   */
  const addToCart = async (productId, quantity = 1, selectedOptions = {}, extra = {}) => {
    await api.post('/cart/items', { pronum: productId, catenum: extra.catenum || 0 });
    await refreshFromServer();
  };

  // ===== 아래 함수들은 기존 컴포넌트 호환을 위해 임시로 유지 (서버 API 준비되면 연결) =====
  const removeFromCart = () => {
    alert('장바구니 삭제 기능은 곧 제공됩니다. (서버 API 연결 예정)');
  };
  const updateQuantity = () => {
    alert('수량 변경 기능은 곧 제공됩니다. (서버 API 연결 예정)');
  };
  const clearCart = () => {
    alert('전체 비우기 기능은 곧 제공됩니다. (서버 API 연결 예정)');
  };

  const isInCart = (productId, selectedOptions = {}) =>
    state.items.some(item => item.id === productId);

  const getItemQuantity = (productId, selectedOptions = {}) => {
    const item = state.items.find(it => it.id === productId);
    return item ? (item.quantity || 0) : 0;
  };

  const value = {
    ...state,              // items, totalItems, totalAmount (기존 shape 유지)
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    refreshFromServer,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart는 CartProvider 내부에서 사용되어야 합니다');
  }
  return context;
};
