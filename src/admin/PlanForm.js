import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';

function PlanForm() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { createPlan, getPlanById, updatePlan, getAllPlanNames } = useAdmin();

  // 백엔드 API에 맞는 기본 상태
  const [planCode, setPlanCode] = useState('');
  const [planNameId, setPlanNameId] = useState('');
  const [planActive, setPlanActive] = useState(true);
  const [planNames, setPlanNames] = useState([]);
  
  // 확장 기능을 위한 상태 (현재는 UI만 제공)
  const [prices, setPrices] = useState([{ termMonth: 1, billMode: 'auto', amount: '', currency: 'KRW' }]);
  const [benefits, setBenefits] = useState([{ note: '', priceCap: '' }]);
  
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(planId);

  // 컴포넌트 마운트 시 플랜 이름 목록 로드
  useEffect(() => {
    const fetchPlanNames = async () => {
      try {
        const names = await getAllPlanNames();
        setPlanNames(names);
      } catch (error) {
        console.error('Failed to fetch plan names:', error);
      }
    };
    fetchPlanNames();
  }, [getAllPlanNames]);

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditing && planId) {
      setLoading(true);
      getPlanById(planId)
        .then(data => {
          setPlanCode(data.planCode);
          setPlanActive(data.planActive);
          
          // planName으로 planNameId 찾기
          if (data.planName && planNames.length > 0) {
            const foundPlanName = planNames.find(pn => pn.planName === data.planName);
            if (foundPlanName) {
              setPlanNameId(foundPlanName.planNameId);
            }
          }

          // 확장 데이터가 있으면 설정 (현재는 빈 배열로 초기화)
          if (data.prices && data.prices.length > 0) {
            setPrices(data.prices);
          }
          if (data.benefits && data.benefits.length > 0) {
            setBenefits(data.benefits);
          }
        })
        .catch(error => {
          console.error('Failed to load plan data:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [planId, isEditing, getPlanById, planNames]);

  // 가격 정보 변경 핸들러
  const handlePriceChange = (index, field, value) => {
    const newPrices = [...prices];
    newPrices[index][field] = value;
    setPrices(newPrices);
  };
  
  const addPrice = () => setPrices([...prices, { termMonth: 1, billMode: 'auto', amount: '', currency: 'KRW' }]);
  const removePrice = index => setPrices(prices.filter((_, i) => i !== index));

  // 혜택 정보 변경 핸들러
  const handleBenefitChange = (index, field, value) => {
    const newBenefits = [...benefits];
    newBenefits[index][field] = value;
    setBenefits(newBenefits);
  };
  
  const addBenefit = () => setBenefits([...benefits, { note: '', priceCap: '' }]);
  const removeBenefit = index => setBenefits(benefits.filter((_, i) => i !== index));

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!planCode.trim()) {
      alert('플랜 코드를 입력해주세요.');
      return;
    }
    
    if (!planNameId) {
      alert('플랜 이름을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 백엔드 API에 맞는 데이터 형식으로 변환
      const requestData = {
        planNameId: parseInt(planNameId),
        planCode: planCode.trim(),
        planActive: planActive,
        // 확장 기능 데이터 (향후 백엔드 지원 시 사용)
        prices: prices.filter(p => p.amount), // 금액이 입력된 가격만 포함
        benefits: benefits.filter(b => b.note.trim()) // 설명이 입력된 혜택만 포함
      };

      if (isEditing) {
        await updatePlan(planId, requestData);
      } else {
        await createPlan(requestData);
      }
      
      navigate('/admin/plans');
    } catch (error) {
      console.error('Form submission failed:', error);
      alert(`플랜 ${isEditing ? '수정' : '등록'} 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>플랜 정보 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="plan-form-container">
      <h2>{isEditing ? '플랜 수정' : '새 플랜 등록'}</h2>
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 섹션 */}
        <div className="form-section">
          <h3>기본 정보</h3>
          
          <div className="form-group">
            <label htmlFor="planCode">플랜 코드 *</label>
            <input 
              id="planCode"
              type="text" 
              value={planCode} 
              onChange={e => setPlanCode(e.target.value)} 
              disabled={isEditing} // 수정 시에는 플랜 코드 변경 불가
              placeholder="예: BASIC_PLAN_001"
              required 
            />
            {isEditing && (
              <small className="form-help">플랜 코드는 수정할 수 없습니다.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="planNameId">플랜 이름 *</label>
            <select 
              id="planNameId"
              value={planNameId} 
              onChange={e => setPlanNameId(e.target.value)}
              required
            >
              <option value="">플랜 이름을 선택하세요</option>
              {planNames.map(planName => (
                <option key={planName.planNameId} value={planName.planNameId}>
                {planName.planName}
              </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="planActive">상태</label>
            <select 
              id="planActive"
              value={planActive ? 'true' : 'false'} 
              onChange={e => setPlanActive(e.target.value === 'true')}
            >
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>

        {/* 가격 정보 섹션 (향후 확장 기능) */}
        <div className="form-section">
          <h3>가격 정보 (선택사항)</h3>
          <p className="section-description">
            현재는 참고용으로만 사용되며, 향후 백엔드 확장 시 실제로 저장됩니다.
          </p>
          
          {prices.map((price, index) => (
            <div key={index} className="dynamic-list-item">
              <div className="dynamic-item-fields">
                <div className="form-group">
                  <label>기간(개월)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={price.termMonth} 
                    onChange={e => handlePriceChange(index, 'termMonth', parseInt(e.target.value) || 1)} 
                  />
                </div>
                <div className="form-group">
                  <label>결제 모드</label>
                  <select 
                    value={price.billMode} 
                    onChange={e => handlePriceChange(index, 'billMode', e.target.value)}
                  >
                    <option value="auto">자동 결제</option>
                    <option value="manual">수동 결제</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>가격</label>
                  <input 
                    type="number" 
                    min="0"
                    value={price.amount} 
                    onChange={e => handlePriceChange(index, 'amount', e.target.value)} 
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>통화</label>
                  <select 
                    value={price.currency} 
                    onChange={e => handlePriceChange(index, 'currency', e.target.value)}
                  >
                    <option value="KRW">KRW</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              {prices.length > 1 && (
                <button 
                  type="button" 
                  className="remove-item-btn" 
                  onClick={() => removePrice(index)}
                  title="가격 옵션 삭제"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="add-item-btn" onClick={addPrice}>
            + 가격 옵션 추가
          </button>
        </div>

        {/* 혜택 정보 섹션 (향후 확장 기능) */}
        <div className="form-section">
          <h3>혜택 정보 (선택사항)</h3>
          <p className="section-description">
            현재는 참고용으로만 사용되며, 향후 백엔드 확장 시 실제로 저장됩니다.
          </p>
          
          {benefits.map((benefit, index) => (
            <div key={index} className="dynamic-list-item">
              <div className="dynamic-item-fields">
                <div className="form-group">
                  <label>혜택 설명</label>
                  <textarea 
                    value={benefit.note} 
                    onChange={e => handleBenefitChange(index, 'note', e.target.value)} 
                    placeholder="예: 월 무제한 대여, 배송비 무료 등"
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>월 대여료 상한 (원)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={benefit.priceCap} 
                    onChange={e => handleBenefitChange(index, 'priceCap', e.target.value)} 
                    placeholder="예: 100000"
                  />
                </div>
              </div>
              {benefits.length > 1 && (
                <button 
                  type="button" 
                  className="remove-item-btn" 
                  onClick={() => removeBenefit(index)}
                  title="혜택 삭제"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="add-item-btn" onClick={addBenefit}>
            + 혜택 추가
          </button>
        </div>

        {/* 폼 액션 버튼 */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate('/admin/plans')}
            disabled={loading}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (isEditing ? '수정 중...' : '등록 중...') : (isEditing ? '수정하기' : '등록하기')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlanForm;