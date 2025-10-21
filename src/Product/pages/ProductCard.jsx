import React, { useState, useEffect } from "react";

export default function ProductCard({ item, onClick }) {
  if (!item) return null;

  // 클릭 디버그용 로그
  const handleClick = (e) => {
    console.log("ProductCard clicked:", item?.pronum);
    if (typeof onClick === "function") onClick(item.pronum);
  };

  const [imgSrc, setImgSrc] = useState(item.image || "/default-image.png");
  const fallbackUrl = "/default-image.png";

  useEffect(() => {
    // 이미 image가 있으면 fetch 불필요
    if (item.image) {
      setImgSrc(item.image);
      return;
    }
    if (!item.pronum) return;

    let cancelled = false;
    fetch(`http://localhost:8080/products/${item.pronum}/images?limit=1`)
      .then(res => {
        if (!res.ok) return Promise.reject(res);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const v = data[0];
          const url = v.startsWith("http") ? v : `http://localhost:8080/images/${v}`;
          setImgSrc(url);
        } else {
          setImgSrc(fallbackUrl);
        }
      })
      .catch(() => {
        if (!cancelled) setImgSrc(fallbackUrl);
      });

    return () => { cancelled = true; };
  }, [item.pronum, item.image]);

  const handleImgError = (e) => {
    if (!e.currentTarget.dataset.fallback) {
      e.currentTarget.dataset.fallback = "true";
      e.currentTarget.src = fallbackUrl;
    }
  };

  return (
    <div
      className="ProductCard_productCard__Yis16 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(e); }}
      style={{ WebkitTapHighlightColor: "transparent" }} // 모바일 클릭 invisible layer 방지
    >
      <div className="ProductCard_imageContainer__i8YUo" style={{ pointerEvents: "none" }}>
        <img
          className="ProductCard_productImage__OP8JS"
          src={imgSrc}
          alt={item.proname || "product"}
          onError={handleImgError}
          style={{ pointerEvents: "auto" }}
        />
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