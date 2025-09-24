import React, { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner" role="status" aria-label="페이지 로딩 중">
      <span className="loading-text">로딩 중...</span>
    </div>
  </div>
);

function App() {
  function FooterCondition() {
    const location = useLocation();
    const noFooterPaths = [
      "/member/findIdModal",
      "/member/findIdEmail",
      "/member/findIdTel",
      "/member/findPw",
      "/member/findPwByMemail",
      "/member/findPwByMtel"
    ];
    const hideFooter = noFooterPaths.includes(location.pathname);
    return !hideFooter && <Footer />;
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="App">
            <Header />

            <main id="main-content" role="main" className="main-content" tabIndex="-1">
              <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
              </Suspense>
            </main>

            <FooterCondition />
          </div>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;