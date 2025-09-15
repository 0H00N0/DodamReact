// PlanList.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../admin/contexts/AdminContext'; // 경로 확인 필요

function PlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAllPlans, deletePlan } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getAllPlans();
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [getAllPlans]);

  const handleDelete = async (planId) => {
    if (window.confirm('정말로 이 플랜을 삭제하시겠습니까? 관련된 모든 정보가 삭제됩니다.')) {
      try {
        await deletePlan(planId);
        setPlans(plans.filter(p => p.planId !== planId));
      } catch (error) {
        console.error(`Failed to delete plan ${planId}`, error);
      }
    }
  };

  if (loading) {
    return <div>플랜 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="plan-list-header">
        <h2>구독 플랜 목록</h2>
        <Link to="/admin/plans/new" className="btn-primary">
          새 플랜 등록
        </Link>
      </div>

      <table className="products-table">
        <thead>
          <tr>
            <th>플랜 이름</th>
            <th>플랜 코드</th>
            {/* =================== 코드 수정된 부분 시작 =================== */}
            <th>월 요금</th>
            {/* =================== 코드 수정된 부분 끝 ===================== */}
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => {
            // =================== 코드 추가된 부분 시작 ===================
            // 1. plan의 prices 배열에서 1개월(termMonth: 1) 요금 찾기
            const monthlyPrice = plan.prices?.find(
              p => p.termMonth === 1 && p.ppriceBilMode === 'MONTHLY'
            );

            // 2. 찾은 요금을 원화(KRW) 형식으로 포맷팅
            const formattedPrice = monthlyPrice
              ? new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                }).format(monthlyPrice.ppriceAmount)
              : 'N/A'; // 1개월 요금이 없으면 'N/A' 표시
            // =================== 코드 추가된 부분 끝 =====================

            return (
              <tr key={plan.planId}>
                <td>{plan.planName}</td>
                <td>{plan.planCode}</td>
                {/* =================== 코드 수정된 부분 시작 =================== */}
                <td>{formattedPrice}</td>
                {/* =================== 코드 수정된 부분 끝 ===================== */}
                <td>
                  <span className={`status ${plan.planActive ? 'active' : 'inactive'}`}>
                    {plan.planActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/admin/plans/edit/${plan.planId}`)}
                  >
                    수정
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(plan.planId)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PlanList;