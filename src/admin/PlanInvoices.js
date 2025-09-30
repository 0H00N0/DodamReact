// src/admin/plans/PlanInvoices.js
import React, { useEffect, useState } from "react";
import { useAdmin } from "../admin/contexts/AdminContext";

function PlanInvoices() {
  const { getAllInvoices } = useAdmin();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>결제 내역을 불러오는 중...</div>;

  return (
    <div>
      <h2>전체 결제 내역</h2>
      {invoices.length > 0 ? (
        <table className="products-table">
          <thead>
            <tr>
              <th>결제 ID</th>
              <th>구독 ID</th>
              <th>회원 번호</th>
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
            {invoices.map((i) => (
              <tr key={i.piId}>
                <td>{i.piId}</td>
                <td>{i.planMember?.pmId}</td>
                <td>{i.planMember?.member?.mnum}</td>
                <td>{i.planMember?.plan?.planName}</td>
                <td>
                  {new Intl.NumberFormat("ko-KR", {
                    style: "currency",
                    currency: i.piCurr || "KRW",
                  }).format(i.piAmount)}
                </td>
                <td>{i.piCurr}</td>
                <td>{i.piStat}</td>
                <td>{i.piUid}</td>
                <td>{i.piStart}</td>
                <td>{i.piEnd}</td>
                <td>{i.piPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>결제 내역이 없습니다.</p>
      )}
    </div>
  );
}

export default PlanInvoices;
