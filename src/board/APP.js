// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import CompanyPage from "./pages/CompanyPage/CompanyPage";

function App() {
  return (
    <Router>
      <div>
        {/* ✅ 카테고리(메뉴) 영역 */}
        <nav>
          <ul>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/company">회사 소개</Link></li>
            <li><Link to="/community">커뮤니티</Link></li>
            {/* 필요하면 더 추가 */}
          </ul>
        </nav>

        {/* ✅ 라우팅 영역 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<CompanyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;