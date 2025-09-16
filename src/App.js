// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Plan 폴더에 있는 컴포넌트 임포트 (경로 수정됨)
import PlanSelectPage from "./Plan/PlanSelectPage";
import PlanDetailPage from "./Plan/PlanDetailPage";

import CommunityPage from "./pages/CommunityPage/CommunityPage";
import Notice from "./pages/CommunityPage/Notice";
import NoticeDetail from "./pages/CommunityPage/NoticeDetail";
import Event from "./pages/CommunityPage/Event";
import EventDetail from "./pages/CommunityPage/EventDetail";
import CommunityBoard from "./pages/CommunityPage/CommunityBoard";
import CommunityBoardDetail from "./pages/CommunityPage/CommunityBoardDetail";
import CommunityBoardForm from "./pages/CommunityPage/CommunityBoardForm";   // 글 작성
import CommunityBoardEdit from "./pages/CommunityPage/CommunityBoardEdit";   // 글 수정
import CommunityBoardDelete from "./pages/CommunityPage/CommunityBoardDelete"; // 글 삭제

import Inquiry from "./pages/CommunityPage/Inquiry";
import FAQ from "./pages/CommunityPage/FAQ";
import Company from "./pages/CommunityPage/Company";

// Lazy 로딩 페이지
const Home = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./pages/member/LoginForm"));
const SignupForm = React.lazy(() => import("./pages/member/SignupForm"));

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
                    <Route path="/" element={<Home />} />
                    <Route path="/loginForm" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />

                    {/* 구독 플랜 관련 라우트 추가 */}
                    <Route path="/plans" element={<PlanSelectPage />} />
                    <Route path="/plans/:planCode" element={<PlanDetailPage />} />

                    {/* 소통(Community) */}
                    <Route path="/board" element={<CommunityPage />}>
                      <Route index element={<Notice />} />  {/* 기본: 공지사항 */}
                      <Route path="notice" element={<Notice />} /> {/* 공지사항 목록 */}
                      <Route path="notice/:noticeId" element={<NoticeDetail />} /> {/* 공지사항 상세 */}
                      <Route path="event" element={<Event />} />
                      <Route path="event/:eventId" element={<EventDetail />} />
                      <Route path="community" element={<CommunityBoard />} />  
                      <Route path="community/:postId" element={<CommunityBoardDetail />} />  {/* 상세 */}
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