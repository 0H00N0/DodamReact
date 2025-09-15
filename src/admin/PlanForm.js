import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../admin/contexts/AdminContext'; // 경로는 실제 위치에 맞게 확인해주세요

function PlanForm() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { createPlan, getPlanById, updatePlan } = useAdmin();

  // --- 상태(State) 선언 ---
  const [planCode, setPlanCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [planActive, setPlanActive] = useState(true);
  
  const [prices, setPrices] = useState([{ termMonth: 1, billMode: 'MONTHLY', amount: '', currency: 'KRW' }]);
  const [benefits, setBenefits] = useState([{ note: '', priceCap: '' }]);
  
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(planId);

  // --- 데이터 로딩 (수정 페이지) ---
  useEffect(() => {
    if (isEditing && planId) {
      setLoading(true);
      getPlanById(planId)
        .then(data => {
          setPlanCode(data.planCode);
          setPlanActive(data.planActive);
          setPlanName(data.planName); 
          
          if (data.prices && data.prices.length > 0) {
            const formattedPrices = data.prices.map(p => ({
                termMonth: p.termMonth,
                billMode: p.ppriceBilMode, 
                amount: p.ppriceAmount,
                currency: p.ppriceCurr
            }));
            setPrices(formattedPrices);
          } else {
            setPrices([{ termMonth: 1, billMode: 'MONTHLY', amount: '', currency: 'KRW' }]);
          }

          if (data.benefits && data.benefits.length > 0) {
            const formattedBenefits = data.benefits.map(b => ({
                note: b.pbNote,
                priceCap: b.pbPriceCap
            }));
            setBenefits(formattedBenefits);
          } else {
            setBenefits([{ note: '', priceCap: '' }]);
          }
        })
        .catch(error => { console.error('Failed to load plan data:', error); })
        .finally(() => setLoading(false));
    }
  }, [planId, isEditing, getPlanById]);

  // --- 이벤트 핸들러 ---
  const handlePriceChange = (index, field, value) => {
    const newPrices = [...prices];
    newPrices[index][field] = value;
    setPrices(newPrices);
  };
  
  const addPrice = () => setPrices([...prices, { termMonth: 1, billMode: 'MONTHLY', amount: '', currency: 'KRW' }]);
  const removePrice = index => setPrices(prices.filter((_, i) => i !== index));

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
    if (!planName.trim()) { alert('플랜 이름을 입력해주세요.'); return; }
    if (!isEditing && !planCode.trim()) { alert('플랜 코드를 입력해주세요.'); return; }

    try {
      setLoading(true);
      const requestData = {
        planName: planName.trim(),
        planCode: planCode.trim(),
        planActive: planActive,
        prices: prices.filter(p => p.amount),
        benefits: benefits.filter(b => b.note || b.priceCap)
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

  if (loading) return <div>플랜 정보 로딩 중...</div>;

  // --- JSX 렌더링 ---
  return (
    <div className="plan-form-container">
      <h2>{isEditing ? '플랜 수정' : '새 플랜 등록'}</h2>
      <form onSubmit={handleSubmit}>
        {/* =================== ▼ 누락되었던 부분 시작 ▼ =================== */}
        {/* 기본 정보 */}
        <div className="form-section">
          <h3>기본 정보</h3>
          <div className="form-group">
            <label htmlFor="planCode">플랜 코드 *</label>
            <input 
              id="planCode"
              type="text" 
              value={planCode} 
              onChange={e => setPlanCode(e.target.value)} 
              disabled={isEditing}
              placeholder="예: BASIC_PLAN_001"
              required 
            />
            {isEditing && <small className="form-help">플랜 코드는 수정할 수 없습니다.</small>}
          </div>
          <div className="form-group">
            <label htmlFor="planName">플랜 이름 *</label>
            <input 
              id="planName"
              type="text"
              value={planName} 
              onChange={e => setPlanName(e.target.value)}
              placeholder="예: 베이직 플랜"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="planActive">상태</label>
            <select 
              id="planActive"
              value={planActive} 
              onChange={e => setPlanActive(e.target.value === 'true')}
            >
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="form-section">
          <h3>가격 정보</h3>
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
                    <option value="MONTHLY">월 정기결제</option>
                    <option value="PREPAID_TERM">기간 선결제</option>
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
                  </select>
                </div>
              </div>
              {prices.length > 1 && (
                <button type="button" className="remove-item-btn" onClick={() => removePrice(index)}>×</button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={addPrice}>+ 가격 옵션 추가</button>
        </div>
        {/* =================== ▲ 누락되었던 부분 끝 ▲ =================== */}

        {/* 혜택 정보 */}
        <div className="form-section">
          <h3>혜택 정보</h3>
          {benefits.map((benefit, index) => (
            <div key={index} className="dynamic-list-item">
              <div className="dynamic-item-fields">
                <div className="form-group">
                  <label>혜택 설명</label>
                  <textarea 
                    value={benefit.note || ''}
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
                    value={benefit.priceCap || ''}
                    onChange={e => handleBenefitChange(index, 'priceCap', e.target.value)} 
                    placeholder="예: 100000"
                  />
                </div>
              </div>
              {benefits.length > 1 && (
                <button type="button" className="remove-item-btn" onClick={() => removeBenefit(index)}>×</button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={addBenefit}>+ 혜택 추가</button>
        </div>

        {/* 폼 액션 버튼 */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/plans')}>취소</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '저장 중...' : (isEditing ? '수정하기' : '등록하기')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlanForm;