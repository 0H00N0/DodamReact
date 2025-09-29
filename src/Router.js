import React from "react";
import { createBrowserRouter as createRouter } from "react-router-dom";
import App from "./App";

// 파일명이 PlanCheckout.jsx 라면 아래처럼!
import CheckoutPage from "./Plan/PlanCheckout";
import CheckoutResultPage from "./Plan/PlanCheckoutResultPage";
import BillingKeyRedirect from "./Plan/PlanBillingKeyRedirect";
import Home from "./pages/Home";

// Community
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import Notice from "./pages/CommunityPage/Notice";
import Event from "./pages/CommunityPage/Event";
import Inquiry from "./pages/CommunityPage/Inquiry";
import FAQ from "./pages/CommunityPage/FAQ";
import Company from "./pages/CommunityPage/Company";

// Member
import LoginForm from "./pages/member/LoginForm";
import SignupForm from "./pages/member/SignupForm";
import Profile from "./pages/member/Profile";
import UpdateProfile from "./pages/member/UpdateProfile"; // 🔥 대문자 U 로 수정
import OAuthCallback from "./pages/member/OAuthCallback";
import FindIdModal from "./pages/member/FindIdModal";
import FindIdByEmail from "./pages/member/findIdByEmail";
import FindIdByTel from "./pages/member/findIdByTel";
import ChangePw from "./pages/member/ChangePw";
import FindPw from "./pages/member/FindPw";
import FindPwByMemail from "./pages/member/FindPwByMemail";
import FindPwByMtel from "./pages/member/FindPwByMtel";
import ChangePwDirect from "./pages/member/ChangePwDirect";
// Product
import ProductsPage from "./Product/pages/ProductsPage";
import ProductDetailPage from "./Product/pages/ProductDetailPage";

// Plan (현재 프로젝트에 존재하는 페이지만)
import PlanSelectPage from "./Plan/PlanSelectPage";
import PlanDetailPage from "./Plan/PlanDetailPage";

// Community 페이지 폴더가 현재 없음 → 나중에 추가 시 import/route 복원

export const router = createRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Home
      { index: true, element: <Home /> },

      // Member
      { path: "login", element: <LoginForm /> },
      { path: "signup", element: <SignupForm /> },
      { path: "member/profile", element: <Profile /> },
      { path: "member/updateProfile", element: <UpdateProfile /> },
      { path: "member/changePw", element: <ChangePw /> },
      { path: "member/findIdModal", element: <FindIdModal /> },
      { path: "member/findIdByEmail", element: <FindIdByEmail /> },
      { path: "member/findIdByTel", element: <FindIdByTel /> },
      { path: "member/findPw", element: <FindPw /> },
      { path: "member/findPwByMemail", element: <FindPwByMemail /> },
      { path: "member/findPwByMtel", element: <FindPwByMtel /> },
      { path: "member/changePwDirect", element: <ChangePwDirect /> },
      { path: "oauth/callback/:provider", element: <OAuthCallback /> },

      // Product
      { path: "products", element: <ProductsPage /> },
      { path: "products/page/:page", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },

      // 구독 플랜 (목록/상세)
      { path: "plans", element: <PlanSelectPage /> },
      { path: "plans/:planCode", element: <PlanDetailPage /> },

      // ✅ 체크아웃 (신규 경로: /plan/checkout, /plan/checkout/result)
      { path: "plan/checkout", element: <CheckoutPage /> },
      { path: "plan/checkout/result", element: <CheckoutResultPage /> },
      { path: "billing-keys/redirect", element: <BillingKeyRedirect /> },

      // ◇ 구 경로 호환 (기존 링크가 있을 경우 404 방지)
      { path: "checkout", element: <CheckoutPage /> },
      { path: "checkout/result", element: <CheckoutResultPage /> },

      // 소통(Community)
      {
        path: "board",
        element: <CommunityPage />,
        children: [
          { index: true, element: <Notice /> },
          { path: "notice", element: <Notice /> },
          { path: "event", element: <Event /> },
          { path: "inquiry", element: <Inquiry /> },
          { path: "faq", element: <FAQ /> },
          { path: "company", element: <Company /> },
        ],
      },

      // 404
      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },
]);