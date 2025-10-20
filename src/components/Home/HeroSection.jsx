// src/components/Home/HeroSection.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HeroSection.module.css";
import {
  fetchNewProducts,
  fetchPopularProducts,
  fetchProductImages,
} from "../MainProductApi";

const PLACEHOLDER_IMG =
  "https://dummyimage.com/480x360/eeeeee/999999&text=No+Image";

const COMMUNITY_IMAGES = [
  "https://private-cyan-i5ea7ssejx.edgeone.app/%EC%97%AC%EC%9E%90%EC%95%84%EC%9D%B4.jpg",
];
const NOTICE_IMAGES = [
  "https://dodamdodam.edgeone.app/%EC%95%8C%EB%A0%A4%20%EB%93%9C%EB%A6%BD%EB%8B%88%EB%8B%A4%EC%99%80%20%EC%9E%A5%EB%82%9C%EA%B0%90%EB%93%A4.png",
];

const USE_DETAIL_IMAGES = true;
const AUTO_MS = 7000;

export default function HeroSection() {
  const navigate = useNavigate();

  const [newest, setNewest] = useState(null);
  const [topRented, setTopRented] = useState(null);

  const [newestImages, setNewestImages] = useState([]);
  const [topRentedImages, setTopRentedImages] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);

  // 자동 슬라이드 타이머
  const timerRef = useRef(null);
  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesLenRef.current);
    }, AUTO_MS);
  };
  useEffect(() => () => timerRef.current && clearInterval(timerRef.current), []);

  // 동적 카드 높이 계산을 위한 비율(필요 시)
  const [cardRatioById, setCardRatioById] = useState({});
  const setAutoRatio = (slideId) => (e) => {
    const w = e?.target?.naturalWidth || 4;
    const h = e?.target?.naturalHeight || 3;
    setCardRatioById((p) => ({ ...p, [slideId]: `${w} / ${h}` }));
  };

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
      } catch {
        setNewest(null);
        setTopRented(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
      const urls = await fetchProductImages(id, 4);
      if (mounted) setNewestImages(Array.isArray(urls) ? urls : []);
    })();
    return () => {
      mounted = false;
    };
  }, [newest]);

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

  const pick = (obj, keys, fallback = "") =>
    (obj &&
      keys.reduce(
        (acc, k) => (acc !== undefined && acc !== null ? acc : obj[k]),
        undefined
      )) ?? fallback;

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
      onPrimary: () => navigate(id ? `/products/${id}` : "/products"),
      imageFit: opts.imageFit ?? "contain",
      aspectRatio: opts.aspectRatio,
      imagePosition: opts.imagePosition,
    };
  };

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

  // 자동 슬라이드 시작/재시작
  const slidesLenRef = useRef(slides.length);
  useEffect(() => {
    slidesLenRef.current = slides.length;
    restartTimer();
  }, [slides.length, currentSlide]);

  const go = (idx) => {
    setCurrentSlide(idx);
    restartTimer(); // ➜ 화살표/점 클릭 시 7초 타이머 리셋
  };
  const prevSlide = () =>
    go((currentSlide - 1 + slides.length) % slides.length);
  const nextSlide = () => go((currentSlide + 1) % slides.length);

  const current = slides[currentSlide] || {};

  return (
    <section className={styles.hero}>
      <div
        className={styles.slideBackground}
        style={{ background: current.bgGradient }}
      />

      <div className={styles.container}>
        <div className={styles.content}>
          {/* 왼쪽: 텍스트(상단 = 제목, 하단 = 버튼) */}
          <div className={styles.textContent}>
            <div className={styles.textTop}>
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

          {/* 오른쪽: 이미지 카드(텍스트 칼럼과 동일 높이) */}
          <div className={styles.imageContent}>
            <div
              className={styles.dreamCard}
              style={{
                "--card-ratio":
                  cardRatioById[current.id] || current.aspectRatio || "4 / 3",
              }}
            >
              {Array.isArray(current.imageUrls) && current.imageUrls.length > 1 ? (
                <div className={styles.iconGrid}>
                  {current.imageUrls.slice(0, 4).map((url, i) => (
                    <div key={i} className={styles.iconBlock}>
                      <img
                        src={url || PLACEHOLDER_IMG}
                        alt={`${current.title} #${i + 1}`}
                        className={styles.productThumb}
                        onLoad={i === 0 ? setAutoRatio(current.id) : undefined}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <img
                  src={current.imageUrls?.[0] || PLACEHOLDER_IMG}
                  alt={current.title}
                  className={styles.productImage}
                  onLoad={setAutoRatio(current.id)}
                />
              )}
              <div className={styles.dreamGlow} />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 — 버튼과 겹치지 않게 중앙 하단 고정 */}
      <div className={styles.slideNavigation}>
        <button className={styles.navButton} onClick={prevSlide} aria-label="이전">
          ←
        </button>
        <div className={styles.dotNavigation}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentSlide ? styles.activeDot : ""}`}
              onClick={() => go(i)}
              aria-label={`${i + 1}번 슬라이드로 이동`}
            />
          ))}
        </div>
        <button className={styles.navButton} onClick={nextSlide} aria-label="다음">
          →
        </button>
      </div>
    </section>
  );
}
