import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/ProductApi";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";

// 🔹 리뷰 탭 분리 (커서 튐 방지)
function ReviewTabs({
  tab,
  setTab,
  newReview,
  setNewReview,
  editingReview,
  setEditingReview,
  reviews,
  handleSubmitReview,
  handleUpdateReview,
  startEdit,
  handleDeleteReview,
  user,
}) {
  // 🔸 커서 튐 방지 핵심 — 부분 업데이트만 수행
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingReview) {
      setEditingReview((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewReview((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="mt-10">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${tab === "write" ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
          onClick={() => setTab("write")}
        >
          리뷰 작성
        </button>
        <button
          className={`px-4 py-2 ${tab === "view" ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
          onClick={() => setTab("view")}
        >
          다른 리뷰 보기
        </button>
      </div>

      {tab === "write" && (
        <form
          onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
          className="flex flex-col gap-3"
        >
          <input
            type="text"
            name="revtitle"
            placeholder="리뷰 제목"
            value={editingReview ? editingReview.revtitle : newReview.revtitle}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <textarea
            name="revtext"
            placeholder="리뷰 내용을 작성해주세요."
            value={editingReview ? editingReview.revtext : newReview.revtext}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            rows={4}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingReview ? "수정 완료" : "등록하기"}
          </button>
          {editingReview && (
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="text-gray-500 mt-2 underline"
            >
              수정 취소
            </button>
          )}
        </form>
      )}

      {tab === "view" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-gray-500">아직 리뷰가 없습니다.</div>
          ) : (
            reviews.map((r) => (
              <div key={r.revnum} className="border p-3 rounded-lg">
                <div className="font-semibold text-lg">{r.revtitle}</div>
                <div className="text-gray-700 mt-1">{r.revtext}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(r.revcre).toLocaleString()}
                </div>
                {user && user.mnum === r.mnum && (
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => startEdit(r)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteReview(r.revnum)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { pronum } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const [tab, setTab] = useState("write");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ revtitle: "", revtext: "", revscore: 5 });
  const [editingReview, setEditingReview] = useState(null);

  // ✅ 상품 불러오기
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProductById(pronum);
        setProduct(data);
      } catch {
        setErr("상품을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    if (pronum) load();
  }, [pronum]);

  // ✅ 리뷰 불러오기
  const loadReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/reviews/${pronum}`);
      setReviews(res.data);
    } catch (e) {
      console.error("리뷰 불러오기 오류:", e);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [pronum]);

  // ✅ 리뷰 등록
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!newReview.revtext.trim()) return alert("내용을 입력해주세요.");

    try {
      await axios.post("http://localhost:8080/reviews", {
        pronum,
        mnum: user.mnum,
        revtitle: newReview.revtitle,
        revtext: newReview.revtext,
        revscore: newReview.revscore,
      });
      alert("리뷰가 등록되었습니다!");
      setNewReview({ revtitle: "", revtext: "", revscore: 5 });
      loadReviews();
      setTab("view");
    } catch {
      alert("리뷰 등록 실패");
    }
  };

  // ✅ 리뷰 수정 시작
  const startEdit = (review) => {
    setEditingReview({ ...review });
    setTab("write");
  };

  // ✅ 리뷰 수정 완료
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/reviews/${editingReview.revnum}/${user.mnum}`,
        editingReview
      );
      alert("리뷰가 수정되었습니다!");
      setEditingReview(null);
      loadReviews();
      setTab("view");
    } catch {
      alert("리뷰 수정 실패");
    }
  };

  // ✅ 리뷰 삭제
  const handleDeleteReview = async (revnum) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/reviews/${revnum}/${user.mnum}`);
      alert("리뷰가 삭제되었습니다!");
      loadReviews();
    } catch {
      alert("리뷰 삭제 실패");
    }
  };

  // ✅ 장바구니 담기
  const addCart = async () => {
    if (!user) return navigate("/login");
    if (!window.confirm("장바구니에 담으시겠습니까?")) return;

    try {
      setAdding(true);
      await addToCart(Number(pronum), 1);
      alert("상품이 장바구니에 담겼습니다.");
    } finally {
      setAdding(false);
    }
  };

  // ✅ 구매하기
  const goToBuyPage = async () => {
    if (!user) return navigate("/login");
    if (!window.confirm("구매하시겠습니까?")) return;

    try {
      const res = await fetch("http://localhost:8080/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mnum: user.mnum, pronum: Number(pronum) }),
      });
      if (!res.ok) throw new Error();
      alert("대여신청이 완료되었습니다!");
    } catch {
      alert("대여 처리 중 오류 발생");
    }
  };

  // ✅ 로딩/오류 처리
  if (loading) return <div className="py-10 text-center text-gray-500">불러오는 중…</div>;
  if (err) return <div className="py-10 text-center text-red-600">{err}</div>;

  const { proname, proprice, probrand, prodetail, prodetailimage, status, createdAt, updatedAt } =
    product;

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
            <img src={`/images/${prodetailimage}`} alt={proname} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-64 grid place-items-center text-gray-400">No Image</div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{proname}</h1>
          <div className="text-lg font-semibold">
            {proprice ? Number(proprice).toLocaleString() + "원" : "가격정보 없음"}
          </div>
          <div>
            <span className="inline-block text-xs px-2 py-1 rounded bg-gray-100">{status}</span>
          </div>
          <div className="text-gray-700 whitespace-pre-line">{prodetail}</div>

          <button
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={addCart}
            disabled={adding}
          >
            {adding ? "담는 중…" : "장바구니에 담기"}
          </button>

          <button
            className="bg-green-600 text-white font-bold py-2 px-4 rounded"
            onClick={goToBuyPage}
          >
            바로 구매하기
          </button>

          <div className="mt-6 text-sm text-gray-500">
            <p>브랜드: {probrand || "-"}</p>
          </div>

          {/* ✅ 리뷰 영역 */}
          <ReviewTabs
            tab={tab}
            setTab={setTab}
            newReview={newReview}
            setNewReview={setNewReview}
            editingReview={editingReview}
            setEditingReview={setEditingReview}
            reviews={reviews}
            handleSubmitReview={handleSubmitReview}
            handleUpdateReview={handleUpdateReview}
            startEdit={startEdit}
            handleDeleteReview={handleDeleteReview}
            user={user}
          />

          <div className="text-xs text-gray-400 mt-4">
            <p>등록일: {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}</p>
            <p>수정일: {updatedAt ? new Date(updatedAt).toLocaleDateString() : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
