import React, { useState, useEffect } from "react";

export default function ProductCard({ item, onClick }) {
  
  const [imgSrc, setImgSrc] = useState(item?.image || "/default-image.png");
  const fallbackUrl = "/default-image.png";

  useEffect(() => {
    console.log('[ProductCard effect start]', item?.pronum, 'initial imgSrc=', imgSrc);
    if (!item) return;
    
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

          // 방어 로직: data: 가 포함된 경우 data URI를 추출/직접 사용
          let resolvedUrl;
          if (typeof v === "string" && v.includes("data:")) {
            // v 가 "data:..." 이거나 "http://.../images/data:..." 같이 섞여있을 수 있으므로 data: 인덱스부터 사용
            const idx = v.indexOf("data:");
            resolvedUrl = v.substring(idx);
          } else if (typeof v === "string" && v.startsWith("http")) {
            resolvedUrl = `http://localhost:8080/api/image/proxy?url=${encodeURIComponent(v)}`;
          } else if (typeof v === "string" && v.length > 0) {
            resolvedUrl = `http://localhost:8080/images/${v}`;
          } else {
            resolvedUrl = fallbackUrl;
          }

          console.log("[ProductCard] resolved image url:", resolvedUrl);
          setImgSrc(resolvedUrl);
        } else {
          setImgSrc(fallbackUrl);
        }
      })
       .catch(err => {
      console.error('[ProductCard] fetch error', item.pronum, err);
      if (!cancelled) setImgSrc(fallbackUrl);
    });

    return () => { cancelled = true; };
  }, [item?.pronum, item?.image]);

  // item 없을 때는 UI를 렌더하지 않음
  if (!item) return null;

  // 클릭 디버그용 로그
  const handleClick = (e) => {
    console.log("ProductCard clicked:", item?.pronum);
    if (typeof onClick === "function") onClick(item.pronum);
  };

  const handleImgError = (e) => {
    const img = e.currentTarget;
    console.error("image load error (onError):", img.src);

    //(무한루프 방지)
    if (img.dataset.fallback) return;

    if (img.naturalWidth && img.naturalWidth > 0) {
      console.warn("onError fired but image already has natural size, ignoring:", img.src);
      return;
    }
    img.dataset.fallback = "true";
    img.src = fallbackUrl;
  };

  const handleImgLoad = (e) => {
    console.log("image loaded:", e.currentTarget.src,
                "natural:", e.currentTarget.naturalWidth, "x", e.currentTarget.naturalHeight,
                "client:", e.currentTarget.clientWidth, "x", e.currentTarget.clientHeight);
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
        <img
          className="ProductCard_productImage__OP8JS"
          src={imgSrc}
          alt={item.proname || "product"}
          onError={handleImgError}
          onLoad={handleImgLoad}
          style={{
            pointerEvents: "auto",
            width: "100%",           
            height: "200px",         
            objectFit: "contain",    // 깨짐 없이 맞춤
            backgroundColor: "#eee",
            border: "2px dashed red" 
          }}
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
