import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './OrderManagement.css';

const OrderManagement = () => {
    const { getAllOrders, updateOrderApproval, assignOrderRider } = useAdmin();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('approval');

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("주문 목록 조회 실패:", error);
        } finally {
            setLoading(false);
        }
    }, [getAllOrders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleApprove = async (orderId) => {
        if (window.confirm(`주문번호 ${orderId}를 승인 처리하시겠습니까?`)) {
            try {
                await updateOrderApproval(orderId);
                fetchOrders(); // 목록 새로고침
            } catch (error) {
                console.error("주문 승인 실패:", error);
            }
        }
    };

    const handleShippingSubmit = async (orderId, courier, trackingNumber) => {
        try {
            await assignOrderRider(orderId, { renRider: courier, trackingNumber });
            fetchOrders(); // 목록 새로고침
        } catch (error) {
            console.error("운송장 정보 입력 실패:", error);
        }
    };
    
    // 백엔드 renApproval 값에 따른 상태 텍스트 매핑
    const getStatusText = (status) => {
        switch (status) {
            case 0: return '승인대기';
            case 1: return '배송중';
            // ... 다른 상태값들 추가 ...
            default: return '알수없음';
        }
    };

    const renderContent = () => {
        if (loading) return <div>로딩 중...</div>;
        
        // renApproval: 0(승인대기), 1(배송중/승인완료)
        const approvalList = orders.filter(o => o.renApproval === 0);
        const shippingList = orders.filter(o => o.renApproval === 1);
        // ... 다른 탭에 대한 필터링 로직 추가 가능 ...

        switch (activeTab) {
            case 'approval':
                return <RentalList orders={approvalList} onApprove={handleApprove} getStatusText={getStatusText} />;
            case 'shipping':
                return <ShippingList orders={shippingList} onSubmit={handleShippingSubmit} />;
            default:
                return <div className="order-table-container"><p>해당 상태의 주문이 없습니다.</p></div>;
        }
    };

    return (
        <div className="order-management">
            <h1>주문 관리</h1>
            <div className="order-tabs">
                <button className={`order-tab ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')}>대여 승인</button>
                <button className={`order-tab ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>배송 관리</button>
            </div>
            <div className="order-content">
                {renderContent()}
            </div>
        </div>
    );
};

// ... (RentalList, ShippingList, ReturnList 컴포넌트는 아래에 이어서 작성) ...

const RentalList = ({ orders, onApprove, getStatusText }) => (
    <div className="order-table-container">
        <table className="order-table">
            <thead>
                <tr>
                    <th>주문번호</th>
                    <th>주문자명</th>
                    <th>상품명</th>
                    <th>주문일</th>
                    <th>상태</th>
                    <th>작업</th>
                </tr>
            </thead>
            <tbody>
                {orders.map(order => (
                    <tr key={order.renNum}>
                        <td><Link to={`/admin/orders/${order.renNum}`}>{order.renNum}</Link></td>
                        <td>{order.memberName}</td>
                        <td>{order.productName}</td>
                        <td>{new Date(order.renDate).toLocaleDateString()}</td>
                        <td><span className="status-pending">{getStatusText(order.renApproval)}</span></td>
                        <td>
                            <button onClick={() => onApprove(order.renNum)} className="approve-btn">승인</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ShippingList = ({ orders, onSubmit }) => {
    const [shippingDetails, setShippingDetails] = useState({});

    const handleChange = (orderId, field, value) => {
        setShippingDetails(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], [field]: value }
        }));
    };

    const handleSubmit = (orderId) => {
        const details = shippingDetails[orderId];
        if (details && details.courier && details.trackingNumber) {
            onSubmit(orderId, details.courier, details.trackingNumber);
            // 입력 필드 초기화
            setShippingDetails(prev => ({...prev, [orderId]: null}));
        } else {
            alert('택배사와 운송장 번호를 모두 입력해주세요.');
        }
    };

    return (
        <div className="order-table-container">
            <table className="order-table">
                <thead>
                    <tr>
                        <th>주문번호</th>
                        <th>주문자명</th>
                        <th>상품명</th>
                        <th>운송장 정보</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.renNum}>
                            <td><Link to={`/admin/orders/${order.renNum}`}>{order.renNum}</Link></td>
                            <td>{order.memberName}</td>
                            <td>{order.productName}</td>
                            <td>
                                {order.trackingNumber ? (
                                    <span>{order.renRider} / {order.trackingNumber}</span>
                                ) : (
                                    <div className="shipping-input">
                                        <input type="text" placeholder="배송기사(택배사)" onChange={(e) => handleChange(order.renNum, 'courier', e.target.value)} />
                                        <input type="text" placeholder="운송장 번호" onChange={(e) => handleChange(order.renNum, 'trackingNumber', e.target.value)} />
                                        <button onClick={() => handleSubmit(order.renNum)} className="shipping-btn">입력</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default OrderManagement;