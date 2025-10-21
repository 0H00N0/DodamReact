// src/admin/orders/OrderDetail.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAdmin } from "./contexts/AdminContext";
import "./OrderDetail.css";

const safePick = (obj, keys, fallback = undefined) => {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
};

const label = (s) => {
  const m = { PENDING: "대기중", SHIPPING: "배송중", DELIVERED: "배송완료", RETURNED: "반납완료" };
  return m[s] || s || "미정";
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateTrackingNumber, updateOrderStatus } = useAdmin();

  const isNumericId = /^\d+$/.test(String(orderId ?? ""));

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [trackingInput, setTrackingInput] = useState("");
  const [statusInput, setStatusInput] = useState("SHIPPING");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isNumericId) {
        navigate("/admin/orders/list", { replace: true });
        return;
      }

      const data = await getOrderById(Number(orderId));
      setOrder(data || null);

      const t = safePick(data, ["trackingNum", "invoiceNum"], "");
      setTrackingInput(t || "");

      const s = String(
        safePick(data, ["status", "renShip", "shippingStatus"], "SHIPPING")
      ).toUpperCase();
      setStatusInput(["SHIPPING", "DELIVERED"].includes(s) ? s : "SHIPPING");
    } catch (e) {
      setError(e?.message || "주문 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [getOrderById, isNumericId, navigate, orderId]);

  useEffect(() => { load(); }, [load]);

  const onSaveTracking = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateTrackingNumber(order.renNum, trackingInput || "");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const onSaveStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(order.renNum, statusInput);
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-message">불러오는 중…</div>;
  if (error) return <div className="loading-message">{error}</div>;
  if (!order) return <div className="loading-message">주문이 없습니다.</div>;

  return (
    <div className="order-detail-container">
      <div className="breadcrumb">
        <Link to="/admin/orders">← 주문 목록</Link>
      </div>

      <h2>주문 상세 #{order.renNum}</h2>

      <div className="detail-grid">
        <div className="card">
          <h3>기본 정보</h3>
          <div className="row"><span className="label">주문자명</span><span>{order.mid || "미정"}</span></div>
          <div className="row"><span className="label">상품명</span><span>{order.prodName || "미정"}</span></div>
          <div className="row"><span className="label">대여일</span><span>{order.rentalDate ? new Date(order.rentalDate).toLocaleString() : "-"}</span></div>
          <div className="row"><span className="label">반납일</span><span>{order.returnDate ? new Date(order.returnDate).toLocaleString() : "미정"}</span></div>
          <div className="row"><span className="label">배송상태</span><span>{label(order.status || order.renShip)}</span></div>
        </div>

        <div className="card">
          <h3>배송 정보</h3>
          <div className="tracking-row">
            <label><strong>운송장 번호</strong></label>
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="송장 번호 입력"
            />
            <button disabled={saving} onClick={onSaveTracking}>
              {saving ? "저장 중…" : "운송장 저장"}
            </button>
          </div>

          <div className="tracking-row" style={{ marginTop: "0.75rem" }}>
            <label><strong>배송 상태</strong></label>
            <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
              <option value="SHIPPING">배송중</option>
              <option value="DELIVERED">배송완료</option>
            </select>
            <button disabled={saving} onClick={onSaveStatus}>
              {saving ? "저장 중…" : "상태 저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
