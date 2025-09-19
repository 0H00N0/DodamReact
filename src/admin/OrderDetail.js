// OrderDetail.js (전체 교체)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './OrderDetail.css';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { getOrderById, updateOrderApproval, assignOrderRider } = useAdmin();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shippingInfo, setShippingInfo] = useState({ renRider: '', trackingNumber: '' });
    const [showShippingForm, setShowShippingForm] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error("주문 상세 정보 조회 실패:", error);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [orderId, getOrderById]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);
    
    const handleApprove = async () => {
        if (window.confirm(`주문번호 ${order.renNum}를 승인 처리하시겠습니까?`)) {
            try {
                await updateOrderApproval(order.renNum);
                fetchOrder(); // 상태 갱신을 위해 데이터 다시 불러오기
            } catch (error) {
                console.error("승인 처리 실패:", error);
            }
        }
    };
    
    const handleShippingSave = async (e) => {
        e.preventDefault();
        if (!shippingInfo.renRider || !shippingInfo.trackingNumber) {
            alert('배송 기사와 운송장 번호를 모두 입력해주세요.');
            return;
        }
        try {
            await assignOrderRider(order.renNum, shippingInfo);
            fetchOrder(); // 상태 갱신
            setShowShippingForm(false); // 폼 숨기기
        } catch (error) {
            console.error("배송 정보 저장 실패:", error);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 0: return { text: '승인대기', className: 'pending' };
            case 1: return { text: '배송중', className: 'shipping' };
            // 추가적인 상태 정의
            default: return { text: '알수없음', className: '' };
        }
    };

    if (loading) {
        return <div className="order-detail-container"><h2>주문 정보를 불러오는 중...</h2></div>;
    }

    if (!order) {
        return <div className="order-detail-container"><h2>주문 정보를 찾을 수 없습니다.</h2></div>;
    }

    const statusInfo = getStatusInfo(order.renApproval);

    return (
        <div className="order-detail-container">
            <div className="order-detail-header">
                <h1>주문 상세 정보</h1>
                <Link to="/admin/orders" className="back-to-list-btn">목록으로 돌아가기</Link>
            </div>

            <div className="order-detail-grid">
                <div className="detail-card">
                    <h2>주문 정보</h2>
                    <p><strong>주문 번호:</strong> {order.renNum}</p>
                    <p><strong>상품명:</strong> {order.productName}</p>
                    <p><strong>주문일:</strong> {new Date(order.renDate).toLocaleString()}</p>
                    <p><strong>상태:</strong> 
                        <span className={`status-badge ${statusInfo.className}`}>
                            {statusInfo.text}
                        </span>
                    </p>
                </div>

                <div className="detail-card">
                    <h2>고객 정보</h2>
                    <p><strong>고객명:</strong> {order.memberName}</p>
                    {/* <p><strong>고객 ID:</strong> {order.memberId}</p> */}
                    {/* <p><strong>배송 주소:</strong> {order.address}</p> */}
                </div>

                <div className="detail-card">
                    <h2>배송 정보</h2>
                    <p><strong>배송 기사/택배사:</strong> {order.renRider || '미입력'}</p>
                    <p><strong>운송장 번호:</strong> {order.trackingNumber || '미입력'}</p>
                </div>

                <div className="detail-card order-actions">
                    <h2>주문 처리</h2>
                    {order.renApproval === 0 && (
                        <button onClick={handleApprove} className="action-approve-btn">대여 승인</button>
                    )}
                    {order.renApproval === 1 && !order.trackingNumber && (
                        <button className="action-shipping-btn" onClick={() => setShowShippingForm(!showShippingForm)}>
                            운송장 정보 입력
                        </button>
                    )}
                    {showShippingForm && (
                        <form className="shipping-form" onSubmit={handleShippingSave}>
                            <input 
                                type="text" 
                                placeholder="배송 기사 / 택배사" 
                                value={shippingInfo.renRider}
                                onChange={(e) => setShippingInfo({...shippingInfo, renRider: e.target.value})}
                            />
                            <input 
                                type="text" 
                                placeholder="운송장 번호" 
                                value={shippingInfo.trackingNumber}
                                onChange={(e) => setShippingInfo({...shippingInfo, trackingNumber: e.target.value})}
                            />
                            <button type="submit" className="action-shipping-btn">저장</button>
                        </form>
                    )}
                     {order.renApproval === 1 && order.trackingNumber && (
                        <p>배송 정보 입력이 완료되었습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;