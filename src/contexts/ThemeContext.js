import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Context 생성
const ThemeContext = createContext();

// 테마 타입 정의
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// 액션 타입 정의
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME'
};

// 초기 상태
const initialState = {
  theme: THEMES.LIGHT,
  isDark: false
};

// Reducer 함수
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME: {
      const theme = action.payload;
      return {
        theme,
        isDark: theme === THEMES.DARK
      };
    }

    case THEME_ACTIONS.TOGGLE_THEME: {
      const newTheme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      return {
        theme: newTheme,
        isDark: newTheme === THEMES.DARK
      };
    }

    default:
      return state;
  }
};

// localStorage 키
const THEME_STORAGE_KEY = 'toyshop_theme';

// Provider 컴포넌트
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // localStorage에서 테마 설정 불러오기
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        dispatch({
          type: THEME_ACTIONS.SET_THEME,
          payload: savedTheme
        });
      } else {
        // 시스템 테마 감지
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch({
          type: THEME_ACTIONS.SET_THEME,
          payload: prefersDark ? THEMES.DARK : THEMES.LIGHT
        });
      }
    } catch (error) {
      console.error('테마 설정을 불러오는데 실패했습니다:', error);
    }
  }, []);

  // 테마 변경 시 CSS 변수와 localStorage 업데이트
  useEffect(() => {
    // CSS 변수 업데이트
    document.documentElement.setAttribute('data-theme', state.theme);
    
    // CSS 클래스 업데이트
    if (state.isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }

    // localStorage에 저장
    try {
      localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    } catch (error) {
      console.error('테마 설정을 저장하는데 실패했습니다:', error);
    }
  }, [state.theme, state.isDark]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 사용자가 테마를 직접 설정하지 않았다면 시스템 테마를 따름
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        dispatch({
          type: THEME_ACTIONS.SET_THEME,
          payload: e.matches ? THEMES.DARK : THEMES.LIGHT
        });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 액션 함수들
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: theme
      });
    }
  };

  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
  };

  const value = {
    ...state,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme는 ThemeProvider 내부에서 사용되어야 합니다');
  }
  return context;
};