// src/admin/VocManagement.js
import React from 'react';
import './VocManagement.css';

function VocManagement() {
  // Placeholder data - will be replaced with API data
  const vocs = [
    { id: 1, title: '상품 배송 문의', author: '김고객', status: 'RECEIVED', createdAt: '2025-09-15' },
    { id: 2, title: '결제 오류 관련', author: '박회원', status: 'IN_PROGRESS', createdAt: '2025-09-14' },
    { id: 3, title: '사이트 개선 제안', author: '이사용', status: 'COMPLETED', createdAt: '2025-09-13' },
  ];

  return (
    <div className="voc-management">
      <h1 className="page-title">VOC 관리</h1>
      
      <div className="voc-list-container">
        <table className="voc-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>작성자</th>
              <th>상태</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {vocs.map(voc => (
              <tr key={voc.id}>
                <td>{voc.id}</td>
                <td>{voc.title}</td>
                <td>{voc.author}</td>
                <td>
                  <span className={`status-badge status-${voc.status.toLowerCase()}`}>{voc.status}</span>
                </td>
                <td>{voc.createdAt}</td>
                <td>
                  <button className="btn-details">상세보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VocManagement;
