import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
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
          <div className="App">
            <Header />

            <main id="main-content" role="main" className="main-content" tabIndex="-1">
              <Suspense fallback={<LoadingSpinner />}>
                <Outlet />  {/* ✅ 여기서 라우터 children들이 렌더링됨 */}
              </Suspense>
            </main>

            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
