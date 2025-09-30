// src/components/Home/HeroSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HeroSection.module.css";
import {
  fetchNewProducts,
  fetchPopularProducts,
  fetchProductImages,
} from "../MainProductApi";

// 이미지가 전혀 없을 때 쓸 플레이스홀더
const PLACEHOLDER_IMG = "https://dummyimage.com/480x360/eeeeee/999999&text=No+Image";

// (고정) 커뮤니티/공지 이미지
const COMMUNITY_IMAGES = [
  "https://private-cyan-i5ea7ssejx.edgeone.app/%EC%97%AC%EC%9E%90%EC%95%84%EC%9D%B4.jpg",
];
const NOTICE_IMAGES = [
  "https://dodamdodam.edgeone.app/%EC%95%8C%EB%A0%A4%20%EB%93%9C%EB%A6%BD%EB%8B%88%EB%8B%A4%EC%99%80%20%EC%9E%A5%EB%82%9C%EA%B0%90%EB%93%A4.png",
];

const USE_DETAIL_IMAGES = true;

export default function HeroSection() {
  const navigate = useNavigate();

  const [newest, setNewest] = useState(null);
  const [topRented, setTopRented] = useState(null);

  // 상세 이미지 리스트
  const [newestImages, setNewestImages] = useState([]);
  const [topRentedImages, setTopRentedImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 카드 비율 자동 맞춤(이미지 naturalWidth/Height 기반)
  const [cardRatioById, setCardRatioById] = useState({});
  const setAutoRatio = (slideId) => (e) => {
    const w = e?.target?.naturalWidth || 4;
    const h = e?.target?.naturalHeight || 3;
    setCardRatioById((prev) => ({ ...prev, [slideId]: `${w} / ${h}` }));
  };

  // ✅ 숫자 ID만 리턴 (0, null, undefined, 빈문자 → undefined)
  const getProductId = (p) => {
    const cand =
      p?.pronum ??
      p?.proId ??
      p?.proid ??
      p?.id ??
      p?.productId ??
      p?.pid ??
      p?.code ??
      p?.productCode;
    const n =
      typeof cand === "string"
        ? parseInt(cand, 10)
        : typeof cand === "number"
        ? cand
        : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  // 최초: 최신/인기 1개씩 가져오기
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [nRes, pRes] = await Promise.all([
          fetchNewProducts(1),
          fetchPopularProducts(1),
        ]);

        if (!mounted) return;

        const newestList = Array.isArray(nRes?.data) ? nRes.data : [];
        const popularList = Array.isArray(pRes?.data) ? pRes.data : [];

        setNewest(newestList[0] || null);
        setTopRented(popularList[0] || null);
      } catch (e) {
        console.warn("[Hero] fetch product error:", e);
        if (mounted) {
          setNewest(null);
          setTopRented(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- 최신 상품 이미지 ---
  useEffect(() => {
    let mounted = true;
    if (!USE_DETAIL_IMAGES) {
      setNewestImages([]);
      return () => {
        mounted = false;
      };
    }

    const id = getProductId(newest);
    if (!id) {
      setNewestImages([]);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      const urls = await fetchProductImages(id, 4); // 실패해도 [] 반환
      if (mounted) setNewestImages(Array.isArray(urls) ? urls : []);
    })();

    return () => {
      mounted = false;
    };
  }, [newest]);

  // --- 인기 상품 이미지 ---
  useEffect(() => {
    let mounted = true;
    if (!USE_DETAIL_IMAGES) {
      setTopRentedImages([]);
      return () => {
        mounted = false;
      };
    }

    const id = getProductId(topRented);
    if (!id) {
      setTopRentedImages([]);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      const urls = await fetchProductImages(id, 4);
      if (mounted) setTopRentedImages(Array.isArray(urls) ? urls : []);
    })();

    return () => {
      mounted = false;
    };
  }, [topRented]);

  // 안전 접근 유틸
  const pick = (obj, keys, fallback = "") =>
    (obj &&
      keys.reduce(
        (acc, k) => (acc !== undefined && acc !== null ? acc : obj[k]),
        undefined
      )) ?? fallback;

  // 상품 슬라이드 생성: 항상 사진만 사용(기본 contain)
  const productToSlide = (product, opts) => {
    if (!product) return null;

    const id =
      pick(product, ["pronum", "proId", "proid", "id", "productId", "pid"]) ||
      pick(product, ["code", "productCode"]);
    const name = pick(
      product,
      ["name", "productName", "title", "proname"],
      "상품"
    );
    const repImage =
      pick(product, ["imageUrl", "mainImage", "thumbnailUrl", "img", "proimg"]) ||
      null;

    return {
      id: opts.id,
      type: "product",
      title: opts.titlePrefix ? `${opts.titlePrefix} ${name}` : name,
      subtitle: opts.subtitle ?? "",
      description: opts.description ?? "",
      bgGradient: opts.bgGradient,
      imageUrls:
        (opts.imageUrls && opts.imageUrls.length && opts.imageUrls) ||
        (repImage ? [repImage] : [PLACEHOLDER_IMG]),
      productId: id,
      primaryText: "상품 상세 정보",
      // 상세 경로: /product/:id
      onPrimary: () => navigate(id ? `/product/${id}` : "/products"),
      imageFit: opts.imageFit ?? "contain",
      aspectRatio: opts.aspectRatio,
      imagePosition: opts.imagePosition,
    };
  };

  // 커뮤니티 / 공지 슬라이드
  const communitySlide = {
    id: "community",
    type: "link",
    title: "도담 커뮤니티",
    subtitle: "우리 아이 장난감 사용팁, 인증샷, 리뷰를 공유해요",
    description: "다른 가족들의 실제 후기와 팁을 확인해 보세요.",
    bgGradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    imageUrls: COMMUNITY_IMAGES.filter(Boolean),
    imageFit: "contain",
    aspectRatio: "1 / 1",
    imagePosition: "center center",
    icons: ["💬"],
    primaryText: "커뮤니티 바로가기",
    onPrimary: () => navigate("/board/community"),
  };

  const noticeSlide = {
    id: "notice",
    type: "link",
    title: "공지사항",
    subtitle: "서비스 업데이트, 이벤트, 점검 일정을 안내합니다",
    description: "가장 빠른 새 소식을 확인하세요.",
    bgGradient: "linear-gradient(135deg, #ffd3a5 0%, #fd6585 100%)",
    imageUrls: NOTICE_IMAGES.filter(Boolean),
    imageFit: "contain",
    aspectRatio: "1 / 1",
    imagePosition: "center center",
    icons: ["📢"],
    primaryText: "공지사항 바로가기",
    onPrimary: () => navigate("/board/notice"),
  };

  // 동적 상품 2 + 고정 2
  const slides = useMemo(() => {
    const results = [];

    const newestSlide =
      productToSlide(newest, {
        id: "newest",
        titlePrefix: "신규 등록:",
        subtitle: "방금 올라온 따끈따끈 신상",
        description: "아이 취향을 즉시 캐치해 보세요.",
        bgGradient: "linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)",
        imageUrls: newestImages,
      }) ||
      {
        id: "newest-fallback",
        type: "product",
        title: "신규 등록 상품",
        subtitle: "방금 올라온 상품을 확인해 보세요",
        description: "데이터를 불러오는 중입니다…",
        bgGradient: "linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)",
        imageUrls: [PLACEHOLDER_IMG],
        primaryText: "상품 상세 정보",
        onPrimary: () => navigate("/products"),
      };

    const topRentedSlide =
      productToSlide(topRented, {
        id: "top",
        titlePrefix: "대여 인기:",
        subtitle: "가장 많이 대여된 베스트셀러",
        description: "검증된 만족도, 실패 없는 선택!",
        bgGradient: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
        imageUrls: topRentedImages,
      }) ||
      {
        id: "top-fallback",
        type: "product",
        title: "베스트셀러",
        subtitle: "가장 많이 대여된 상품을 만나보세요",
        description: "데이터를 불러오는 중입니다…",
        bgGradient: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
        imageUrls: [PLACEHOLDER_IMG],
        primaryText: "상품 상세 정보",
        onPrimary: () => navigate("/products"),
      };

    results.push(newestSlide, topRentedSlide, communitySlide, noticeSlide);
    return results;
  }, [newest, topRented, newestImages, topRentedImages, navigate]);

  // 자동 슬라이드
  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  const current = slides[currentSlide] || {};

  return (
    <section className={styles.hero}>
      <div
        className={styles.slideBackground}
        style={{ background: current.bgGradient }}
      />

      <div className={styles.container}>
        <div className={styles.content}>
          {/* 텍스트 */}
          <div className={styles.textContent}>
            <div className={styles.slideIndicator}>
              <span className={styles.dreamLabel}>
                {currentSlide + 1} / {slides.length}
              </span>
            </div>

            <h1 className={styles.title}>{current.title}</h1>
            {current.subtitle && (
              <p className={styles.subtitle}>{current.subtitle}</p>
            )}
            {current.description && (
              <p className={styles.description}>{current.description}</p>
            )}
          </div>

          {/* 이미지 */}
          <div className={styles.imageContent}>
            {current.type === "product" ? (
              (current.imageUrls?.length ?? 0) >= 2 ? (
                // 2장 이상 → 2×2 그리드
                <div
                  className={styles.dreamCard}
                  style={{ "--card-h": current.cardHeight || undefined }}
                >
                  <div className={styles.iconGrid}>
                    {current.imageUrls.slice(0, 4).map((url, i) => (
                      <div
                        key={i}
                        className={`${styles.iconBlock} ${styles[`icon${i + 1}`]}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <img
                          src={url || PLACEHOLDER_IMG}
                          alt={`${current.title} #${i + 1}`}
                          className={
                            current.imageFit === "contain"
                              ? styles.productThumbContain
                              : styles.productThumb
                          }
                          style={{
                            objectPosition: current.imagePosition || "center",
                          }}
                          onLoad={i === 0 ? setAutoRatio(current.id) : undefined}
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.dreamGlow} />
                </div>
              ) : (
                // 1장 → 단일 큰 이미지
                <div
                  className={styles.dreamCard}
                  style={{
                    "--card-ratio":
                      cardRatioById[current.id] || current.aspectRatio || "4 / 3",
                  }}
                >
                  <img
                    src={current.imageUrls?.[0] || PLACEHOLDER_IMG}
                    alt={current.title}
                    className={
                      current.imageFit === "contain"
                        ? styles.productImageContain
                        : styles.productImage
                    }
                    style={{ objectPosition: current.imagePosition || "center" }}
                    onLoad={setAutoRatio(current.id)}
                  />
                  <div className={styles.dreamGlow} />
                </div>
              )
            ) : (current.imageUrls?.length ?? 0) >= 2 ? (
              <div
                className={styles.dreamCard}
                style={{
                  "--card-ratio":
                    cardRatioById[current.id] || current.aspectRatio || "4 / 3",
                }}
              >
                <div className={styles.iconGrid}>
                  {current.imageUrls.slice(0, 4).map((url, i) => (
                    <div
                      key={i}
                      className={`${styles.iconBlock} ${styles[`icon${i + 1}`]}`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <img
                        src={url || PLACEHOLDER_IMG}
                        alt={`${current.title} #${i + 1}`}
                        className={
                          current.imageFit === "contain"
                            ? styles.productThumbContain
                            : styles.productThumb
                        }
                        style={{
                          objectPosition: current.imagePosition || "center",
                        }}
                        onLoad={i === 0 ? setAutoRatio(current.id) : undefined}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.dreamGlow} />
              </div>
            ) : (current.imageUrls?.length ?? 0) === 1 ? (
              <div
                className={styles.dreamCard}
                style={{
                  "--card-ratio":
                    cardRatioById[current.id] || current.aspectRatio || "4 / 3",
                }}
              >
                <img
                  src={current.imageUrls[0] || PLACEHOLDER_IMG}
                  alt={current.title}
                  className={
                    current.imageFit === "contain"
                      ? styles.productImageContain
                      : styles.productImage
                  }
                  style={{ objectPosition: current.imagePosition || "center" }}
                  onLoad={setAutoRatio(current.id)}
                />
                <div className={styles.dreamGlow} />
              </div>
            ) : (
              // 이미지 없으면 아이콘 fallback
              <div className={styles.dreamCard}>
                <div className={styles.iconSolo}>
                  <div className={styles.iconCircle}>
                    <span className={styles.bigIcon}>
                      {(current.icons && current.icons[0]) || "📢"}
                    </span>
                  </div>
                </div>
                <div className={styles.dreamGlow} />
              </div>
            )}
          </div>

          {/* ✅ 버튼을 별도의 행으로 분리: 모바일에서 이미지 아래로 자동 배치됨 */}
          <div className={styles.ctaRow}>
            {current.onPrimary && (
              <button className={styles.primaryButton} onClick={current.onPrimary}>
                {current.primaryText || "바로가기"}
              </button>
            )}
            {current.onSecondary && (
              <button
                className={styles.secondaryButton}
                onClick={current.onSecondary}
              >
                {current.secondaryText || "자세히 보기"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className={styles.slideNavigation}>
        <button className={styles.navButton} onClick={prevSlide} aria-label="이전 슬라이드">
          ←
        </button>
        <div className={styles.dotNavigation}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentSlide ? styles.activeDot : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`${i + 1}번 슬라이드로 이동`}
            />
          ))}
        </div>
        <button className={styles.navButton} onClick={nextSlide} aria-label="다음 슬라이드">
          →
        </button>
      </div>
    </section>
  );
}
