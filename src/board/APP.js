// src/board/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "../pages/Home";
import CompanyPage from "../pages/CompanyPage/CompanyPage";

function App() {
  return (
    <Router>
      <div>
        {/* 상단 카테고리 메뉴 */}
        <nav>
          <ul>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/company">회사소개</Link></li>
          </ul>
        </nav>

        {/* 메인 내용 */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/company" element={<CompanyPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
