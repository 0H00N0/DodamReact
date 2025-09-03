// src/pages/CompanyPage/CompanyPage.js
import React from 'react';

const CompanyPage = () => {
  return (
    <div>
      {/* 헤더 */}
      <header style={{ backgroundColor: '#f5f5f5', padding: '20px 0', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2em', color: '#333' }}>도담도담</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', lineHeight: '1.6' }}>
        <section>
          <h2 style={{ color: '#444', textAlign: 'center' }}>회사 소개</h2>
          <p>저희 도담도담은 고객 만족을 최우선으로 하는 IT 기업입니다.</p>
          <p>설립: 2000년</p>
          <p>직원 수: 200명</p>
          <p>
            풍부한 경험과 차별화된 전략을 바탕으로 다양한 IT 솔루션과 서비스를 제공하고 있습니다.
          </p>
        </section>

        <section style={{ marginTop: '40px' }}>
          <h2 style={{ color: '#444', textAlign: 'center' }}>비전 & 가치</h2>
          <p>혁신적인 아이디어와 고객 중심의 서비스를 통해 세상을 더 편리하게 만듭니다.</p>
        </section>
      </main>

      {/* 푸터 */}
      <footer style={{ backgroundColor: '#333', color: '#fff', textAlign: 'center', padding: '15px 0' }}>
        &copy; 2025 도담도담. All rights reserved.
      </footer>
    </div>
  );
};

export default CompanyPage;
