import React from "react";

export default function ProductCard({ item, onClick }) {
  if (!item) return null;

  const handleClick = () => {
    if (typeof onClick === "function") onClick(item.pronum);
  };

  const rawImg = item.prourl || item.image || "";
  const imageSrc = rawImg
    ? (rawImg.startsWith("http") ? rawImg : `http://localhost:8080${rawImg.startsWith("/") ? "" : "/images/"}${rawImg}`)
    : "/default-image.png";

  return (
    <div
      className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition"
      onClick={handleClick}
    >
      {/* 이미지 */}
      <div className="h-48 bg-gray-100 flex items-center justify-center mb-4 rounded">
        <img
          src={imageSrc}
          alt={item.proname || "product"}
          className="max-h-44 object-contain"
          onError={(e) => { e.currentTarget.src = "/default-image.png"; }}
        />
      </div>
      {/* 상품명 */}
      <div className="font-bold text-lg mb-1">{item.proname || item.name || "상품명 없음"}</div>
      {/* 가격 */}
      <div className="text-blue-600 font-semibold mb-1">
        {item.proprice ? Number(item.proprice).toLocaleString() + "원" : "가격 미정"}
      </div>
      {/* 기타 정보 */}
      <div className="text-sm text-gray-500">{item.probrand}</div>
    </div>
  );
}