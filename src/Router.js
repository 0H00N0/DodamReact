import React from "react";
import { createBrowserRouter as createRouter } from "react-router-dom";
import App from "./App";

// --- Pages ---
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
      { path: "member/delete", element: <DeleteAccount /> },

      // Product
      { path: "products", element: <ProductsPage /> },
      { path: "products/page/:page", element: <ProductsPage /> },
      { path: "products/:pronum", element: <ProductDetailPage /> },

      // Plan (체크아웃/결제 리다이렉트는 파일 없음 → 제외)
      { path: "plans", element: <PlanSelectPage /> },
      { path: "plans/:planCode", element: <PlanDetailPage /> },

      // 404
      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },
]);
