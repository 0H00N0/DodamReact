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
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default UserDropdown;
