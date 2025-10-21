// src/admin/plans/PlanDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../admin/contexts/AdminContext";

function PlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getPlanById } = useAdmin();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await getPlanById(planId);
        setPlan(data);
      } catch (error) {
        console.error("플랜 상세 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, getPlanById]);

  if (loading) return <div>상세 정보를 불러오는 중...</div>;
  if (!plan) return <div>플랜 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="plan-detail-container">
      <div className="page-header">
        <h2>플랜 상세 정보</h2>
        <div>
          <button
            className="btn-edit"
            onClick={() => navigate(`/admin/plans/edit/${plan.planId}`)}
          >
            수정
          </button>
          <Link to="/admin/plans" className="btn-secondary">
            목록으로
          </Link>
        </div>
      </div>

      <div className="plan-info">
        <p><strong>ID:</strong> {plan.planId}</p>
        <p><strong>플랜 코드:</strong> {plan.planCode}</p>
        <p><strong>플랜 이름:</strong> {plan.planName}</p>
        <p>
          <strong>상태:</strong>{" "}
          <span className={plan.planActive ? "status active" : "status inactive"}>
            {plan.planActive ? "활성" : "비활성"}
          </span>
        </p>
        <p><strong>생성일:</strong> {plan.planCreate}</p>
      </div>

      <div className="plan-section">
        <h3>가격 정보</h3>
        {plan.prices && plan.prices.length > 0 ? (
          <table className="detail-table">
            <thead>
              <tr>
                <th>기간(개월)</th>
                <th>결제 방식</th>
                <th>금액</th>
                <th>통화</th>
                <th>활성 여부</th>
              </tr>
            </thead>
            <tbody>
              {plan.prices.map((price, idx) => (
                <tr key={idx}>
                  <td>{price.termMonth}</td>
                  <td>{price.ppriceBilMode}</td>
                  <td>{price.ppriceAmount}</td>
                  <td>{price.ppriceCurr}</td>
                  <td>{price.ppriceActive ? "활성" : "비활성"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>가격 정보가 없습니다.</p>
        )}
      </div>

      <div className="plan-section">
        <h3>혜택 정보</h3>
        {plan.benefits && plan.benefits.length > 0 ? (
          <ul>
            {plan.benefits.map((benefit, idx) => (
              <li key={idx}>
                {benefit.pbNote}
                {benefit.pbPriceCap && ` (월 상한: ${benefit.pbPriceCap}원)`}
              </li>
            ))}
          </ul>
        ) : (
          <p>혜택 정보가 없습니다.</p>
        )}
      </div>
    </div>
    
  );
}

export default PlanDetail;
