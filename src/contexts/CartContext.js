// src/contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_ACTIONS = {
  SET_ERROR: 'SET_ERROR',
  LOAD_FROM_SERVER: 'LOAD_FROM_SERVER',
  RESET: 'RESET',
};

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

// 서버 DTO -> 프론트 아이템 변환
function mapServerItems(list) {
  return (list || []).map(v => ({
    // ✅ 서버가 내려주는 장바구니 라인키 보존 (삭제에 필수)
    cartnum: v.cartnum,
    id: v.pronum,
    name: v.proname ?? `상품 #${v.pronum}`,
    price: Number(v.price ?? v.proprice ?? 0),
    originalPrice: Number(v.price ?? v.proprice ?? 0),
    image: v.thumbnail || v.image_url || v.imageUrl || undefined,
    quantity: Number(v.qty ?? 1),
    selectedOptions: {},
    addedAt: new Date().toISOString(),
  }));
}

function calc(state) {
  const totalItems = state.items.reduce((s, it) => s + (it.quantity || 1), 0);
  const totalAmount = state.items.reduce((s, it) => s + (Number(it.price || 0) * (it.quantity || 1)), 0);
  return { ...state, totalItems, totalAmount };
}

function reducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.LOAD_FROM_SERVER: {
      const items = mapServerItems(action.payload || []);
      return calc({ ...state, items });
    }
    case CART_ACTIONS.RESET:
      return calc({ ...initialState });
    case CART_ACTIONS.SET_ERROR:
      console.error('[Cart] ', action.payload);
      return state;
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();

  const refreshFromServer = useCallback(async () => {
    try {
      const { data } = await api.get('/cart/my'); // 세션 쿠키 필요
      dispatch({ type: CART_ACTIONS.LOAD_FROM_SERVER, payload: data });
    } catch (e) {
      if (e?.response?.status === 401) {
        dispatch({ type: CART_ACTIONS.RESET });
        return;
      }
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: e?.message || '장바구니 조회 실패' });
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshFromServer();
    } else {
      dispatch({ type: CART_ACTIONS.RESET });
    }
  }, [user, refreshFromServer]);

  const addToCart = async (productId, quantity = 1, selectedOptions = {}, extra = {}) => {
    await api.post('/cart/items', { pronum: productId, catenum: extra?.catenum || 0 });
    await refreshFromServer();
  };

  // ✅ cartnum 기준 삭제로 교체
  const removeFromCart = async (cartnum) => {
    try {
      await api.delete(`/cart/items/by-cartnum/${cartnum}`);
      await refreshFromServer();
    } catch (e) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: e?.message || '장바구니 삭제 실패' });
    }
  };

  // 아직 서버 API 없는 기능은 안내만
  const updateQuantity = () => alert('수량 변경은 서버 API 준비 후 연결됩니다.');
  const clearCart = () => alert('전체 비우기는 서버 API 준비 후 연결됩니다.');

  const isInCart = (productId) => state.items.some(it => it.id === productId);
  const getItemQuantity = (productId) => state.items.find(it => it.id === productId)?.quantity ?? 0;

  const value = {
    ...state,
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
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart는 CartProvider 내부에서 사용해야 합니다');
  return ctx;
};
