import React from "react";

export default function ProductCard({ item, onClick }) {
  const { name, price, thumbnailUrl, status, productId } = item;

  return (
    <div
      className="rounded-2xl shadow p-4 hover:shadow-md cursor-pointer flex flex-col gap-3"
      onClick={() => onClick?.(productId)}
    >
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">No Image</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold truncate">{name}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{status}</span>
      </div>

      <div className="text-lg font-bold">{Number(price || 0).toLocaleString()}원</div>
    </div>
  );
}
