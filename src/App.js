// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";


const Home = React.lazy(() => import("./pages/Home"));
// 추가: 로그인/회원가입
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

              {/*여기(main) 안에 Routes가 실제로 있어야 화면 전환됨 */}
              <main id="main-content" role="main" className="main-content" tabIndex="-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    {/* 추가된 라우트 */}
                    <Route path="/loginForm" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />
                    {/* 다른 라우트들은 기존대로 */}
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
