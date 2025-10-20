// src/main/frontend/.../OrderDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './OrderDetail.css';

// 여러 키 중 첫 값 반환
const pick = (obj, keys, fallback = undefined) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return fallback;
};

// 날짜 포맷 안전 처리
const fmtDateTime = (v, empty = '-') => {
  const raw = typeof v === 'string' || typeof v === 'number' ? v : null;
  if (!raw) return empty;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? empty : d.toLocaleString();
};

// 상태 한글 변환
const toKoreanStatus = (raw) => {
  if (!raw) return '미정';
  const s = String(raw).toUpperCase();
  const map = {
    PENDING: '대기중',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    RETURNED: '반납완료',
  };
  return map[s] || s;
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateTrackingNumber } = useAdmin();

  const isNumericId = /^\d+$/.test(String(orderId ?? ''));

  const [order, setOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isNumericId) {
        navigate('/admin/orders/list', { replace: true });
        return;
      }

      const data = await getOrderById(Number(orderId));
      if (!data) {
        setError('주문 데이터를 불러올 수 없습니다.');
        return;
      }

      setOrder(data);

      // 운송장 초기값(여러 키 시도)
      const tn = pick(data, ['trackingNumber', 'trackingNum', 'invoiceNo'], '');
      setTrackingInput(tn || '');
    } catch (e) {
      console.error('주문 상세 정보 조회 실패:', e);
      setError('주문 정보를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [isNumericId, orderId, getOrderById, navigate]);

  useEffect(() => { load(); }, [load]);

  const onSaveTracking = async () => {
    try {
      if (!order) return;
      setSaving(true);
      setSaveMsg(null);
      const id = pick(order, ['renNum', 'id', 'orderId']);
      await updateTrackingNumber(id, trackingInput?.trim() || null);
      setSaveMsg('운송장 번호가 저장되었습니다.');
      // 저장 후 최신값 반영을 위해 재조회(선호)
      await load();
    } catch (e) {
      console.error('운송장 저장 실패:', e);
      setSaveMsg(e?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 2000);
    }
  };

  if (loading) return <div className="order-detail-container"><h2>불러오는 중…</h2></div>;
  if (error || !order) return <div className="order-detail-container"><h2>{error || '주문 정보를 찾을 수 없습니다.'}</h2></div>;

  // 백엔드 키 불일치를 흡수한 표시값들
  const id = pick(order, ['renNum', 'id', 'orderId']);
  const productName = pick(order, ['productName', 'prodName', 'proname'], '정보 없음');
  const memberName = pick(order, ['memberName', 'mname', 'mid', 'memberId'], '정보 없음');
  const rentalDate = fmtDateTime(pick(order, ['renDate', 'rentalDate']));
  const returnDate = fmtDateTime(pick(order, ['retDate', 'returnDate']), '미정');
  const status = toKoreanStatus(pick(order, ['renShip', 'status', 'shippingStatus'], '미정'));

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h1>주문 상세 정보</h1>
        <Link to="/admin/orders" className="back-to-list-btn">목록으로</Link>
      </div>

      <div className="order-detail-grid">
        <div className="detail-card">
          <h2>주문 정보</h2>
          <p><strong>주문 번호:</strong> {id}</p>
          <p><strong>상품명:</strong> {productName}</p>
          <p><strong>대여일:</strong> {rentalDate}</p>
          <p><strong>반납일:</strong> {returnDate}</p>
        </div>

        <div className="detail-card">
          <h2>고객 정보</h2>
          <p><strong>고객명:</strong> {memberName}</p>
        </div>

        <div className="detail-card">
          <h2>배송 정보</h2>
          <p><strong>배송 상태:</strong> {status}</p>

          <div className="tracking-row">
            <label htmlFor="trackingNumber"><strong>운송장 번호:</strong></label>
            <input
              id="trackingNumber"
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="운송장 번호를 입력하세요"
            />
            <button disabled={saving} onClick={onSaveTracking}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>

          {saveMsg && <div className="save-message">{saveMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
