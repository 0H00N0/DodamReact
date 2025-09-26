import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/ProductApi";

export default function ProductDetailPage() {
  const { pronum } = useParams();          // /products/:id
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchProductById(pronum); // id → pronum
      setProduct(data);
    } catch (e) {
      console.error(e);
      setErr("상품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  load();
}, [pronum]);

  if (loading) return <div className="py-10 text-center text-gray-500">불러오는 중…</div>;
  if (err) return <div className="py-10 text-center text-red-600">{err}</div>;
  if (!product) return null;

  const { name, price, description, status, stock, thumbnailUrl, createdAt, updatedAt } = product;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded border bg-gray-50 hover:bg-gray-100"
      >
        ← 뒤로가기
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-64 grid place-items-center text-gray-400">No Image</div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{name}</h1>
          <div className="text-lg font-semibold">
            {Number(price || 0).toLocaleString()}원
          </div>
          <div>
            <span className="inline-block text-xs px-2 py-1 rounded bg-gray-100">{status}</span>
            <span className="ml-2 text-sm text-gray-500">재고: {stock}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-line">{description}</p>
          
           {/* 장바구니 버튼 추가 */}
        <button
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          // onClick={() => { /* 추후 장바구니 기능 구현 */ }}
        >
          장바구니에 담기
        </button>
        
          <div className="text-xs text-gray-400">
            <p>등록일: {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}</p>
            <p>수정일: {updatedAt ? new Date(updatedAt).toLocaleDateString() : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
