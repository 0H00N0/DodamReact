import React from "react";
import { createBrowserRouter as createRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import App from "./App";
/** Admin */
import Admin from "./admin/Admin"; // 레이아웃
import Dashboard from "./admin/Dashboard";
import UserManagement from "./admin/UserManagement";
import ProductManagement from "./admin/ProductManagement";
import PlanManagement from "./admin/PlanManagement";
import CategoryManagement from "./admin/CategoryManagement";
import DeliverymanManagement from "./admin/DeliverymanManagement";
import OrderManagement from "./admin/OrderManagement";
import OrderDetail from "./admin/OrderDetail";
import BoardManagement from "./admin/BoardManagement";
import VocManagement from "./admin/VocManagement";
import EventManagement from "./admin/EventManagement";
import DiscountManagement from "./admin/DiscountManagement";
import BulkProductUpload from "./admin/BulkProductUpload";
/** Plan */
import CheckoutPage from "./Plan/PlanCheckOut";
import CheckoutResultPage from "./Plan/PlanCheckoutResultPage";
import CheckoutQueryRedirect from "./Plan/PlanCheckoutQueryRedirect"; // ← 쿼리→REST 변환 가드
import BillingKeyRedirect from "./Plan/PlanBillingKeyRedirect";

/** Home */
import Home from "./pages/Home";

/** Member */
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
import Membership from "./pages/member/Membership";
import Cash from "./pages/member/Cash";
import Cart from "./pages/Cart";
import ReviewList from "./pages/member/ReviewList";
import OrderHistory from "./pages/orders/OrderHistory";

/** Product */
import ProductsPage from "./Product/pages/ProductsPage";
import ProductDetailPage from "./Product/pages/ProductDetailPage";
import Category from "./pages/Category";

/** Plan (목록/상세) */
import PlanSelectPage from "./Plan/PlanSelectPage";
import PlanDetailPage from "./Plan/PlanDetailPage";

/** Community */
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
// ...existing code...
import SmartBoard from "./Board/SmartBoard";
// ...existing code...
import './index.css';

/** Main */
import Search from "./pages/Search";

/** 고객 서비스 */
import FooterContactPage from "./pages/FooterPage/FooterContectPage";
import FooterShippingPage from "./pages/FooterPage/FooterShippingPage";
import FooterReturnPage from "./pages/FooterPage/FooterReturnPage";
import FooterAsPage from "./pages/FooterPage/FooterAsPage";

/** 쇼핑 가이드 */
import FooterOrderGuidePage from "./pages/FooterPage/FooterOrderGuidePage";
import FooterPaymentGuidePage from "./pages/FooterPage/FooterPaymentGuidePage";
import FooterMembershipPage from "./pages/FooterPage/FooterMembershipPage";
import FooterSafetyPage from "./pages/FooterPage/FooterSafetyPage";

/** 정책 및 약관 */
import FooterTermsPage from "./pages/FooterPage/FooterTermsPage";
import FooterPrivacyPage from "./pages/FooterPage/FooterPrivacyPage";
import FooterYouthPolicyPage from "./pages/FooterPage/FooterYouthPolicyPage";
import FooterEcommercePage from "./pages/FooterPage/FooterEcommercePage";

import ErrorPage from "./pages/ErrorPage";

export const router = createRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      /** Home */
      { index: true, element: <Home /> },

      /*admin*/
      {
      path: "admin",
      element: <Admin />, // ✅ Admin 레이아웃
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "users", element: <UserManagement /> },
        { path: "products", element: <ProductManagement /> },
        { path: "plans", element: <PlanManagement /> },
        { path: "categories", element: <CategoryManagement /> },
        { path: "deliverymen", element: <DeliverymanManagement /> },
        { path: "orders", element: <OrderManagement /> },
        { path: "orders/:orderId", element: <OrderDetail /> },
        { path: "boards", element: <BoardManagement /> },
        { path: "voc", element: <VocManagement /> },
        { path: "events", element: <EventManagement /> },
        { path: "discounts", element: <DiscountManagement /> },
        { path: "products/bulk-upload", element: <BulkProductUpload /> },
        { path: "*", element: <ErrorPage /> }, // or 404 페이지
      ],
    },

      /** Member */
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
      { path: "member/membership", element: <Membership /> },
      { path: "member/cash", element: <Cash /> },
      { path: "member/delete", element: <DeleteAccount /> },
      { path: "member/reviewList", element: <ReviewList /> },
      { path: "auth/find-id", element: <FindIdModal /> },
      { path: "auth/find-pw",  element: <FindPw /> },
      
      // ✅ 장바구니 라우트 (두 경로 모두 같은 페이지로)
      { path: "cart", element: <Cart /> },           // 헤더 카트
      { path: "member/cart", element: <Cart /> },    // 유저 드롭다운 카트
      { path: "orders", element: <OrderHistory /> },

      /** Product */
      { path: "products", element: <ProductsPage /> },
      { path: "products/page/:page", element: <ProductsPage /> },
      { path: "products/:pronum", element: <ProductDetailPage /> },
      { path: "category/:categoryName", element: <Category /> },

      /** Plan (목록/상세) */
      { path: "plans", element: <PlanSelectPage /> },
      { path: "plans/:planCode", element: <PlanDetailPage /> },

      /** ✅ 체크아웃 (정확히 두 개만! 다른 변종 라우트 금지) */
      // 예) /plan/checkout/BASIC/1
      { path: "plan/checkout/:planCode/:months", element: <CheckoutPage /> },

      // 예) /plan/checkout/result/inv212-xxxx
      { path: "plan/checkout/result/:paymentId", element: <CheckoutResultPage /> },

      /** Billing key redirect */
      { path: "billing-keys/redirect", element: <BillingKeyRedirect /> },

      /** ◇ 구 링크 호환: 쿼리 → REST 변환 가드 */
      { path: "plan/checkout", element: <CheckoutQueryRedirect /> },

      /** 이전 축약 경로는 안전한 곳으로만 보냄 */
      { path: "plan/checkout/result", element: <Navigate to="/member/membership" replace /> },
      { path: "plan/checkout", element: <Navigate to="/plans" replace /> },
      { path: "plan/checkout/result", element: <Navigate to="/member/membership" replace /> },

      /** Search */
      { path: "search/:keyword", element: <Search /> },
      { path: "search", element: <Search /> },

      /** Community */
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
          { path: "smartboard", element: <SmartBoard /> },
        ],
      },
   

      /** FAQ 리다이렉트 */
      { path: "customer/faq", element: <Navigate to="/board/faq" replace /> },

      /** 고객 서비스 */
      { path: "customer/contact", element: <FooterContactPage /> },
      { path: "customer/shipping", element: <FooterShippingPage /> },
      { path: "customer/return", element: <FooterReturnPage /> },
      { path: "customer/as", element: <FooterAsPage /> },

      /** 쇼핑 가이드 */
      { path: "guide/order", element: <FooterOrderGuidePage /> },
      { path: "guide/payment", element: <FooterPaymentGuidePage /> },
      { path: "guide/membership", element: <FooterMembershipPage /> },
      { path: "guide/safety", element: <FooterSafetyPage /> },

      /** 정책 및 약관 */
      { path: "policy/terms", element: <FooterTermsPage /> },
      { path: "policy/privacy", element: <FooterPrivacyPage /> },
      { path: "policy/youth", element: <FooterYouthPolicyPage /> },
      { path: "policy/ecommerce", element: <FooterEcommercePage /> },

      /** 회사 소개 호환 */
      { path: "company/about", element: <Navigate to="/board/company" replace /> },

      /** Error */
      { path: "error", element: <ErrorPage /> },
      { path: "*", element: <Navigate to="/error?code=404&reason=Not%20Found" replace /> },
    ],
  },
]);
