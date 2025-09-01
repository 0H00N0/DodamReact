import React from 'react';

const CompanyPage = () => {

    // === 하위 컴포넌트 정의 ===
    const CompanyOverview = () => (
        <div>
            <p>도담도담은 아이들의 상상력과 즐거움을 가장 소중히 여기는 장난감 쇼핑몰입니다.</p>
            <p>설립 : 2010년</p>
            <p>직원 수: 50명</p>
            <p>특징 : 안전한 장난감, 다양한 테마, 온라인/오프라인 구매 가능 </p>
        </div>
    );

    const companyHistory = () => (
        <ul>
            <li>2010년 : 도담도담 창립</li>
            <li>2013년 : 온라인 몰 오픈</li>
            <li>2018년 : 전국 매장 5곳 확장</li>
            <li>2023년 : AR/VR 체험존 도입</li>
        </ul>
    );

    return (
        <div>
            <h1>회사 소개</h1>
            <CompanyOverview></CompanyOverview>
            <h2>연혁</h2>
            <CompantHistory></CompantHistory>
        </div>
    );  
};

export default CompanyPage;