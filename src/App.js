// src/board/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import CompanyPage from "./CompanyPage";

function App() {
  return (
    <Router>
      <div>
        {/* ✅ 메뉴 영역 */}
        <nav>
          <ul>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/company">회사 소개</Link></li>
          </ul>
        </nav>

        {/* ✅ 페이지 영역 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<CompanyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;