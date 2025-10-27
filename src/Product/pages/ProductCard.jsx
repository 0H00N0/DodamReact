// src/Product/pages/ProductCard.jsx
import React, { useMemo } from "react";
import { normalizeImage, onImgError } from "../../utils/image";
import styles from "./ProductCard.module.css";

export default function ProductCard({ item, onClick }) {
  // 이미지 소스 결정 (항상 훅은 무조건 호출)
  const imgSrc = useMemo(() => {
    const cand = [
      item?.image,
      item?.thumbnailUrl,
      item?.imageUrl,
      item?.proimg,
      item?.prodetailimage,
      item?.firstImageUrl,
    ].find(Boolean);

    const resolved = normalizeImage(cand);
    // 디버깅 로그(원하면 주석 처리)
    // console.log("[ProductCard] image check", { pronum: item?.pronum, raw: cand, resolved });
    return resolved;
  }, [item]);

  const name = item?.proname ?? item?.name ?? "상품명 없음";
  const price = item?.proprice ?? item?.price;
  const id = item?.pronum ?? item?.proId ?? item?.id ?? item?.proid;

  const handleClick = () => {
    if (typeof onClick === "function" && id != null) onClick(id);
  };

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className={styles.imageBox}>
        <img
          className={styles.image}
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={onImgError}
        />
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{name}</h3>
        <div className={styles.metaRow}>리뷰 0개</div>
        <div className={styles.priceRow}>
          <span className={styles.priceText}>
            {price != null ? Number(price).toLocaleString() + "원" : "가격 미정"}

          </span>
        </div>
      </div>
    </div>
  );
}
