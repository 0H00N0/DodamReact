import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getProductById } from '../utils/dummyData';

// Context 생성
const WishlistContext = createContext();

// 액션 타입 정의
const WISHLIST_ACTIONS = {
  LOAD_WISHLIST: 'LOAD_WISHLIST',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST'
};

// 초기 상태
const initialState = {
  items: [],
  totalItems: 0
};

// Reducer 함수
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.LOAD_WISHLIST:
      return action.payload;

    case WISHLIST_ACTIONS.ADD_ITEM: {
      const productId = action.payload;
      const product = getProductById(productId);
      
      if (!product) return state;

      // 이미 찜 목록에 있는지 확인
      const existingItem = state.items.find(item => item.id === productId);
      if (existingItem) return state;

      const newItem = {
        id: productId,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount,
        addedAt: new Date().toISOString()
      };

      const newItems = [...state.items, newItem];
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length
      };
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      const newItems = state.items.filter(item => item.id !== productId);
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length
      };
    }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return initialState;

    default:
      return state;
  }
};

// localStorage 키
const WISHLIST_STORAGE_KEY = 'toyshop_wishlist';

// Provider 컴포넌트
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // localStorage에서 찜 목록 불러오기
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({
          type: WISHLIST_ACTIONS.LOAD_WISHLIST,
          payload: parsedWishlist
        });
      }
    } catch (error) {
      console.error('찜 목록 데이터를 불러오는데 실패했습니다:', error);
    }
  }, []);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('찜 목록 데이터를 저장하는데 실패했습니다:', error);
    }
  }, [state]);

  // 액션 함수들
  const addToWishlist = (productId) => {
    dispatch({
      type: WISHLIST_ACTIONS.ADD_ITEM,
      payload: productId
    });
  };

  const removeFromWishlist = (productId) => {
    dispatch({
      type: WISHLIST_ACTIONS.REMOVE_ITEM,
      payload: productId
    });
  };

  const toggleWishlist = (productId) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const clearWishlist = () => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
  };

  const isInWishlist = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook for using wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist는 WishlistProvider 내부에서 사용되어야 합니다');
  }
  return context;
};