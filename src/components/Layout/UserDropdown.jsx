import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom"; // 포털: 헤더 깨짐 방지용
import { useNavigate } from "react-router-dom";
import styles from "./UserDropdown.module.css";


const UserDropdown = ({ isOpen, onClose, userInfo }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  // 세션 기반 로그인 체크
  const isLoggedIn = !!sessionStorage.getItem('sid'); 

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // ---- 라우팅 헬퍼들 ----
  const go = (path) => () => { navigate(path); onClose(); };
  const serverGo = (path) => () => { window.location.href = path; }; // 서버 쪽에서 처리 후 리다이렉트

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dropdownRef}
        className={styles.dropdown}
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoggedIn ? (
          <div className={styles.loginSection}>
            <h3 className={styles.title}>로그인이 필요합니다</h3>
            <p className={styles.subtitle}>로그인하고 다양한 혜택을 만나보세요</p>
            <div className={styles.authButtons}>
              {/* 프론트 라우트로 이동 */}
              <button onClick={go("/login")} className={styles.loginButton}>로그인</button>
              <button onClick={go("/signup")} className={styles.signupButton}>회원가입</button>
            </div>

            <div className={styles.authButtons}>
              <button onClick={go('/loginForm')} className={styles.loginButton}>
                로그인
              </button>
              <button onClick={go('/signup')} className={styles.signupButton}>
                회원가입
              </button>
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

            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={go("/mypage")}>마이페이지</button>
            </div>

            <div className={styles.logoutSection}>
              <button
                onClick={() => { onLogout?.(); onClose(); }} // 코드로 POST /member/logout 호출
                className={styles.logoutButton}
              >
                로그아웃
              </button>
            </div>

            <div className={styles.menuList}>
              <button onClick={go('/member/profile')} className={styles.menuItem}>마이페이지</button>
              <button onClick={go('/member/ordersList')} className={styles.menuItem}>주문내역</button>
              <button onClick={go('/member/cart')} className={styles.menuItem}>장바구니</button>
              <button onClick={go('/member/membership')} className={styles.menuItem}>구독확인</button>
              <button onClick={go('/member/cash')} className={styles.menuItem}>결제수단조회</button>
              <button onClick={go('/member/inquiryList')} className={styles.menuItem}>문의내역</button>
              <button onClick={go('/member/reviewList')} className={styles.menuItem}>리뷰내역</button>
              <button onClick={go('/member/returnList')} className={styles.menuItem}>반품조회</button>
              <button onClick={go('/member/tradeList')} className={styles.menuItem}>교환조회</button>
            </div>

            <div className={styles.logoutSection}>
              {/* 서버 로그아웃 엔드포인트가 /member/auth/logout 이라면 */}
              <button onClick={serverGo('/member/auth/logout')} className={styles.logoutButton}>
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;
