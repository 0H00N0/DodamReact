import React from "react";

export default function ProductCard({ item, onClick }) {
  if (!item) return null;

  return (
    <div
      className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition"
      onClick={() => onClick(item)}
    >
      {/* 이미지 */}
      <div className="h-48 bg-gray-100 flex items-center justify-center mb-4 rounded">
        {item.prourl ? (
          <img src={`/images/${item.prourl}`} alt={item.proname} className="max-h-44 object-contain" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      {/* 상품명 */}
      <div className="font-bold text-lg mb-1">{item.proname}</div>
      {/* 가격 */}
      <div className="text-blue-600 font-semibold mb-1">
        {item.proprice ? Number(item.proprice).toLocaleString() + "원" : ""}
      </div>
      {/* 기타 정보 */}
      <div className="text-sm text-gray-500">{item.probrand}</div>
    </div>
  );
}