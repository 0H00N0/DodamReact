import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "../pages/Home"; // 상대경로 주의!
import CompanyPage from "../pages/CompanyPage/CompanyPage";

function App() {
  return (
    <Router>
      <div>
        {/* 상단 카테고리 메뉴 */}
        <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
          <ul style={{ display: 'flex', listStyle: 'none', justifyContent: 'center', margin: 0, padding: 0 }}>
            <li style={{ margin: '0 15px' }}><Link to="/">홈</Link></li>
            <li style={{ margin: '0 15px' }}><Link to="/company">회사소개</Link></li>
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
