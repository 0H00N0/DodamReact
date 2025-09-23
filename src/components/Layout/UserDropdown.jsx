// src/components/Member/UserDropdown.jsx (경로만 네 프로젝트에 맞게)
import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";              // 포털: 헤더 깨짐 방지용
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

<<<<<<< HEAD
  const handleWishlist = () => {
    navigate('/wishlist');
    onClose();
  };

  const handleCart = () => {
    navigate('/cart');
    onClose();
  };

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleSignup = () => {
    navigate('/signup');
    onClose();
  };

  const handleMenuClick = (menuName) => {
    alert(`${menuName} 기능은 준비 중입니다!`);
    onClose();
  };

  const handleLogout = () => {
    alert('로그아웃되었습니다!');
    // 실제 구현에서는 로그아웃 로직 추가
    onClose();
  };
=======
  const go = (path) => () => { navigate(path); onClose(); };
>>>>>>> board

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div ref={dropdownRef} className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
        {!isLoggedIn ? (
          <div className={styles.loginSection}>
            <h3 className={styles.title}>로그인이 필요합니다</h3>
            <p className={styles.subtitle}>로그인하고 다양한 혜택을 만나보세요</p>
            <div className={styles.authButtons}>
              {/*App.js 라우트와 정확히 일치 */}
              <button onClick={go("/loginForm")} className={styles.loginButton}>로그인</button>
              <button onClick={go("/signup")} className={styles.signupButton}>회원가입</button>
            </div>
          </div>
        ) : (
          <>
            {/* ...로그인 후 메뉴들 */}
            <div className={styles.logoutSection}>
              <button onClick={onLogout} className={styles.logoutButton}>로그아웃</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default UserDropdown;
