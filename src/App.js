import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";   // ✅ 추가

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
      <AuthProvider>{/* ✅ 전체를 감싸서 /member/me 부팅 시도 */}
        <CartProvider>
          <WishlistProvider>
            <div className="App">
              <Header />
              <main id="main-content" role="main" className="main-content" tabIndex={-1}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Outlet />
                </Suspense>
              </main>
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;