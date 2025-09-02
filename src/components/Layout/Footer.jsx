import React from 'react';
import styles from './Footer.module.css';

/**
 * 웹사이트 푸터 컴포넌트
 * SEO 최적화와 접근성을 고려한 시맨틱 HTML 구조
 */
const Footer = React.memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* 메인 푸터 콘텐츠 */}
        <div className={styles.footerContent}>
          {/* 회사 정보 */}
          <section className={styles.companyInfo}>
            <h3 className={styles.sectionTitle}>도담도담</h3>
            <p className={styles.description}>
              아이들의 꿈과 상상력을 키우는 안전하고 교육적인 장난감 전문 쇼핑몰입니다.
            </p>
            <address className={styles.address}>
              <p>서울특별시 강남구 테헤란로 123</p>
              <p>
                <strong>고객센터:</strong> 
                <a href="tel:1588-1234" aria-label="고객센터 전화번호">1588-1234</a>
              </p>
              <p>
                <strong>이메일:</strong> 
                <a href="mailto:support@dodamtoyland.co.kr" aria-label="고객지원 이메일">
                  support@dodamtoyland.co.kr
                </a>
              </p>
            </address>
          </section>

          {/* 고객 서비스 */}
          <nav className={styles.footerNav} aria-label="고객 서비스 메뉴">
            <h3 className={styles.sectionTitle}>고객 서비스</h3>
            <ul className={styles.navList}>
              <li><a href="/customer/faq">자주 묻는 질문</a></li>
              <li><a href="/customer/contact">1:1 문의</a></li>
              <li><a href="/customer/shipping">배송 안내</a></li>
              <li><a href="/customer/return">교환/반품</a></li>
              <li><a href="/customer/as">A/S 안내</a></li>
            </ul>
          </nav>

          {/* 쇼핑 가이드 */}
          <nav className={styles.footerNav} aria-label="쇼핑 가이드 메뉴">
            <h3 className={styles.sectionTitle}>쇼핑 가이드</h3>
            <ul className={styles.navList}>
              <li><a href="/guide/order">주문 방법</a></li>
              <li><a href="/guide/payment">결제 안내</a></li>
              <li><a href="/guide/membership">회원 혜택</a></li>
              <li><a href="/guide/points">적립금 안내</a></li>
              <li><a href="/guide/safety">안전성 인증</a></li>
            </ul>
          </nav>

          {/* 회사 정책 */}
          <nav className={styles.footerNav} aria-label="회사 정책 메뉴">
            <h3 className={styles.sectionTitle}>정책 및 약관</h3>
            <ul className={styles.navList}>
              <li><a href="/policy/terms">이용약관</a></li>
              <li><a href="/policy/privacy">개인정보처리방침</a></li>
              <li><a href="/policy/youth">청소년보호정책</a></li>
              <li><a href="/policy/ecommerce">전자상거래 표준약관</a></li>
              <li><a href="/company/about">회사 소개</a></li>
            </ul>
          </nav>

          {/* 소셜 미디어 */}
          <section className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>소셜 미디어</h3>
            <div className={styles.socialLinks}>
              <a 
                href="https://www.instagram.com/dodamtoyland" 
                aria-label="인스타그램 팔로우하기"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>📷</span>
                <span className={styles.socialText}>Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/dodamtoyland" 
                aria-label="페이스북 좋아요 누르기"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>📘</span>
                <span className={styles.socialText}>Facebook</span>
              </a>
              <a 
                href="https://www.youtube.com/@dodamtoyland" 
                aria-label="유튜브 구독하기"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <span className={styles.socialIcon}>🎬</span>
                <span className={styles.socialText}>YouTube</span>
              </a>
            </div>
          </section>
        </div>

        {/* 법적 정보 및 인증마크 */}
        <div className={styles.legalInfo}>
          <div className={styles.businessInfo}>
            <p>
              <strong>주식회사 도담도담</strong> | 
              대표이사: 김도담 | 
              사업자등록번호: 123-45-67890 | 
              통신판매업신고번호: 2024-서울강남-1234
            </p>
            <p>
              개인정보보호책임자: 이도담 | 
              호스팅 서비스: AWS Korea
            </p>
          </div>
          
          {/* 인증마크 */}
          <div className={styles.certifications}>
            <div className={styles.certItem} title="KC 안전인증">
              <span className={styles.certIcon}>🛡️</span>
              <span className={styles.certText}>KC 안전인증</span>
            </div>
            <div className={styles.certItem} title="개인정보보호 우수 웹사이트">
              <span className={styles.certIcon}>🔒</span>
              <span className={styles.certText}>개인정보보호</span>
            </div>
            <div className={styles.certItem} title="소비자보호 우수업체">
              <span className={styles.certIcon}>⭐</span>
              <span className={styles.certText}>소비자보호</span>
            </div>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className={styles.copyright}>
          <p>
            © {currentYear} 도담도담 장난감랜드. All rights reserved. 
            무단 전재 및 재배포 금지.
          </p>
          <p className={styles.disclaimer}>
            상품 이미지는 연출된 것으로 실제와 다를 수 있습니다. 
            구매 전 상품정보를 확인해 주세요.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;