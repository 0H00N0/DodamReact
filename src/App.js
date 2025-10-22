import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./admin/contexts/AdminContext"; // ✅ 추가
import ScrollToTopRoute from "./components/ScrollToTopRoute";

const Home = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./pages/member/LoginForm"));
const SignupForm = React.lazy(() => import("./pages/member/SignupForm"));
const Profile = React.lazy(() => import("./pages/member/Profile"));
const UpdateProfile = React.lazy(() => import("./pages/member/UpdateProfile"));

// 로딩 스피너 컴포넌트
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
      <AuthProvider>
        <AdminProvider> {/* ✅ AdminProvider 추가 */}
          <CartProvider>
            <WishlistProvider>
              <div className="App">
                <Header />
                <main id="main-content" role="main" className="main-content" tabIndex={-1}>
                  <ScrollToTopRoute />
                  <Suspense fallback={<LoadingSpinner />}>
                    <Outlet />
                  </Suspense>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AdminProvider> {/* ✅ AdminProvider 닫기 */}
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;