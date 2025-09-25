import React from "react";
import { createHashRouter as createRouter } from "react-router-dom";
import App from "./App";

import PlanSelectPage from "./Plan/PlanSelectPage";
import PlanDetailPage from "./Plan/PlanDetailPage";
// 파일명이 PlanCheckout.jsx 라면 아래처럼!
import CheckoutPage from "./Plan/PlanCheckout";
import CheckoutResultPage from "./Plan/PlanCheckoutResultPage";
import BillingKeyRedirect from "./Plan/PlanBillingKeyRedirect";

import ProductsPage from "./Product/pages/ProductsPage";
import ProductDetailPage from "./Product/pages/ProductDetailPage";

import CommunityPage from "./pages/CommunityPage/CommunityPage";
import Notice from "./pages/CommunityPage/Notice";
import Event from "./pages/CommunityPage/Event";
import Inquiry from "./pages/CommunityPage/Inquiry";
import FAQ from "./pages/CommunityPage/FAQ";
import Company from "./pages/CommunityPage/Company";

import Home from "./pages/Home";
import LoginForm from "./pages/member/LoginForm";
import SignupForm from "./pages/member/SignupForm";
import Profile from "./pages/member/Profile";

export const router = createRouter([
  {
    path: "/",
    element: <App />, // Header/Footer 공통
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <LoginForm /> },
      { path: "signup", element: <SignupForm /> },
      { path: "member/profile", element: <Profile /> },

      // 상품
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