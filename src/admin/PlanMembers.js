// src/admin/plans/PlanMembers.js
import React, { useEffect, useState } from "react";
import { useAdmin } from "../admin/contexts/AdminContext";

function PlanMembers() {
  const { getAllSubscriptions } = useAdmin();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>구독 회원 목록을 불러오는 중...</div>;

  return (
    <div>
      <h2>구독 회원 목록</h2>
      {subscriptions.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>구독 ID</th>
              <th>회원 번호</th>
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
            {subscriptions.map((s) => (
              <tr key={s.pmId}>
                <td>{s.pmId}</td>
                <td>{s.member?.mnum}</td>
                <td>{s.plan?.planName}</td>
                <td>{s.pmStat}</td>
                <td>{s.pmBilMode}</td>
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
        <p>구독 회원이 없습니다.</p>
      )}
    </div>
  );
}

export default PlanMembers;
