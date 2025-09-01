import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getProductById } from '../utils/dummyData';

// Context 생성
const CartContext = createContext();

// 액션 타입 정의
const CART_ACTIONS = {
  LOAD_CART: 'LOAD_CART',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART'
};

// 초기 상태
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0
};

// Reducer 함수
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return action.payload;

    case CART_ACTIONS.ADD_ITEM: {
      const { productId, quantity = 1, selectedOptions = {} } = action.payload;
      const product = getProductById(productId);
      
      if (!product) return state;

      const existingItemIndex = state.items.findIndex(
        item => item.id === productId && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // 기존 아이템 수량 증가
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // 새 아이템 추가
        const newItem = {
          id: productId,
          name: product.name,
          price: product.discountPrice || product.price,
          originalPrice: product.price,
          image: product.image,
          quantity,
          selectedOptions,
          addedAt: new Date().toISOString()
        };
        newItems = [...state.items, newItem];
      }

      return calculateTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(
        item => !(item.id === action.payload.productId && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(action.payload.selectedOptions))
      );
      return calculateTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, selectedOptions, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { productId, selectedOptions }
        });
      }

      const newItems = state.items.map(item => 
        item.id === productId && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
          ? { ...item, quantity }
          : item
      );

      return calculateTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.CLEAR_CART:
      return initialState;

    default:
      return state;
  }
};

// 총합 계산 함수
const calculateTotals = (state) => {
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    ...state,
    totalItems,
    totalAmount
  };
};

// localStorage 키
const CART_STORAGE_KEY = 'toyshop_cart';

// Provider 컴포넌트
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // localStorage에서 장바구니 불러오기
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: calculateTotals(parsedCart)
        });
      }
    } catch (error) {
      console.error('장바구니 데이터를 불러오는데 실패했습니다:', error);
    }
  }, []);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('장바구니 데이터를 저장하는데 실패했습니다:', error);
    }
  }, [state]);

  // 액션 함수들
  const addToCart = (productId, quantity = 1, selectedOptions = {}) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { productId, quantity, selectedOptions }
    });
  };

  const removeFromCart = (productId, selectedOptions = {}) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId, selectedOptions }
    });
  };

  const updateQuantity = (productId, selectedOptions = {}, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, selectedOptions, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const isInCart = (productId, selectedOptions = {}) => {
    return state.items.some(
      item => item.id === productId && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
  };

  const getItemQuantity = (productId, selectedOptions = {}) => {
    const item = state.items.find(
      item => item.id === productId && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
    return item ? item.quantity : 0;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart는 CartProvider 내부에서 사용되어야 합니다');
  }
  return context;
};