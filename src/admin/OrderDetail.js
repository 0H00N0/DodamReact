// OrderDetail.js (전체 교체)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './OrderDetail.css';

const OrderDetail = ({ onUpdate }) => {
    const { orderId } = useParams();
    const { getOrderById, updateOrderApproval, assignOrderRider } = useAdmin();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({ renRider: '', trackingNumber: '', renShip: '' });
    const [showShippingForm, setShowShippingForm] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrderById(orderId);
            setOrder(data);
            setShippingInfo({ renRider: data.renRider || '', trackingNumber: data.trackingNumber || '', renShip: data.renShip || '' });
        } catch (error) {
            console.error("주문 상세 정보 조회 실패:", error);
            setError("주문 정보를 찾을 수 없습니다.");
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
                fetchOrder();
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error("승인 처리 실패:", error);
                setError("승인 처리에 실패했습니다.");
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
            await assignOrderRider(order.renNum, { ...shippingInfo, renShip: '배송중' });
            fetchOrder();
            if (onUpdate) onUpdate();
            setShowShippingForm(false);
        } catch (error) {
            console.error("배송 정보 저장 실패:", error);
            setError("배송 정보 저장에 실패했습니다.");
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 0: return { text: '승인대기', className: 'pending' };
            case 1: return { text: order?.renShip || '배송중', className: 'shipping' };
            default: return { text: '알수없음', className: '' };
        }
    };

    if (loading) return <div className="order-detail-container"><h2>주문 정보를 불러오는 중...</h2></div>;
    if (error || !order) return <div className="order-detail-container"><h2>{error || "주문 정보를 찾을 수 없습니다."}</h2></div>;

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
                    <p><strong>대여일:</strong> {new Date(order.renDate).toLocaleString()}</p>
                    <p><strong>반납일:</strong> {order.retDate ? new Date(order.retDate).toLocaleString() : '미정'}</p>
                    <p><strong>상태:</strong> <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span></p>
                    <p><strong>연체:</strong> {order.overdue === 1 ? '연체' : '정상'}</p>
                    <p><strong>연장:</strong> {order.extend === 1 ? '연장중' : '대여중'}</p>
                    <p><strong>손실/분실:</strong> {order.renloss === 1 ? '손실' : order.renloss === 2 ? '분실' : '정상'}</p>
                    <p><strong>회수대상:</strong> {order.restate === 10 ? '회수대상' : '기본'}</p>
                </div>

                <div className="detail-card">
                    <h2>고객 정보</h2>
                    <p><strong>고객명:</strong> {order.memberName}</p>
                </div>

                <div className="detail-card">
                    <h2>배송 정보</h2>
                    <p><strong>배송 기사/택배사:</strong> {order.renRider || '미입력'}</p>
                    <p><strong>운송장 번호:</strong> {order.trackingNumber || '미입력'}</p>
                    <p><strong>배송 상태:</strong> {order.renShip || '미입력'}</p>
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
                            <input 
                                type="text" 
                                placeholder="배송 상태 (예: 배송중)" 
                                value={shippingInfo.renShip}
                                onChange={(e) => setShippingInfo({...shippingInfo, renShip: e.target.value})}
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