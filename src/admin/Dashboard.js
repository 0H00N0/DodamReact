import React, { useState, useEffect } from 'react';
import { useAdmin } from './contexts/AdminContext';

/**
 * 관리자 대시보드 컴포넌트
 * 주요 통계 정보와 최근 활동을 표시
 */
function Dashboard() {
  const { dashboardData, updateDashboardData, addNotification } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // 대시보드 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        totalOrders: 1234,
        totalProducts: 567,
        totalUsers: 8901,
        totalRevenue: 2345678,
        recentOrders: [
          {
            id: '#ORD-001',
            customer: '김철수',
            amount: 125000,
            status: 'completed',
            date: new Date(Date.now() - 1000 * 60 * 30) // 30분 전
          },
          {
            id: '#ORD-002',
            customer: '이영희',
            amount: 89000,
            status: 'processing',
            date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2시간 전
          },
          {
            id: '#ORD-003',
            customer: '박민수',
            amount: 156000,
            status: 'shipped',
            date: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5시간 전
          }
        ],
        topProducts: [
          { name: '아이폰 15', sales: 234, revenue: 234000000 },
          { name: '갤럭시 S24', sales: 189, revenue: 189000000 },
          { name: '맥북 프로', sales: 156, revenue: 312000000 },
          { name: '에어�팟 프로', sales: 345, revenue: 86250000 }
        ],
        salesChart: [
          { date: '2024-01-01', sales: 45000 },
          { date: '2024-01-02', sales: 52000 },
          { date: '2024-01-03', sales: 48000 },
          { date: '2024-01-04', sales: 61000 },
          { date: '2024-01-05', sales: 55000 },
          { date: '2024-01-06', sales: 67000 },
          { date: '2024-01-07', sales: 59000 }
        ]
      };
      
      updateDashboardData(mockData);
    } catch (error) {
      console.error('Dashboard data loading failed:', error);
      addNotification('대시보드 데이터 로드 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 숫자 포맷팅
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 통화 포맷팅
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 상대 시간 포맷팅
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  };

  // 주문 상태 한글 변환
  const getOrderStatusText = (status) => {
    const statusMap = {
      'completed': '완료',
      'processing': '처리중',
      'shipped': '배송중',
      'cancelled': '취소',
      'pending': '대기중'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* 페이지 헤더 */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>대시보드</h1>
          <div className="header-actions">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="7days">최근 7일</option>
              <option value="30days">최근 30일</option>
              <option value="90days">최근 90일</option>
            </select>
            <button 
              className="refresh-btn"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M23 4v6h-6M1 20v-6h6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>총 주문</h3>
            <div className="stat-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatNumber(dashboardData.totalOrders)}</div>
          <div className="stat-change positive">+12.5%</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>총 상품</h3>
            <div className="stat-icon products">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatNumber(dashboardData.totalProducts)}</div>
          <div className="stat-change positive">+5.2%</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>총 사용자</h3>
            <div className="stat-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatNumber(dashboardData.totalUsers)}</div>
          <div className="stat-change positive">+8.7%</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>총 매출</h3>
            <div className="stat-icon revenue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatCurrency(dashboardData.totalRevenue)}</div>
          <div className="stat-change positive">+15.3%</div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="dashboard-content">
        {/* 최근 주문 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>최근 주문</h2>
            <button className="view-all-btn">전체 보기</button>
          </div>
          <div className="recent-orders">
            {dashboardData.recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <div className="order-id">{order.id}</div>
                  <div className="order-customer">{order.customer}</div>
                </div>
                <div className="order-amount">{formatCurrency(order.amount)}</div>
                <div className={`order-status ${order.status}`}>
                  {getOrderStatusText(order.status)}
                </div>
                <div className="order-time">{formatRelativeTime(order.date)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 상품 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>인기 상품</h2>
            <button className="view-all-btn">전체 보기</button>
          </div>
          <div className="top-products">
            {dashboardData.topProducts.map((product, index) => (
              <div key={product.name} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-stats">
                    <span className="sales-count">{formatNumber(product.sales)}개 판매</span>
                    <span className="revenue">{formatCurrency(product.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 차트 영역 (간단한 표시) */}
      <div className="dashboard-section full-width">
        <div className="section-header">
          <h2>매출 추이</h2>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color sales"></span>
              일일 매출
            </span>
          </div>
        </div>
        <div className="sales-chart">
          <div className="chart-container">
            {dashboardData.salesChart.map((data, index) => (
              <div key={data.date} className="chart-bar">
                <div 
                  className="bar"
                  style={{
                    height: `${(data.sales / Math.max(...dashboardData.salesChart.map(d => d.sales))) * 100}%`
                  }}
                  title={`${data.date}: ${formatCurrency(data.sales)}`}
                ></div>
                <div className="bar-label">
                  {new Date(data.date).getDate()}일
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;