import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';

/**
 * 사용자 관리 메인 컴포넌트
 * 내부 라우팅을 통해 목록, 등록, 수정, 상세 조회 페이지를 관리합니다.
 */
function UserManagement() {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/new" element={<UserForm />} />
      <Route path="/edit/:id" element={<UserForm />} />
      <Route path="/:id" element={<UserDetail />} />
    </Routes>
  );
}

/**
 * 사용자 목록 컴포넌트 (회원 목록 조회)
 */
function UserList() {
  const { getAllMembers, deleteMember, addNotification } = useAdmin(); // deleteMember 추가
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    sortBy: 'mname',
    sortOrder: 'asc'
  });
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllMembers(); // 백엔드 API 호출
      setUsers(data);
    } catch (error) {
      console.error('사용자 로드 실패:', error);
      addNotification('사용자 목록을 불러올 수 없습니다', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAllMembers, addNotification]);

  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 사용자 삭제 (단일 삭제, 목록에서)
  const handleDeleteUser = async (userId) => {
    if (window.confirm(`[ID: ${userId}] 회원을 정말로 삭제하시겠습니까?`)) {
      try {
        await deleteMember(userId); // 백엔드 API 호출
        setUsers(prev => prev.filter(u => u.mnum !== userId));
        addNotification('회원이 삭제되었습니다', 'success');
      } catch (error) {
        addNotification('회원 삭제에 실패했습니다', 'error');
      }
    }
  };

  // 선택된 사용자들 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (window.confirm(`선택된 ${selectedUsers.size}명의 회원을 삭제하시겠습니까?`)) {
      try {
        for (const userId of selectedUsers) {
          await deleteMember(userId); // 개별 삭제 API 호출
        }
        setUsers(prev => prev.filter(u => !selectedUsers.has(u.mnum)));
        setSelectedUsers(new Set());
        addNotification(`${selectedUsers.size}명의 회원이 삭제되었습니다`, 'success');
      } catch (error) {
        addNotification('일괄 삭제에 실패했습니다', 'error');
      }
    }
  };

  // 사용자 선택/해제
  const handleUserSelect = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedUsers.size === users.length && users.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.mnum)));
    }
  };

  // 역할(Role)에 따른 CSS 클래스 반환
  const getRoleClass = (role) => {
    const roleClasses = {
      'ADMIN': 'role-admin',
      'STAFF': 'role-staff',
      'DELIVERYMAN': 'role-delivery',
      'SUPERADMIN': 'role-superadmin',
      'USER': 'role-user'
    };
    return roleClasses[role] || '';
  };

  // 로딩 중 UI
  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>회원 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 필터링 및 정렬된 사용자 목록
  const filteredUsers = users
    .filter(user => {
      const searchLower = filters.search.toLowerCase();
      return (
        user.mname.toLowerCase().includes(searchLower) ||
        user.mid.toLowerCase().includes(searchLower) ||
        (user.memail && user.memail.toLowerCase().includes(searchLower))
      ) && (!filters.role || user.roleName === filters.role);
    })
    .sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
      return multiplier * (a[filters.sortBy] < b[filters.sortBy] ? -1 : 1);
    });

  // 최종 렌더링 UI
  return (
    <div className="product-management">
      <div className="page-header">
        <h1>회원 관리</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/admin/users/new')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
          </svg>
          회원 등록
        </button>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="이름, 아이디, 이메일 검색..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="search-input"
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
        >
          <option value="">모든 역할</option>
          <option value="ADMIN">관리자</option>
          <option value="STAFF">직원</option>
          <option value="DELIVERYMAN">배송기사</option>
          <option value="SUPERADMIN">최고관리자</option>
        </select>
        {selectedUsers.size > 0 && (
          <div className="bulk-actions">
            <span>{selectedUsers.size}명 선택됨</span>
            <button className="btn-danger" onClick={handleBulkDelete}>
              선택 회원 삭제
            </button>
          </div>
        )}
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" onChange={handleSelectAll} checked={selectedUsers.size === users.length && users.length > 0} /></th>
              <th>회원 정보</th>
              <th>역할</th>
              <th>연락처</th>
              <th>가입일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.mnum}>
                <td><input type="checkbox" checked={selectedUsers.has(user.mnum)} onChange={() => handleUserSelect(user.mnum)} /></td>
                <td>
                  <div className="product-info">
                    <div className="product-details">
                      <h3>{user.mname} ({user.mnic || 'N/A'})</h3>
                      <p>{user.mid} | {user.memail}</p>
                    </div>
                  </div>
                </td>
                <td><span className={`role-badge ${getRoleClass(user.roleName)}`}>{user.roleName}</span></td>
                <td>{user.mtel}</td>
                <td>{new Date(user.mreg).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => navigate(`/admin/users/${user.mnum}`)} title="상세 조회">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" fill="currentColor" />
                      </svg>
                    </button>
                    <button className="btn-edit" onClick={() => navigate(`/admin/users/edit/${user.mnum}`)} title="수정">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteUser(user.mnum)} title="삭제">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M6 7v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v6M14 11v6M4 7h16" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 회원 상세 조회 컴포넌트 (회원 정보 상세 조회 + 강제 탈퇴 기능)
 */
function UserDetail() {
  const { getMemberById, deleteMember, addNotification } = useAdmin(); // deleteMember 추가
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const data = await getMemberById(id); // 백엔드 API 호출
        setUser(data);
      } catch (error) {
        console.error('회원 상세 로드 실패:', error);
        addNotification('회원 정보를 불러올 수 없습니다', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id, getMemberById, addNotification]);

  // 강제 탈퇴 함수
  const handleForceDelete = async () => {
    if (window.confirm(`[ID: ${id}] 회원을 정말로 강제 탈퇴시키시겠습니까?`)) {
      try {
        await deleteMember(id); // 백엔드 API 호출
        addNotification('회원이 강제 탈퇴되었습니다', 'success');
        navigate('/admin/users');
      } catch (error) {
        addNotification('강제 탈퇴에 실패했습니다', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>회원 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-404">
        <h2>회원을 찾을 수 없습니다.</h2>
        <p>요청하신 회원 정보가 존재하지 않습니다.</p>
      </div>
    );
  }

  return (
    <div className="user-detail">
      <div className="page-header">
        <h1>회원 상세 정보</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/users')}>
          목록으로 돌아가기
        </button>
      </div>
      <div className="user-info-card">
        <h2>{user.mname} ({user.mnic || 'N/A'})</h2>
        <p><strong>아이디:</strong> {user.mid}</p>
        <p><strong>이메일:</strong> {user.memail || 'N/A'}</p>
        <p><strong>연락처:</strong> {user.mtel}</p>
        <p><strong>주소:</strong> {user.maddr} (우편번호: {user.mpost})</p>
        <p><strong>생일:</strong> {new Date(user.mbirth).toLocaleDateString()}</p>
        <p><strong>가입일:</strong> {new Date(user.mreg).toLocaleDateString()}</p>
        <p><strong>역할:</strong> {user.roleName}</p>
        <p><strong>로그인 방법:</strong> {user.lmtype}</p>
        <p><strong>생성일:</strong> {new Date(user.createdAt).toLocaleString()}</p>
        <p><strong>최종 수정일:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
      </div>
      <div className="actions">
        <button className="btn-edit" onClick={() => navigate(`/admin/users/edit/${id}`)}>
          수정
        </button>
        <button className="btn-danger" onClick={handleForceDelete}>
          강제 탈퇴
        </button>
      </div>
    </div>
  );
}

// 사용자 등록/수정 폼 (임시)
function UserForm() {
  return <div>회원 등록/수정 폼</div>;
}

export default UserManagement;