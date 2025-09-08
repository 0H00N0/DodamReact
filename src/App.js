// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import PlanSelectPage from "./Plan/PlanSelectPage";
import PlanDetailPage from "./Plan/PlanDetailPage";

import ProductsPage from "./Product/pages/ProductsPage"; // barrel export 사용
import ProductDetailPage from "./Product/pages/ProductDetailPage"; // 개별 상품 상세 페이지
import FindIdModal from "./pages/member/FindIdModal";


// React.lazy로 코드 스플리팅

const Home = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./pages/member/LoginForm"));
const SignupForm = React.lazy(() => import("./pages/member/SignupForm"));
const Profile = React.lazy(() => import("./pages/member/Profile"));
const UpdateProfile = React.lazy(() => import("./pages/member/UpdateProfile"));
const ChangePw = React.lazy(() => import("./pages/member/ChangePw"));

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
              <a href="#main-content" className="skip-link">메인 콘텐츠로 건너뛰기</a>
              <Header />

              <main id="main-content" role="main" className="main-content" tabIndex="-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* 메인 */}
                    <Route path="/" element={<Home />} />

                    {/* 화면 라우트: /loginForm 사용 */}
                    <Route path="/loginForm" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/member/profile" element={<Profile />} />

                    {/* 레거시/혼용 경로 흡수 */}
                    <Route path="/login" element={<Navigate to="/loginForm" replace />} />
                    <Route path="/member/loginForm" element={<Navigate to="/loginForm" replace />} />
                    <Route path="/member/signup" element={<Navigate to="/signup" replace />} />

                    {/* 구독 플랜 */}
                    <Route path="/plans" element={<PlanSelectPage />} />
                    <Route path="/plans/:planCode" element={<PlanDetailPage />} />

                    {/* 상품 관련 라우트 추가 */}
                    {/* 첫 페이지: /products */}
                    <Route path="/products" element={<ProductsPage />} />
                    {/* 2페이지 이후: /products/page/2 */}
                    <Route path="/products/page/:page" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />

                    {/* 회원정보 수정 페이지 */}
                    <Route path="/member/updateProfile" element={<UpdateProfile />} />
                    {/* 비밀번호 변경 페이지*/}
                    <Route path="/member/changePw" element={<ChangePw />} />
                    {/* ID 찾기 모달 페이지 */}
                    <Route path="/member/findIdModal" element={<FindIdModal />} />

                    {/* 404 */}
                    <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
