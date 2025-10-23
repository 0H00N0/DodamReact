import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";

export default function ProductCard({ item, onClick }) {
  
  const [imgSrc, setImgSrc] = useState(item?.image ?? null);
  const fallbackUrl = "/default-image.png";

  useEffect(() => {
  if (!item) return;
  if (item.image) { 
    setImgSrc(item.image); 
    return; 
  }
  if (!item.pronum || isNaN(item.pronum)) return; // 👈 pronum 유효성 검증 추가

  let cancelled = false;
  (async () => {
    try {
      const res = await api.get(`/api/products/${item.pronum}/images`, { params: { limit: 1 } });
      const data = res?.data;
      if (cancelled) return;
      if (Array.isArray(data) && data.length > 0) {
        const v = data[0];
          const makeResolvedUrl = (s) => {
            if (!s || typeof s !== "string") return fallbackUrl;
            const trimmed = s.trim();
            if (trimmed.startsWith("data:")) return trimmed;
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
              return `/api/image/proxy?url=${encodeURIComponent(trimmed)}`;
            }
            if (trimmed.startsWith("//")) {
              return `/api/image/proxy?url=${encodeURIComponent("https:" + trimmed)}`;
            }
            if (trimmed.startsWith("/")) return trimmed;
            const encodedPath = trimmed.split("/").map(encodeURIComponent).join("/");
            return `/images/${encodedPath}`;
          };
          const resolvedUrl = makeResolvedUrl(v);
          console.debug("[ProductCard] resolved image", { raw: v, resolvedUrl });
          setImgSrc(resolvedUrl);
        } else {
        setImgSrc(fallbackUrl);
      }
    } catch (err) {
      console.error('[ProductCard] fetch error', item.pronum, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
      if (!cancelled) setImgSrc(fallbackUrl);
    }
  })();

  return () => { cancelled = true; };
}, [item?.pronum, item?.image]);

  if (!item) return null;

  const handleClick = (e) => {
    if (typeof onClick === "function") onClick(item.pronum);
  };

  const handleImgError = (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "true";
    img.src = fallbackUrl;
  };

  const handleImgLoad = (e) => {
    const img = e.currentTarget;
    // 1x1 placeholder 체크
    if (img.naturalWidth === 1 && img.naturalHeight === 1) {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "true";
        img.src = fallbackUrl;
      }
    }
  };

  return (
    <div
      className="ProductCard_productCard__Yis16 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(e); }}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="ProductCard_imageContainer__i8YUo" style={{ pointerEvents: "none" }}>
        {imgSrc ? (
          <img
            className="ProductCard_productImage__OP8JS"
            src={imgSrc}
            alt={item.proname || "product"}
            onError={handleImgError}
            onLoad={handleImgLoad}
            style={{
              display: "block",
              width: "100%",
              height: "200px",
              objectFit: "cover",
              backgroundColor: "transparent"
            }}
          />
        ) : (
          // 로딩/플레이스홀더: 깜빡임 대신 회색 박스 또는 skeleton을 보여줌
          <div style={{
            width: "100%",
            height: "200px",
            background: "#eee"
          }} />
        )}
      </div>

      <div className="ProductCard_productInfo__1bFw3">
        <h3 className="ProductCard_productName__Cd1Wf">{item.proname || item.name || "상품명 없음"}</h3>
        <div className="ProductCard_reviewOnlyRow__7I5hQ">리뷰 0개</div>
        <div className="ProductCard_priceContainer__lv3Ss">
          <span className="ProductCard_price__9+l+D">
            {item.proprice != null ? Number(item.proprice).toLocaleString() + "원" : "가격 미정"}
          </span>
        </div>
      </div>
    </div>
  );
}