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


import CommunityPage from "./pages/CommunityPage/CommunityPage";
import Notice from "./pages/CommunityPage/Notice";
import Event from "./pages/CommunityPage/Event";
import Inquiry from "./pages/CommunityPage/Inquiry";
import FAQ from "./pages/CommunityPage/FAQ";
import Company from "./pages/CommunityPage/Company";

const Home = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./pages/member/LoginForm"));
const SignupForm = React.lazy(() => import("./pages/member/SignupForm"));
const Profile = React.lazy(() => import("./pages/member/Profile"));

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

                    {/* 소통(Community) */}
                    <Route path="/board" element={<CommunityPage />}>
                      <Route index element={<Notice />} />  {/* 기본: 공지사항 */}
                      <Route path="notice" element={<Notice />} />
                      <Route path="event" element={<Event />} />
                      <Route path="inquiry" element={<Inquiry />} />
                      <Route path="faq" element={<FAQ />} />
                      <Route path="company" element={<Company />} />
                    </Route>

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

