// src/admin/plans/PlanInvoices.js
import React, { useEffect, useMemo, useState } from "react";
import { useAdmin } from "../admin/contexts/AdminContext";

// ✅ 결제 상태 한글 변환
const toKoreanInvoiceStatus = (raw) => {
  if (!raw) return "미정";
  const s = String(raw).toUpperCase();
  const map = {
    PENDING: "결제 대기",
    PAID: "결제 완료",
    FAILED: "결제 실패",
    CANCELED: "결제 취소",
    REFUNDED: "환불 완료",
    READY: "준비 중",
  };
  return map[s] || s;
};

function PlanInvoices() {
  const { getAllInvoices } = useAdmin();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 필터 상태
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // ALL | PENDING | PAID | ...
  const [paidOnly, setPaidOnly] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getAllInvoices();
        setInvoices(data || []);
      } catch (error) {
        console.error("결제 내역 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [getAllInvoices]);

  // ✅ 데이터 기반 상태 옵션
  const statusOptions = useMemo(() => {
    const set = new Set();
    (invoices || []).forEach((i) => {
      if (i?.piStat) set.add(String(i.piStat).toUpperCase());
    });
    return ["ALL", ...Array.from(set).sort()];
  }, [invoices]);

  // ✅ 필터링 결과
  const filtered = useMemo(() => {
    return (invoices || []).filter((i) => {
      const st = String(i?.piStat || "").toUpperCase();
      if (paidOnly && st !== "PAID") return false;
      if (selectedStatus !== "ALL" && st !== selectedStatus) return false;
      return true;
    });
  }, [invoices, selectedStatus, paidOnly]);

  if (loading) return <div>결제 내역을 불러오는 중...</div>;

  return (
    <div>
      <h2>전체 결제 내역</h2>

      {/* ✅ 필터 UI */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <label>
          <strong>상태 필터:&nbsp;</strong>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "ALL" ? "전체" : toKoreanInvoiceStatus(opt)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={paidOnly}
            onChange={(e) => setPaidOnly(e.target.checked)}
          />
          <span>결제 완료만 보기</span>
        </label>

        <div style={{ marginLeft: "auto", opacity: 0.8 }}>
          총 {invoices.length}건 / 표시 {filtered.length}건
        </div>
      </div>

      {filtered.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>결제 ID</th>
              <th>구독 ID</th>
              <th>회원 번호</th>
              <th>회원 이름</th>
              <th>플랜명</th>
              <th>금액</th>
              <th>통화</th>
              <th>상태</th>
              <th>결제 UID</th>
              <th>결제 시작</th>
              <th>결제 종료</th>
              <th>결제 완료일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.piId}>
                <td>{i.piId}</td>
                <td>{i.pmId}</td>
                <td>{i.memberId}</td>
                <td>{i.memberName}</td>
                <td>{i.planName}</td>
                <td>
                  {new Intl.NumberFormat("ko-KR", {
                    style: "currency",
                    currency: i.piCurr || "KRW",
                  }).format(i.piAmount)}
                </td>
                <td>{i.piCurr}</td>
                <td>{toKoreanInvoiceStatus(i.piStat)}</td>
                <td>{i.piUid || "-"}</td>
                <td>{i.piStart}</td>
                <td>{i.piEnd}</td>
                <td>{i.piPaid || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>조건에 맞는 결제 내역이 없습니다.</p>
      )}
    </div>
  );
}

export default PlanInvoices;
