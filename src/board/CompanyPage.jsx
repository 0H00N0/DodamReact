import React, { useState } from 'react';

const CompanyPage = () => {
    const [activeTab, setActiveTab] =useState('overview');

    // === 하위 컴포넌트 정의 ===
    const CompanyOverview = () => (
        <div className="tab-content">
            <p>도담도담은 아이들의 상상력과 즐거움을 가장 소중히 여기는 장난감 쇼핑몰입니다.</p>
            <p>설립 : 2010년</p>
            <p>직원 수: 50명</p>
            <p>특징 : 안전한 장난감, 다양한 테마, 온라인/오프라인 구매 가능 </p>
        </div>
    );

    const CompanyHistory = () => (
        <ul className="tab-content">
            <li>2010년 : 도담도담 창립</li>
            <li>2013년 : 온라인 몰 오픈</li>
            <li>2018년 : 전국 매장 5곳 확장</li>
            <li>2023년 : AR/VR 체험존 도입</li>
        </ul>
    );

    const CompanyLocation = () => (
        <div className="tab-content">
            <p>본사 : 서울특별시 관악구</p>
            <p>전화 : 02-6020-0055</p>
            <p>이메일 : info@dodamdodam.com</p>
            <p>지도 : </p>
        </div>
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif '}}>
            <h1 style={{ textAlign:'center',marginBottom: '30px' }}>회사 소개</h1>
        
            {/* 메뉴 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        {['overview', 'history', 'location'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #007bff' : '3px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: '0.3s'
            }}
          >
            {tab === 'overview' ? '회사 개요' : tab === 'history' ? '연혁' : '위치/연락처'}
          </button>
        ))}
      </div>

      {/* 선택된 탭 렌더링 */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        {activeTab === 'overview' && <CompanyOverview />}
        {activeTab === 'history' && <CompanyHistory />}
        {activeTab === 'location' && <CompanyLocation />}
      </div>
    </div>
  );
};

export default CompanyPage;