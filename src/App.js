import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// ====================================================================
// 💡 1. 필요한 컴포넌트들을 모두 import 합니다.
// ====================================================================

// 사용자 쇼핑몰 레이아웃
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Context Providers
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';

// 사용자 쇼핑몰 페이지 (동적 import)
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Category = React.lazy(() => import('./pages/Category'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Search = React.lazy(() => import('./pages/Search'));

// ⭐️ 관리자 페이지 컴포넌트 (동적 import)
// 'admin' 폴더 안에 있는 Admin 파일을 불러오도록 경로 수정
const Admin = React.lazy(() => import('./admin/Admin'));


// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner" role="status" aria-label="페이지 로딩 중">
      <span className="loading-text">로딩 중...</span>
    </div>
  </div>
);

// ====================================================================
// 💡 2. 사용자용 페이지와 관리자 페이지를 구분하는 레이아웃을 만듭니다.
// ====================================================================

// 사용자 쇼핑몰을 위한 레이아웃 컴포넌트
const MainLayout = ({ children }) => (
  <div className="App">
    <a href="#main-content" className="skip-link">메인 콘텐츠로 건너뛰기</a>
    <Header />
    <main id="main-content" role="main" className="main-content" tabIndex="-1">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* ============================================================== */}
                {/* 💡 3. '/admin/*' 경로일 때는 Admin 컴포넌트만 보여줍니다. */}
                {/* ============================================================== */}
                <Route path="/admin/*" element={<Admin />} />

                {/* ============================================================== */}
                {/* 💡 4. 그 외 모든 경로는 사용자 쇼핑몰 레이아웃을 적용합니다. */}
                {/* ============================================================== */}
                <Route path="/*" element={
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/category/:slug" element={<Category />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/search" element={<Search />} />
                      {/* 추가적인 사용자 페이지 라우트 */}
                    </Routes>
                  </MainLayout>
                } />
              </Routes>
            </Suspense>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;