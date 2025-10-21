// src/admin/orders/OrderManagement.js
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "./contexts/AdminContext";
import "./OrderManagement.css";

const statusLabel = (s) => {
  const m = { PENDING: "대기중", SHIPPING: "배송중", DELIVERED: "배송완료", RETURNED: "반납완료" };
  return m[s] || s || "미정";
};

const OrderTable = ({ title, orders, onReload }) => {
  const { updateOrderStatus } = useAdmin();
  const [statusDraft, setStatusDraft] = useState({}); // renNum -> status

  const handleSave = async (renNum) => {
    const next = statusDraft[renNum];
    if (!next) return;
    await updateOrderStatus(renNum, next);
    await onReload?.();
  };

  const columns = [
    { header: "주문번호", render: (o) => <Link to={`/admin/orders/${o.renNum}`}>{o.renNum}</Link> },
    { header: "주문자명", render: (o) => o.mid || "미정" },
    { header: "상품명", render: (o) => o.prodName || "미정" },
    { header: "대여일", render: (o) => (o.rentalDate ? new Date(o.rentalDate).toLocaleDateString() : "-") },
    { header: "반납일", render: (o) => (o.returnDate ? new Date(o.returnDate).toLocaleDateString() : "미정") },
    { header: "배송상태", render: (o) => statusLabel(o.status || o.renShip) },
    { header: "운송장", render: (o) => o.trackingNum || "미입력" },
    {
      header: "상태변경",
      render: (o) => (
        <div className="status-actions">
          <select
            className="status-select"
            defaultValue={(o.status || o.renShip || "SHIPPING").toUpperCase()}
            onChange={(e) =>
              setStatusDraft((prev) => ({ ...prev, [o.renNum]: e.target.value }))
            }
          >
            <option value="SHIPPING">배송중</option>
            <option value="DELIVERED">배송완료</option>
          </select>
          <button className="status-save-btn" onClick={() => handleSave(o.renNum)}>
            저장
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="order-content-area">
      <h3>{title}</h3>
      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>{columns.map((c, i) => <th key={i}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length ? (
              orders.map((o) => (
                <tr key={o.renNum}>
                  {columns.map((c, i) => (
                    <td key={i}>{c.render(o)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">주문이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const { getAllOrders } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setError(e?.message || "주문 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [getAllOrders]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return <div className="loading-message">로딩 중…</div>;
  if (error) return <div className="loading-message">{error}</div>;

  return (
    <div className="order-management-container">
      <OrderTable title="전체 대여 목록" orders={orders} onReload={fetchOrders} />
    </div>
  );
};

export default OrderManagement;
