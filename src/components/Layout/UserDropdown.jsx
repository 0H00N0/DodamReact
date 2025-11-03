// src/components/Layout/UserDropdown.jsx
import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom"; // 포털: 헤더 깨짐 방지용
import { useNavigate } from "react-router-dom";
import styles from "./UserDropdown.module.css";

const UserDropdown = ({ isOpen, onClose, isLoggedIn = false, userInfo, onLogout }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const go = (path) => () => { navigate(path); onClose(); };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div ref={dropdownRef} className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
        {!isLoggedIn ? (
          <div className={styles.loginSection}>
            <h3 className={styles.title}>로그인이 필요합니다</h3>
            <p className={styles.subtitle}>로그인하고 다양한 혜택을 만나보세요</p>
            <div className={styles.authButtons}>
              {/* 프론트 라우트로 이동 */}
              <button onClick={go("/login")} className={styles.loginButton}>로그인</button>
              <button onClick={go("/signup")} className={styles.signupButton}>회원가입</button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.profileSection}>
              <div className={styles.avatar} aria-hidden="true">👤</div>
              <div className={styles.profileText}>
                <div className={styles.welcome}>안녕하세요!</div>
                <div className={styles.username}>
                  {userInfo?.mname || userInfo?.mid || "회원"} 님
                </div>
              </div>
            </div>

            <div className={styles.menuList}>
              <button onClick={go('/member/profile')} className={styles.menuItem}>마이페이지</button>
              {/* ✅ 주문내역: 새 라우트(/orders)로 변경 */}
              <button onClick={go('/orders')} className={styles.menuItem}>주문내역</button>
              <button onClick={go('/member/cart')} className={styles.menuItem}>장바구니</button>
              <button onClick={go('/member/membership')} className={styles.menuItem}>구독확인</button>
              <button onClick={go('/member/cash')} className={styles.menuItem}>카드등록으로 가기</button>
              <button onClick={go('/member/inquiries')} className={styles.menuItem}>문의 내역</button>
              <button onClick={go('/member/reviewList')} className={styles.menuItem}>리뷰내역</button>
              <button onClick={go('/orders/returns')} className={styles.menuItem}>반품가능 상품조회</button>
              <button onClick={go('/orders/exchanges')} className={styles.menuItem}>교환 및 취소가능 상품조회</button>
              <button onClick={go('/member/delete')} className={styles.menuItem} style={{ color: '#d32f2f' }}>회원 탈퇴</button>
            </div>

            <div className={styles.logoutSection}>
              <button
                onClick={() => { onLogout?.(); onClose(); }} // 코드로 POST /member/logout 호출
                className={styles.logoutButton}
              >
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default UserDropdown;
