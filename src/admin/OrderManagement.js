import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { orders as dummyOrders } from '../utils/dummyData';
import './OrderManagement.css';

const OrderManagement = () => {
    const [activeTab, setActiveTab] = useState('approval');
    const [orders, setOrders] = useState(dummyOrders);

    const handleApprove = (orderId) => {
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: '배송중' } : order
        ));
    };

    const handleShippingSubmit = (orderId, courier, trackingNumber) => {
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, shippingInfo: { ...order.shippingInfo, courier, trackingNumber } } : order
        ));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'approval':
                return <RentalList orders={orders.filter(o => o.status === '승인대기')} onApprove={handleApprove} />;
            case 'shipping':
                return <ShippingList orders={orders.filter(o => o.status === '배송중')} onSubmit={handleShippingSubmit} />;
            case 'returns':
                return <ReturnList orders={orders.filter(o => ['반납완료', '연체', '파손'].includes(o.status))} />;
            default:
                return null;
        }
    };

    return (
        <div className="order-management">
            <h1>주문 관리</h1>
            <div className="order-tabs">
                <button className={`order-tab ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')}>대여 승인</button>
                <button className={`order-tab ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>배송 관리</button>
                <button className={`order-tab ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>회수/연체/손∙분실</button>
            </div>
            <div className="order-content">
                {renderContent()}
            </div>
        </div>
    );
};

const RentalList = ({ orders, onApprove }) => (
    <div className="order-table-container">
        <table className="order-table">
            <thead>
                <tr>
                    <th>주문번호</th>
                    <th>사용자</th>
                    <th>상품명</th>
                    <th>대여기간</th>
                    <th>상태</th>
                    <th>작업</th>
                </tr>
            </thead>
            <tbody>
                {orders.map(order => (
                    <tr key={order.id}>
                        <td><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></td>
                        <td>{order.userName} ({order.userId})</td>
                        <td>{order.productName}</td>
                        <td>{order.rentalStartDate} ~ {order.rentalEndDate}</td>
                        <td><span className="status-pending">{order.status}</span></td>
                        <td>
                            <button onClick={() => onApprove(order.id)} className="approve-btn">승인</button>
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
        }
    };

    return (
        <div className="order-table-container">
            <table className="order-table">
                <thead>
                    <tr>
                        <th>주문번호</th>
                        <th>사용자</th>
                        <th>상품명</th>
                        <th>배송지</th>
                        <th>운송장 정보</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></td>
                            <td>{order.userName} ({order.userId})</td>
                            <td>{order.productName}</td>
                            <td>{order.shippingInfo.address}</td>
                            <td>
                                {order.shippingInfo.trackingNumber ? (
                                    <span>{order.shippingInfo.courier} / {order.shippingInfo.trackingNumber}</span>
                                ) : (
                                    <div className="shipping-input">
                                        <input type="text" placeholder="택배사" onChange={(e) => handleChange(order.id, 'courier', e.target.value)} />
                                        <input type="text" placeholder="운송장 번호" onChange={(e) => handleChange(order.id, 'trackingNumber', e.target.value)} />
                                        <button onClick={() => handleSubmit(order.id)} className="shipping-btn">입력</button>
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

const ReturnList = ({ orders }) => {
    const getStatusClass = (status) => {
        if (status === '연체') return 'status-overdue';
        if (status === '파손') return 'status-damaged';
        return 'status-returned';
    };

    return (
        <div className="order-table-container">
            <table className="order-table">
                <thead>
                    <tr>
                        <th>주문번호</th>
                        <th>사용자</th>
                        <th>상품명</th>
                        <th>반납일/상태</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></td>
                            <td>{order.userName} ({order.userId})</td>
                            <td>{order.productName}</td>
                            <td><span className={getStatusClass(order.status)}>{order.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;
