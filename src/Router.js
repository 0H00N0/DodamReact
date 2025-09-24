import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";

const Home = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./pages/member/LoginForm"));
const SignupForm = React.lazy(() => import("./pages/member/SignupForm"));
const Profile = React.lazy(() => import("./pages/member/Profile"));
const UpdateProfile = React.lazy(() => import("./pages/member/updateProfile"));
const PlanSelectPage = React.lazy(() => import("./Plan/PlanSelectPage"));
const PlanDetailPage = React.lazy(() => import("./Plan/PlanDetailPage"));
const ProductsPage = React.lazy(() => import("./Product/pages/ProductsPage"));
const ProductDetailPage = React.lazy(() => import("./Product/pages/ProductDetailPage"));
const OAuthCallback = React.lazy(() => import("./pages/member/OAuthCallback"));
const FindIdModal = React.lazy(() => import("./pages/member/FindIdModal"));
const FindIdByEmail = React.lazy(() => import("./pages/member/findIdByEmail"));
const FindIdByTel = React.lazy(() => import("./pages/member/findIdByTel"));
const ChangePw = React.lazy(() => import("./pages/member/ChangePw"));
const FindPw = React.lazy(() => import("./pages/member/FindPw"));
const FindPwByMemail = React.lazy(() => import("./pages/member/FindPwByMemail"));
const FindPwByMtel = React.lazy(() => import("./pages/member/FindPwByMtel"));
const ChangePwDirect = React.lazy(() => import("./pages/member/ChangePwDirect"));

const withSuspense = (Component) => (
  <Suspense fallback={<div style={{ padding: 24 }}>로딩...</div>}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: withSuspense(Home) },

      // auth
      { path: "loginForm", element: withSuspense(LoginForm) },
      { path: "signup", element: withSuspense(SignupForm) },
      { path: "member/profile", element: withSuspense(Profile) },
      { path: "member/updateProfile", element: withSuspense(UpdateProfile) },

      // legacy redirects
      { path: "login", element: <Navigate to="/loginForm" replace /> },
      { path: "member/loginForm", element: <Navigate to="/loginForm" replace /> },
      { path: "member/signup", element: <Navigate to="/signup" replace /> },

      // plans
      { path: "plans", element: withSuspense(PlanSelectPage) },
      { path: "plans/:planCode", element: withSuspense(PlanDetailPage) },

      // products
      { path: "products", element: withSuspense(ProductsPage) },
      { path: "products/page/:page", element: withSuspense(ProductsPage) },
      { path: "products/:id", element: withSuspense(ProductDetailPage) },

      // find id / pw
      { path: "member/findIdModal", element: withSuspense(FindIdModal) },
      { path: "member/findIdByEmail", element: withSuspense(FindIdByEmail) },
      { path: "member/findIdByTel", element: withSuspense(FindIdByTel) },

      { path: "member/findPw", element: withSuspense(FindPw) },
      { path: "member/findPwByMemail", element: withSuspense(FindPwByMemail) },
      { path: "member/findPwByMtel", element: withSuspense(FindPwByMtel) },
      { path: "member/changePw", element: withSuspense(ChangePw) },
      { path: "member/changePwDirect", element: withSuspense(ChangePwDirect) },

      // oauth
      { path: "oauth/callback/:provider", element: withSuspense(OAuthCallback) },

      // 404
      { path: "*", element: <div style={{ padding: 24 }}>404</div> }
    ]
  }
]);