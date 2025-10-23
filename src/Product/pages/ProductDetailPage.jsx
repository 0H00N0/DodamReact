import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/ProductApi";
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function ProductDetailPage() {
  const { user } = useAuth(); // user = 로그인 정보
  const { pronum } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();   // ✅ CartContext
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);       // ✅ 더블클릭 방지용
  const [err, setErr] = useState("");
  const styles = {
    linkBtn: {
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "16px",
      marginRight: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      transition: "background 0.2s",
      opacity: adding ? 0.7 : 1,               // ✅ 상태 표시
      pointerEvents: adding ? "none" : "auto",  // ✅ 연속 클릭 차단
    },
    buyBtn: {
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      background: "#059669",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      transition: "background 0.2s",
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await fetchProductById(pronum);
        setProduct(data);
      } catch (e) {
        setErr("상품을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    if (pronum) load();
  }, [pronum]);

  if (loading) {
    return <div className="py-10 text-center text-gray-500">불러오는 중…</div>;
  }
  if (err) {
    return <div className="py-10 text-center text-red-600">{err}</div>;
  }
  if (!product) {
    return <div className="py-10 text-center text-gray-500">상품 정보가 없습니다.</div>;
  }

  // 상품 정보에서 필요한 값 추출
  const {
    proname,
    proprice,
    probrand,
    prodetail,
    prodetailimage,
    status,
    stock,
    createdAt,
    updatedAt,
    catenum
  } = product;

  // 장바구니 버튼 함수 (중복 요청 제거)
  const addCart = async () => {
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login");
      return;
    }
    const ok = window.confirm("장바구니에 담으시겠습니까?");
    if (!ok) return;

    try {
      setAdding(true);
      // ✅ CartContext가 서버 POST(/cart/items) + 재조회까지 모두 수행
      await addToCart(Number(pronum), 1, {}, { catenum }); // extra에 catenum 전달
      window.alert("상품이 장바구니에 담겼습니다.");
    } catch (e) {
      console.error(e);
      window.alert("장바구니 담기 중 오류가 발생했습니다.");
    } finally {
      setAdding(false);
    }
  };

  // 구매하기 버튼 (기존 로직 유지)
  const goToBuyPage = async () => {
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login");
      return;
    }
    const ok = window.confirm("구매하시겠습니까?");
    if (!ok) return;

    try {
      const res = await fetch("http://localhost:8080/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mnum: user.mnum, pronum: Number(pronum) })
      });
      if (!res.ok) throw new Error("대여 등록 실패");
      window.alert("대여신청이 정상적으로 처리되었습니다.");
    } catch (e) {
      window.alert("대여 처리 중 오류가 발생했습니다.");
      console.error(e);
    }
  };

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
          {prodetailimage ? (
            <img
              src={`/images/${prodetailimage}`}
              alt={proname}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-64 grid place-items-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{proname}</h1>
          <div className="text-lg font-semibold">
            {proprice !== undefined && proprice !== null && proprice !== ""
              ? Number(proprice).toLocaleString() + "원"
              : "가격정보 없음"}
          </div>
          <div>
            <span className="inline-block text-xs px-2 py-1 rounded bg-gray-100">{status}</span>
          </div>
          <div className="text-gray-700 whitespace-pre-line">{prodetail}</div>

          {/* 장바구니 버튼 */}
          <button
            style={styles.linkBtn}
            onClick={addCart}
            disabled={adding}
            onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
            onMouseOut={e => e.currentTarget.style.background = "#2563eb"}
          >
            {adding ? "담는 중…" : "장바구니에 담기"}
          </button>

          <button
            style={styles.buyBtn}
            onClick={goToBuyPage}
            onMouseOver={e => e.currentTarget.style.background = "#047857"}
            onMouseOut={e => e.currentTarget.style.background = "#059669"}
          >
            바로 구매하기
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
