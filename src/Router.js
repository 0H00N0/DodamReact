import React from "react";
import { createBrowserRouter as createRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import App from "./App";

// 파일명이 PlanCheckout.jsx 라면 아래처럼!
import CheckoutPage from "./Plan/PlanCheckout";
import CheckoutResultPage from "./Plan/PlanCheckoutResultPage";
import BillingKeyRedirect from "./Plan/PlanBillingKeyRedirect";
import Home from "./pages/Home";

// Member
import LoginForm from "./pages/member/LoginForm";
import SignupForm from "./pages/member/SignupForm";
import Profile from "./pages/member/Profile";
import UpdateProfile from "./pages/member/UpdateProfile"; 
import OAuthCallback from "./pages/member/OAuthCallback";
import FindIdModal from "./pages/member/FindIdModal";
import FindIdByEmail from "./pages/member/findIdByEmail";
import FindIdByTel from "./pages/member/findIdByTel";
import ChangePw from "./pages/member/ChangePw";
import FindPw from "./pages/member/FindPw";
import FindPwByMemail from "./pages/member/FindPwByMemail";
import FindPwByMtel from "./pages/member/FindPwByMtel";
import ChangePwDirect from "./pages/member/ChangePwDirect";
import DeleteAccount from "./pages/member/DeleteAccount";
// Product
import ProductsPage from "./Product/pages/ProductsPage";
import ProductDetailPage from "./Product/pages/ProductDetailPage";

// Plan (현재 프로젝트에 존재하는 페이지만)
import PlanSelectPage from "./Plan/PlanSelectPage";
import PlanDetailPage from "./Plan/PlanDetailPage";

// Community
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

//Main
import Search from "./pages/Search";

// 고객 서비스
import FooterContactPage from "./pages/FooterPage/FooterContectPage";
import FooterShippingPage from "./pages/FooterPage/FooterShippingPage";
import FooterReturnPage from "./pages/FooterPage/FooterReturnPage";
import FooterAsPage from "./pages/FooterPage/FooterAsPage";

// 쇼핑 가이드 (적립금 제외)
import FooterOrderGuidePage from "./pages/FooterPage/FooterOrderGuidePage";
import FooterPaymentGuidePage from "./pages/FooterPage/FooterPaymentGuidePage";
import FooterMembershipPage from "./pages/FooterPage/FooterMembershipPage";
import FooterSafetyPage from "./pages/FooterPage/FooterSafetyPage";

// 정책 및 약관
import FooterTermsPage from "./pages/FooterPage/FooterTermsPage";
import FooterPrivacyPage from "./pages/FooterPage/FooterPrivacyPage";
import FooterYouthPolicyPage from "./pages/FooterPage/FooterYouthPolicyPage";
import FooterEcommercePage from "./pages/FooterPage/FooterEcommercePage";

import ErrorPage from "./pages/ErrorPage";

export const router = createRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,   // ✅ 라우터 에러 바운더리
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
      { path: "member/delete", element: <DeleteAccount /> },

      // Product
      { path: "products", element: <ProductsPage /> },
      { path: "products/page/:page", element: <ProductsPage /> },
      { path: "products/:pronum", element: <ProductDetailPage /> },

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

      { path: "search/:keyword", element: <Search /> },
      { path: "search", element: <Search /> },

      // 소통(Community)
      {
        path: "board",
        element: <CommunityPage />,
        children: [
          { index: true, element: <Notice /> },
          { path: "notice", element: <Notice /> },
          { path: "notice/:noticeId", element: <NoticeDetail /> },
          { path: "event", element: <Event /> },
          { path: "event/:eventId", element: <EventDetail /> },
          { path: "community", element: <CommunityBoard /> },
          { path: "community/:postId", element: <CommunityBoardDetail /> },
          { path: "community/write", element: <CommunityBoardForm /> },
          { path: "community/edit/:postId", element: <CommunityBoardEdit /> },
          { path: "community/delete/:postId", element: <CommunityBoardDelete /> },
          { path: "inquiry", element: <Inquiry /> },
          { path: "faq", element: <FAQ /> },
          { path: "company", element: <Company /> },
        ],
      },

      // ✅ FAQ 리다이렉트: /customer/faq → /board/faq  (푸터 링크 호환용)
      { path: "customer/faq", element: <Navigate to="/board/faq" replace /> },

      // 고객 서비스
      { path: "customer/contact", element: <FooterContactPage /> },
      { path: "customer/shipping", element: <FooterShippingPage /> },
      { path: "customer/return", element: <FooterReturnPage /> },
      { path: "customer/as", element: <FooterAsPage /> },

      // 쇼핑 가이드 (적립금 안내 제외)
      { path: "guide/order", element: <FooterOrderGuidePage /> },
      { path: "guide/payment", element: <FooterPaymentGuidePage /> },
      { path: "guide/membership", element: <FooterMembershipPage /> },
      { path: "guide/safety", element: <FooterSafetyPage /> },

      // 정책 및 약관
      { path: "policy/terms", element: <FooterTermsPage /> },
      { path: "policy/privacy", element: <FooterPrivacyPage /> },
      { path: "policy/youth", element: <FooterYouthPolicyPage /> },
      { path: "policy/ecommerce", element: <FooterEcommercePage /> },
      { path: "company/about", element: <Navigate to="/board/company" replace /> },
      
      // Error
      { path: "error", element: <ErrorPage /> },        // 전역 에러 라우트
      { path: "*", element: <Navigate to="/error?code=404&reason=Not%20Found" replace /> },
    ],
  },
]);