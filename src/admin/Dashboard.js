import React, { useState, useEffect } from 'react';
import { useAdmin } from './contexts/AdminContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Sub-components for Dashboard --- //

const StatCard = ({ title, value, icon, change, changeType }) => (
    <div className="stat-card">
        <div className="stat-header">
            <h3>{title}</h3>
            <div className="stat-icon">{icon}</div>
        </div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${changeType}`}>{change}</div>
    </div>
);

const RecentOrders = ({ orders, formatCurrency, getOrderStatusText, formatRelativeTime }) => (
    <div className="dashboard-section">
        <div className="section-header">
            <h2>최근 주문</h2>
            <button className="view-all-btn">전체 보기</button>
        </div>
        <div className="recent-orders">
            {orders.map(order => (
                <div key={order.id} className="order-item">
                    <div className="order-info">
                        <div className="order-id">{order.id}</div>
                        <div className="order-customer">{order.customer}</div>
                    </div>
                    <div className="order-details">
                        <div className="order-amount">{formatCurrency(order.amount)}</div>
                        <div className={`order-status ${order.status}`}>{getOrderStatusText(order.status)}</div>
                        <div className="order-time">{formatRelativeTime(order.date)}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TopProducts = ({ products, formatNumber, formatCurrency }) => (
    <div className="dashboard-section">
        <div className="section-header">
            <h2>인기 상품</h2>
            <button className="view-all-btn">전체 보기</button>
        </div>
        <div className="top-products">
            {products.map((product, index) => (
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
);


/**
 * 관리자 대시보드 컴포넌트
 * 주요 통계 정보와 최근 활동을 표시
 */
function Dashboard() {
  const { dashboardData, updateDashboardData, addNotification } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  useEffect(() => {
    const loadDashboardData = async () => {
        setLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockData = {
            totalOrders: 1234, totalProducts: 3301, totalUsers: 8901, totalRevenue: 23456789,
            recentOrders: [
              { id: '#ORD-001', customer: '김철수', amount: 29900, status: 'completed', date: new Date(Date.now() - 1000 * 60 * 30) },
              { id: '#ORD-002', customer: '이영희', amount: 49900, status: 'processing', date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
              { id: '#ORD-003', customer: '박민수', amount: 29900, status: 'shipped', date: new Date(Date.now() - 1000 * 60 * 60 * 5) },
              { id: '#ORD-004', customer: '최지우', amount: 79900, status: 'completed', date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
            ],
            topProducts: [
              { name: '레고 클래식 블록', sales: 120, revenue: 3588000 },
              { name: '뽀로로 코딩 컴퓨터', sales: 98, revenue: 4890200 },
              { name: '타요 컨트롤 주차타워', sales: 85, revenue: 2541500 },
              { name: '실바니안 패밀리 이층집', sales: 72, revenue: 3592800 }
            ],
            monthlySalesData: [ { name: '1월', sales: 2400000 }, { name: '2월', sales: 1398000 }, { name: '3월', sales: 9800000 }, { name: '4월', sales: 3908000 }, { name: '5월', sales: 4800000 }, { name: '6월', sales: 3800000 }, { name: '7월', sales: 4300000 }, ],
            popularToysData: [ { name: '레고', rentals: 4000 }, { name: '뽀로로', rentals: 3000 }, { name: '타요', rentals: 2000 }, { name: '실바니안', rentals: 2780 }, { name: '핑크퐁', rentals: 1890 }, { name: '콩순이', rentals: 2390 }, { name: '또봇', rentals: 3490 }, ],
            planDistributionData: [ { name: '베이직', value: 400 }, { name: '스탠다드', value: 300 }, { name: '프리미엄', value: 300 }, ],
          };
          updateDashboardData(mockData);
        } catch (error) {
          console.error('Dashboard data loading failed:', error);
          addNotification('대시보드 데이터 로드 실패', 'error');
        } finally {
          setLoading(false);
        }
    };
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);
  const formatCurrency = (amount) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', minimumFractionDigits: 0 }).format(amount);
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };
  const getOrderStatusText = (status) => ({ completed: '완료', processing: '처리중', shipped: '배송중', cancelled: '취소', pending: '대기중' }[status] || status);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading || !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"><div className="spinner"></div><p>대시보드 로딩 중...</p></div>
      </div>
    );
  }

  const statCardsData = [
      { title: '총 주문', value: formatNumber(dashboardData.totalOrders), change: '+12.5%', changeType: 'positive', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> },
      { title: '총 상품', value: formatNumber(dashboardData.totalProducts), change: '+5.2%', changeType: 'positive', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.09a2.25 2.25 0 012.244-2.477a3 3 0 005.78-1.128zM15 4.837a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.09a2.25 2.25 0 012.244-2.477a3 3 0 005.78-1.128zM15 9.84a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.09a2.25 2.25 0 012.244-2.477a3 3 0 005.78-1.128z" /></svg> },
      { title: '총 사용자', value: formatNumber(dashboardData.totalUsers), change: '+8.7%', changeType: 'positive', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-8.048 9.58 9.58 0 00-1.302-5.466 9.58 9.58 0 00-8.52-5.466 9.58 9.58 0 00-8.52 5.466 9.58 9.58 0 00-1.302 5.466 9.337 9.337 0 004.121 8.048 9.38 9.38 0 002.625.372M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
      { title: '총 매출', value: formatCurrency(dashboardData.totalRevenue), change: '+15.3%', changeType: 'positive', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v-.75A.75.75 0 015.25 4.5h.75m0 0h.75a.75.75 0 01.75.75v.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0h-.75a.75.75 0 01-.75-.75v-.75m0 0A.75.75 0 013.75 6h.75M12 12.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75z" /></svg> },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>대시보드</h1>
        <div className="header-actions">
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="period-select">
                <option value="7days">최근 7일</option>
                <option value="30days">최근 30일</option>
                <option value="90days">최근 90일</option>
            </select>
            <button className="refresh-btn" onClick={() => {}} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                새로고침
            </button>
        </div>
      </div>

      <div className="stats-grid">
        {statCardsData.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>월별 매출</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dashboardData.monthlySalesData}
              margin={{ left: 28, right: 16, top: 8, bottom: 8 }}  // ← 여백 추가
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickMargin={8} />
              <YAxis
                tickFormatter={formatNumber}
                width={76}             // ← 축 라벨 폭 확보
                tickMargin={8}         // ← 눈금·라벨 간격
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h2>구독 플랜 분포</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dashboardData.planDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {dashboardData.planDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value) + '명'}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <RecentOrders orders={dashboardData.recentOrders} formatCurrency={formatCurrency} getOrderStatusText={getOrderStatusText} formatRelativeTime={formatRelativeTime} />
        <TopProducts products={dashboardData.topProducts} formatNumber={formatNumber} formatCurrency={formatCurrency} />
      </div>

    </div>
  );
}

export default Dashboard;