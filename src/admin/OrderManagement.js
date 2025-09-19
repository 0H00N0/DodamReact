// OrderManagement.js (전체 교체)
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import OrderDetail from './OrderDetail';
import './OrderManagement.css';

// 공통 OrderTable 컴포넌트
const OrderTable = ({ title, orders, columns }) => (
    <div className="order-content-area">
        <h3>{title}</h3>
        <div className="order-table-container">
            <table className="order-table">
                <thead>
                    <tr>{columns.map((col, i) => <th key={i}>{col.header}</th>)}</tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? orders.map(order => (
                        <tr key={order.renNum}>
                            {columns.map((col, i) => <td key={i}>{col.accessor(order)}</td>)}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length} className="no-data">해당하는 주문이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// 대여 승인 컴포넌트
const ApprovalComponent = ({ orders, onApprove }) => {
    const columns = [
        { header: '주문번호', accessor: o => <Link to={`/admin/orders/${o.renNum}`}>{o.renNum}</Link> },
        { header: '주문자명', accessor: o => o.memberName },
        { header: '상품명', accessor: o => o.productName },
        { header: '대여일', accessor: o => new Date(o.renDate).toLocaleDateString() },
        { header: '반납일', accessor: o => o.retDate ? new Date(o.retDate).toLocaleDateString() : '미정' },
        { header: '상태', accessor: () => <span className="status-pending">승인대기</span> },
        { header: '작업', accessor: o => <button onClick={() => onApprove(o.renNum)} className="approve-btn">승인</button> },
    ];
    return <OrderTable title="대여 승인" orders={orders} columns={columns} />;
};

// 배송 중/완료 컴포넌트
const ShippingComponent = ({ orders, onSubmit }) => {
    const [shippingDetails, setShippingDetails] = useState({});
    const handleChange = (id, field, value) => setShippingDetails(p => ({ ...p, [id]: { ...p[id], [field]: value } }));
    const handleSubmit = (id) => {
        const d = shippingDetails[id];
        if (d && d.courier && d.trackingNumber) onSubmit(id, d.courier, d.trackingNumber);
        else alert('배송기사와 운송장 번호를 모두 입력해주세요.');
    };

    const columns = [
        { header: '주문번호', accessor: o => <Link to={`/admin/orders/${o.renNum}`}>{o.renNum}</Link> },
        { header: '주문자명', accessor: o => o.memberName },
        { header: '상품명', accessor: o => o.productName },
        { header: '배송상태', accessor: o => o.renShip || '미입력' },
        { header: '운송장 정보', accessor: o => (
            o.trackingNumber ? (
                <span>{o.renRider} / {o.trackingNumber}</span>
            ) : (
                <div className="shipping-input">
                    <input type="text" placeholder="배송기사(택배사)" onChange={(e) => handleChange(o.renNum, 'courier', e.target.value)} />
                    <input type="text" placeholder="운송장 번호" onChange={(e) => handleChange(o.renNum, 'trackingNumber', e.target.value)} />
                    <button onClick={() => handleSubmit(o.renNum)} className="shipping-btn">입력</button>
                </div>
            )
        ) },
    ];
    return <OrderTable title="배송 중/완료" orders={orders} columns={columns} />;
};

// 메인 OrderManagement 컴포넌트
const OrderManagement = () => {
    const { getAllOrders, updateOrderApproval, assignOrderRider } = useAdmin();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async (filter = {}) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllOrders(filter); // 서버 API가 필터 지원 시 활용
            setOrders(data || []);
        } catch (error) {
            console.error("주문 목록 조회 실패:", error);
            setError("주문 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
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
                fetchOrders();
            } catch (error) {
                console.error("승인 처리 실패:", error);
                setError("승인 처리에 실패했습니다.");
            }
        }
    };

    const handleShippingSubmit = async (orderId, courier, trackingNumber) => {
        try {
            await assignOrderRider(orderId, { renRider: courier, trackingNumber, renShip: '배송중' });
            fetchOrders();
        } catch (error) {
            console.error("배송 정보 저장 실패:", error);
            setError("배송 정보 저장에 실패했습니다.");
        }
    };

    if (loading) return <div className="loading-message">로딩 중...</div>;
    if (error) return <div className="loading-message">{error}</div>;

    // 클라이언트 측 필터링
    const filteredData = {
        list: orders,
        approval: orders.filter(o => o.renApproval === 0),
        shipping: orders.filter(o => o.renApproval === 1),
        returns: orders.filter(o => o.restate === 10),
        overdue: orders.filter(o => o.overdue === 1),
        lost: orders.filter(o => o.renloss === 1 || o.renloss === 2),
        extended: orders.filter(o => o.extend === 1), // 새 필터 추가
    };

    const genericColumns = [
        { header: '주문번호', accessor: o => <Link to={`/admin/orders/${o.renNum}`}>{o.renNum}</Link> },
        { header: '주문자명', accessor: o => o.memberName },
        { header: '상품명', accessor: o => o.productName },
        { header: '대여일', accessor: o => new Date(o.renDate).toLocaleDateString() },
        { header: '반납일', accessor: o => o.retDate ? new Date(o.retDate).toLocaleDateString() : '미정' },
        { header: '배송상태', accessor: o => o.renShip || '미입력' },
    ];

    return (
        <div className="order-management-container">
            <Routes>
                <Route path="/" element={<Navigate to="list" replace />} />
                <Route path="list" element={<OrderTable title="전체 대여 목록" orders={filteredData.list} columns={genericColumns} />} />
                <Route path="approval" element={<ApprovalComponent orders={filteredData.approval} onApprove={handleApprove} />} />
                <Route path="shipping" element={<ShippingComponent orders={filteredData.shipping} onSubmit={handleShippingSubmit} />} />
                <Route path="returns" element={<OrderTable title="회수 목록" orders={filteredData.returns} columns={genericColumns} />} />
                <Route path="overdue" element={<OrderTable title="연체 목록" orders={filteredData.overdue} columns={genericColumns} />} />
                <Route path="lost" element={<OrderTable title="손실/분실 목록" orders={filteredData.lost} columns={genericColumns} />} />
                <Route path="extended" element={<OrderTable title="연장 목록" orders={filteredData.extended} columns={genericColumns} />} /> {/* 새 경로 추가 */}
                <Route path=":orderId" element={<OrderDetail onUpdate={fetchOrders} />} />
            </Routes>
        </div>
    );
};

export default OrderManagement;