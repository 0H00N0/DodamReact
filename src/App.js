// App.js

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';

// AdminContext
import { AdminProvider } from './admin/contexts/AdminContext';

// Logistics Guard (가드는 가볍게 즉시 import)
import LogisticsGuard from './routes/LogisticsGuard';

// --- 기존 페이지 (코드 스플리팅) ---
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Category = React.lazy(() => import('./pages/Category'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Search = React.lazy(() => import('./pages/Search'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Login = React.lazy(() => import('./pages/Login'));
const Admin = React.lazy(() => import('./admin/Admin'));

// --- Logistics 영역 (코드 스플리팅) ---
const LogisticsLayout = React.lazy(() => import('./logistics/LogisticsLayout'));
const LogisticsHome = React.lazy(() => import('./logistics/pages/Home'));                // /logistics
const LogisticsToday = React.lazy(() => import('./logistics/pages/Today'));             // /logistics/today
const LogisticsArea = React.lazy(() => import('./logistics/pages/Area'));               // /logistics/area
const LogisticsMap = React.lazy(() => import('./logistics/pages/Map'));                 // /logistics/map
const LogisticsReturn = React.lazy(() => import('./logistics/pages/Return'));           // /logistics/return
const LogisticsManagement = React.lazy(() => import('./logistics/pages/Management'));   // /logistics/management
const LogisticsResult = React.lazy(() => import('./logistics/pages/Result'));           // /logistics/result
const LogisticsCharges = React.lazy(() => import('./logistics/pages/Charges'));         // /logistics/charges
const DetailLayout = React.lazy(() => import('./logistics/pages/detail/DetailLayout')); // /logistics/detail
const DetailProducts = React.lazy(() => import('./logistics/pages/detail/Products'));   // /logistics/detail/products
const DetailCustomer = React.lazy(() => import('./logistics/pages/detail/Customer'));   // /logistics/detail/customer

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner" role="status" aria-label="페이지 로딩 중">
      <span className="loading-text">로딩 중...</span>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="App">
              {/* 접근성을 위한 스킵 링크 */}
              <a href="#main-content" className="skip-link">메인 콘텐츠로 건너뛰기</a>

              {/* 상단 네비게이션 */}
              <Header />

              {/* 메인 콘텐츠 */}
              <main id="main-content" role="main" className="main-content" tabIndex="-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* --- 기존 사용자 라우트 --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/category/:id" element={<Category />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />

                    {/* --- Admin 라우트 (기존과 동일) --- */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminProvider>
                          <Admin />
                        </AdminProvider>
                      }
                    />

                    {/* --- Logistics 라우트 (배달기사 전용) --- */}
                    <Route
                      path="/logistics"
                      element={
                        // 가드가 AdminContext를 쓰므로 Provider가 바깥에서 감싸야 함
                        <AdminProvider>
                          <LogisticsGuard>
                            <LogisticsLayout />
                          </LogisticsGuard>
                        </AdminProvider>
                      }
                    >
                      {/* /logistics → 배송기사페이지 */}
                      <Route index element={<LogisticsHome />} />

                      {/* 1단계 메뉴 */}
                      <Route path="today" element={<LogisticsToday />} />
                      <Route path="area" element={<LogisticsArea />} />
                      <Route path="map" element={<LogisticsMap />} />
                      <Route path="return" element={<LogisticsReturn />} />
                      <Route path="management" element={<LogisticsManagement />} />
                      <Route path="result" element={<LogisticsResult />} />
                      <Route path="charges" element={<LogisticsCharges />} />

                      {/* 상세(상품확인/고객정보) */}
                      <Route path="detail" element={<DetailLayout />}>
                        <Route index element={<Navigate to="products" replace />} />
                        <Route path="products" element={<DetailProducts />} />
                        <Route path="customer" element={<DetailCustomer />} />
                      </Route>

                      {/* 과거 경로 호환 (있다면) */}
                      <Route path="customer" element={<Navigate to="detail/customer" replace />} />
                    </Route>
                  </Routes>
                </Suspense>
              </main>

              {/* 푸터 */}
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
