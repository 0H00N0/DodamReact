// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// AdminContext
import { AdminProvider } from "./admin/contexts/AdminContext";

// --- Plan ---
import PlanSelectPage from "./Plan/PlanSelectPage.jsx";
import PlanDetailPage from "./Plan/PlanDetailPage";

// --- Community ---
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import Notice from "./pages/CommunityPage/Notice";
import NoticeDetail from "./pages/CommunityPage/NoticeDetail";
import Event from "./pages/CommunityPage/Event";
import EventDetail from "./pages/CommunityPage/EventDetail";
import CommunityBoard from "./pages/CommunityPage/CommunityBoard";
import CommunityBoardDetail from "./pages/CommunityPage/CommunityBoardDetail";
import CommunityBoardForm from "./pages/CommunityPage/CommunityBoardForm";
import CommunityBoardEdit from "./pages/CommunityPage/CommunityBoardEdit";
import CommunityBoardDelete from "./pages/CommunityPage/CommunityBoardDelete";
import Inquiry from "./pages/CommunityPage/Inquiry";
import FAQ from "./pages/CommunityPage/FAQ";
import Company from "./pages/CommunityPage/Company";

// --- Lazy Pages (기존) ---
const Home = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./pages/member/LoginForm"));
const SignupForm = React.lazy(() => import("./pages/member/SignupForm"));
const Admin = React.lazy(() => import("./admin/Admin"));

// --- Logistics Guard ---
import LogisticsGuard from "./routes/LogisticsGuard";

// --- Logistics Lazy Pages ---
const LogisticsLayout = React.lazy(() => import("./logistics/LogisticsLayout"));
const LogisticsHome = React.lazy(() => import("./logistics/pages/Home")); // /logistics
const LogisticsToday = React.lazy(() => import("./logistics/pages/Today")); // /logistics/today
const LogisticsArea = React.lazy(() => import("./logistics/pages/Area")); // /logistics/area
const LogisticsMap = React.lazy(() => import("./logistics/pages/Map")); // /logistics/map
const LogisticsReturn = React.lazy(() => import("./logistics/pages/Return")); // /logistics/return
const LogisticsManagement = React.lazy(() => import("./logistics/pages/Management")); // /logistics/management
const LogisticsResult = React.lazy(() => import("./logistics/pages/Result")); // /logistics/result
const LogisticsCharges = React.lazy(() => import("./logistics/pages/Charges")); // /logistics/charges

// --- Logistics Detail Lazy Pages ---
const DetailLayout = React.lazy(() => import("./logistics/pages/detail/DetailLayout")); // /logistics/detail
const DetailProducts = React.lazy(() => import("./logistics/pages/detail/Products")); // /logistics/detail/products
const DetailCustomer = React.lazy(() => import("./logistics/pages/detail/Customer")); // /logistics/detail/customer

// --- Loading ---
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
              {/* 접근성: 스킵 링크 */}
              <a href="#main-content" className="skip-link">
                메인 콘텐츠로 건너뛰기
              </a>

              <Header />

              <main id="main-content" role="main" className="main-content" tabIndex="-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* 기본 페이지 */}
                    <Route path="/" element={<Home />} />
                    <Route path="/loginForm" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />

                    {/* 구독 플랜 */}
                    <Route path="/plans" element={<PlanSelectPage />} />
                    <Route path="/plans/:planCode" element={<PlanDetailPage />} />

                    {/* 커뮤니티 */}
                    <Route path="/board" element={<CommunityPage />}>
                      <Route index element={<Notice />} />
                      <Route path="notice" element={<Notice />} />
                      <Route path="notice/:noticeId" element={<NoticeDetail />} />
                      <Route path="event" element={<Event />} />
                      <Route path="event/:eventId" element={<EventDetail />} />
                      <Route path="community" element={<CommunityBoard />} />
                      <Route path="community/:postId" element={<CommunityBoardDetail />} />
                      {/* 작성/수정/삭제 */}
                      <Route path="community/write" element={<CommunityBoardForm />} />
                      <Route path="community/edit/:postId" element={<CommunityBoardEdit />} />
                      <Route path="community/delete/:postId" element={<CommunityBoardDelete />} />
                      <Route path="inquiry" element={<Inquiry />} />
                      <Route path="faq" element={<FAQ />} />
                      <Route path="company" element={<Company />} />
                    </Route>

                    {/* Admin 전역 */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminProvider>
                          <Admin />
                        </AdminProvider>
                      }
                    />

                    {/* Logistics (배달기사 전용) */}
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
                      {/* /logistics */}
                      <Route index element={<LogisticsHome />} />

                      {/* 1단계 메뉴 */}
                      <Route path="today" element={<LogisticsToday />} />
                      <Route path="area" element={<LogisticsArea />} />
                      <Route path="map" element={<LogisticsMap />} />
                      <Route path="return" element={<LogisticsReturn />} />
                      <Route path="management" element={<LogisticsManagement />} />
                      <Route path="result" element={<LogisticsResult />} />
                      <Route path="charges" element={<LogisticsCharges />} />

                      {/* 상세 (중첩 라우트) */}
                      <Route path="detail" element={<DetailLayout />}>
                        {/* 기본: products로 리다이렉트 */}
                        <Route index element={<Navigate to="products" replace />} />
                        <Route path="products" element={<DetailProducts />} />
                        <Route path="customer" element={<DetailCustomer />} />
                      </Route>

                      {/* 과거 경로 호환: /logistics/customer → /logistics/detail/customer */}
                      <Route path="customer" element={<Navigate to="detail/customer" replace />} />
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
