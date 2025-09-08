import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';

// 코드 스플리팅을 위한 동적 import
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Category = React.lazy(() => import('./pages/Category'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Search = React.lazy(() => import('./pages/Search'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Login = React.lazy(() => import('./pages/Login'));

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner" role="status" aria-label="페이지 로딩 중">
      <span className="loading-text">로딩 중...</span>
    </div>
  </div>
);

/**
 * 메인 애플리케이션 컴포넌트
 * React Router와 Context Providers를 포함한 전체 앱 구조
 */
function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="App">
              {/* 접근성을 위한 스킵 링크 */}
              <a href="#main-content" className="skip-link">
                메인 콘텐츠로 건너뛰기
              </a>
              
              {/* 페이지 상단 네비게이션 */}
              <Header />
              
              {/* 메인 콘텐츠 영역 */}
              <main id="main-content" role="main" className="main-content" tabIndex="-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/category/:id" element={<Category />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </Suspense>
              </main>
              
              {/* 페이지 하단 정보 */}
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
