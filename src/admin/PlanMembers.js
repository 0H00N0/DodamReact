// src/admin/plans/PlanMembers.js
import React, { useEffect, useMemo, useState } from "react";
import { useAdmin } from "../admin/contexts/AdminContext";

// ✅ 구독 상태 한글 번역
const toKoreanSubscriptionStatus = (raw) => {
  if (!raw) return "미정";
  const s = String(raw).toUpperCase();
  const map = {
    ACTIVE: "활성",
    PAUSED: "일시중지",
    CANCELED: "취소됨",
    EXPIRED: "만료됨",
    PENDING: "대기중",
    CANCEL_SCHEDULED: "취소 예정",
  };
  return map[s] || s;
};

// ✅ 청구 방식 한글 번역
const toKoreanBillingMode = (raw) => {
  if (!raw) return "미정";
  const s = String(raw).toUpperCase();
  const map = { MONTHLY: "월 구독", PREPAID_TERM: "기간 선결제" };
  return map[s] || s;
};

function PlanMembers() {
  const { getAllSubscriptions } = useAdmin();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 상태 필터 관련 상태
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // ALL | ACTIVE | ...
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const data = await getAllSubscriptions();
        setSubscriptions(data || []);
      } catch (error) {
        console.error("구독 회원 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [getAllSubscriptions]);

  // ✅ 구독 상태 목록(데이터 기반 유니크)
  const statusOptions = useMemo(() => {
    const set = new Set();
    (subscriptions || []).forEach((s) => {
      if (s?.pmStat) set.add(String(s.pmStat).toUpperCase());
    });
    return ["ALL", ...Array.from(set).sort()];
  }, [subscriptions]);

  // ✅ 필터링된 리스트
  const filtered = useMemo(() => {
    return (subscriptions || []).filter((s) => {
      const st = String(s?.pmStat || "").toUpperCase();
      if (activeOnly && st !== "ACTIVE") return false;
      if (selectedStatus !== "ALL" && st !== selectedStatus) return false;
      return true;
    });
  }, [subscriptions, selectedStatus, activeOnly]);

  if (loading) return <div>구독 회원 목록을 불러오는 중...</div>;

  return (
    <div>
      <h2>구독 회원 목록</h2>

      {/* ✅ 필터 UI */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <label>
          <strong>상태 필터:&nbsp;</strong>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "ALL" ? "전체" : toKoreanSubscriptionStatus(opt)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          <span>활성만 보기</span>
        </label>

        <div style={{ marginLeft: "auto", opacity: 0.8 }}>
          총 {subscriptions.length}건 / 표시 {filtered.length}건
        </div>
      </div>

      {filtered.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>구독 ID</th>
              <th>회원 번호</th>
              <th>회원 이름</th>
              <th>플랜명</th>
              <th>상태</th>
              <th>청구 방식</th>
              <th>구독 시작일</th>
              <th>기간 시작</th>
              <th>기간 종료</th>
              <th>다음 결제일</th>
              <th>취소 여부</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.pmId}>
                <td>{s.pmId}</td>
                <td>{s.memberId}</td>
                <td>{s.memberName}</td>
                <td>{s.planName}</td>
                <td>{toKoreanSubscriptionStatus(s.pmStat)}</td>
                <td>{toKoreanBillingMode(s.pmBilMode)}</td>
                <td>{s.pmStart}</td>
                <td>{s.pmTermStart}</td>
                <td>{s.pmTermEnd}</td>
                <td>{s.pmNextBil}</td>
                <td>{s.pmCancelCheck ? "예" : "아니오"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>조건에 맞는 구독 회원이 없습니다.</p>
      )}
    </div>
  );
}

export default PlanMembers;
