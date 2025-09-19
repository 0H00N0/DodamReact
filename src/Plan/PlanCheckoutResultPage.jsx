// src/Plan/PlanCheckoutResultPage.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";

/**
 * 결제/구독 결과 페이지
 * - 쿼리 파라미터로 invoiceId / status / transactionType 등을 표시
 */
export default function PlanCheckoutResultPage() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);

  const status = qs.get("status") || "";
  const message = qs.get("message") || "";
  const transactionType = qs.get("transactionType") || "";
  const paymentId = qs.get("paymentId") || "";
  const invoiceId = qs.get("invoiceId") || "";

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>구독 결과</h2>
      <div
        style={{
          padding: 16,
          border: "1px solid #eee",
          background: "#fafafa",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div>status: {status || "-"}</div>
        <div>message: {message || "-"}</div>
        <div>transactionType: {transactionType || "-"}</div>
        <div>invoiceId: {invoiceId || "-"}</div>
        <div>paymentId: {paymentId || "-"}</div>
      </div>

      <Link to="/plans" style={linkBtnStyle}>
        플랜 목록으로
      </Link>
    </div>
  );
}

const linkBtnStyle = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  textDecoration: "none",
  color: "#333",
};
