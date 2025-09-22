// src/admin/VocManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './contexts/AdminContext';
import './VocManagement.css';
import './VocDetail.css';

// --- 상세 보기 및 답변을 위한 모달 컴포넌트 ---
function VocDetailModal({ vocId, onClose, onUpdate }) {
  const [vocDetail, setVocDetail] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const { getVocById, updateVoc, addNotification } = useAdmin();

  useEffect(() => {
    const fetchVocDetail = async () => {
      if (!vocId) return;
      try {
        setLoading(true);
        console.log(`[EFFECT] vocId: ${vocId} 상세 정보 요청 시작`);
        const data = await getVocById(vocId);
        console.log('[EFFECT] 서버로부터 받은 상세 정보:', data);
        setVocDetail(data);
        setAnswerContent(data.answer || '');
        setStatus(data.status);
      } catch (error) {
        console.error('[EFFECT] 상세 정보 로딩 실패:', error);
        addNotification('VOC 상세 정보를 불러오는 데 실패했습니다.', 'error');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchVocDetail();
  }, [vocId, getVocById, addNotification, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- ⬇️ 디버깅 로그 추가 1 ⬇️ ---
    console.log('--- 답변 저장 시도 ---');
    console.log('VOC ID:', vocId);
    console.log('전송할 답변:', answerContent);
    console.log('전송할 상태:', status);
    
    const updateData = { answerContent, status };
    
    console.log('API로 전송될 최종 데이터 객체:', updateData);
    // --- 디버깅 로그 끝 ---

    try {
      await updateVoc(vocId, updateData);
      addNotification('성공적으로 처리되었습니다.', 'success');
      onUpdate();
      onClose();
    } catch (error) {
      // --- ⬇️ 디버깅 로그 추가 2 ⬇️ ---
      console.error('---!!! 답변 저장 실패 !!!---');
      console.error('발생한 에러 객체:', error);
      // 백엔드에서 보낸 에러 메시지가 있다면 출력
      if (error.response && error.response.data) {
          console.error('백엔드 에러 메시지:', error.response.data);
      }
      // --- 디버깅 로그 끝 ---
      addNotification('업데이트에 실패했습니다.', 'error');
    }
  };

  if (loading || !vocDetail) {
    return (
      <div className="voc-detail-modal-backdrop">
        <div className="voc-detail-modal-content">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="voc-detail-modal-backdrop" onClick={onClose}>
      <div className="voc-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">VOC 상세 정보</h2>
          <button onClick={onClose} className="btn-close-modal">&times;</button>
        </div>
        <div className="detail-section">
          <h3>기본 정보</h3>
          <dl className="detail-info-grid">
            <dt>ID</dt><dd>{vocDetail.vocId}</dd>
            <dt>작성자</dt><dd>{vocDetail.authorName} ({vocDetail.authorEmail})</dd>
            <dt>카테고리</dt><dd>{vocDetail.category}</dd>
            <dt>등록일</dt><dd>{new Date(vocDetail.createdAt).toLocaleString()}</dd>
          </dl>
        </div>
        <div className="detail-section">
          <h3>문의 내용</h3>
          <p className="voc-content-box">{vocDetail.content}</p>
        </div>
        <div className="detail-section">
          <h3>답변 및 처리</h3>
          <form onSubmit={handleSubmit} className="answer-form">
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="답변을 입력하세요..."
            />
            <div className="form-actions">
              <select
                className="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="RECEIVED">접수됨</option>
                <option value="IN_PROGRESS">처리중</option>
                <option value="COMPLETED">답변완료</option>
              </select>
              <button type="submit" className="btn-submit-answer">저장하기</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- VOC 관리 목록 컴포넌트 ---
function VocManagement() {
    const [vocs, setVocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVocId, setSelectedVocId] = useState(null);
  
    const { getAllVocs, addNotification } = useAdmin();
  
    const fetchVocs = useCallback(async () => {
      try {
        setLoading(true);
        const response = await getAllVocs(0, 10);
        setVocs(response.content);
      } catch (err) {
        setError('VOC 목록을 불러오는 데 실패했습니다.');
        addNotification(err.message || '데이터 로딩 실패', 'error');
      } finally {
        setLoading(false);
      }
    }, [getAllVocs, addNotification]);
  
    useEffect(() => {
      fetchVocs();
    }, [fetchVocs]);
  
    const getStatusText = (status) => {
      switch (status) {
        case 'RECEIVED': return '접수됨';
        case 'IN_PROGRESS': return '처리중';
        case 'COMPLETED': return '답변완료';
        default: return status;
      }
    };
  
    const getCategoryText = (category) => {
      switch (category) {
        case 'PRODUCT': return '상품';
        case 'DELIVERY': return '배송';
        case 'ACCOUNT': return '계정';
        case 'SUGGESTION': return '제안';
        case 'ETC': return '기타';
        default: return category;
      }
    };
  
    if (error) return <div className="error-message">{error}</div>;
  
    return (
      <div className="voc-management">
        <h1 className="page-title">VOC 관리</h1>
        
        {loading ? (
          <div className="loading-spinner">로딩 중...</div>
        ) : (
          <div className="voc-list-container">
            <table className="voc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>카테고리</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {vocs.map(voc => (
                  <tr key={voc.vocId}>
                    <td>{voc.vocId}</td>
                    <td>{getCategoryText(voc.category)}</td>
                    <td>{voc.title}</td>
                    <td>{voc.authorName}</td>
                    <td>
                      <span className={`status-badge status-${voc.status.toLowerCase()}`}>
                        {getStatusText(voc.status)}
                      </span>
                    </td>
                    <td>{new Date(voc.createdAt).toLocaleString()}</td>
                    <td>
                      <button className="btn-details" onClick={() => setSelectedVocId(voc.vocId)}>
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
  
        {selectedVocId && (
          <VocDetailModal
            vocId={selectedVocId}
            onClose={() => setSelectedVocId(null)}
            onUpdate={fetchVocs}
          />
        )}
      </div>
    );
  }
  
  export default VocManagement;