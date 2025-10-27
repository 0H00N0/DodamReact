import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/ProductApi";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";
import { normalizeImage, onImgError } from "../../utils/image";
import styles from "./ProductPage.module.css";

/* 🎀 리뷰 탭 (핑크 테마) */
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingReview) {
      setEditingReview((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewReview((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className={styles.reviewContainer}>
      {/* 탭 */}
      <div className={styles.reviewTabs}>
        <button
          className={`${styles.reviewTabBtn} ${tab === "write" ? styles.active : ""}`}
          onClick={() => setTab("write")}
        >
          ✏️ 리뷰 작성
        </button>
        <button
          className={`${styles.reviewTabBtn} ${tab === "view" ? styles.active : ""}`}
          onClick={() => setTab("view")}
        >
          💬 리뷰 보기
        </button>
      </div>

      {/* 리뷰 작성 */}
      {tab === "write" && (
        <form
          onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
          className={styles.reviewForm}
        >
          <input
            type="text"
            name="revtitle"
            placeholder="리뷰 제목을 입력하세요"
            value={editingReview ? editingReview.revtitle : newReview.revtitle}
            onChange={handleChange}
            className={styles.reviewInput}
          />
          <textarea
            name="revtext"
            placeholder="리뷰 내용을 입력하세요"
            value={editingReview ? editingReview.revtext : newReview.revtext}
            onChange={handleChange}
            className={styles.reviewTextarea}
            rows={4}
          />
          <button type="submit" className={styles.reviewBtn}>
            {editingReview ? "✏️ 수정 완료" : "🩷 리뷰 등록"}
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

      {/* 리뷰 보기 */}
      {tab === "view" && (
        <div>
          {reviews.length === 0 ? (
            <div className={styles.reviewEmpty}>등록된 리뷰가 아직 없습니다 😅</div>
          ) : (
            reviews.map((r) => (
              <div key={r.revnum} className={styles.reviewItem}>
                <div className={styles.reviewTitle}>{r.revtitle}</div>
                <div className={styles.reviewText}>{r.revtext}</div>
                <div className={styles.reviewMeta}>
                  {new Date(r.revcre).toLocaleString()}
                </div>
                {user && user.mnum === r.mnum && (
                  <div className={styles.reviewActions}>
                    <button
                      onClick={() => startEdit(r)}
                      className={styles.reviewEditBtn}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteReview(r.revnum)}
                      className={styles.reviewDeleteBtn}
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

/* 🎀 상품 상세 메인 */
export default function ProductDetailPage() {
  const { user } = useAuth();
  const { pronum } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const [tab, setTab] = useState("view");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ revtitle: "", revtext: "" });
  const [editingReview, setEditingReview] = useState(null);

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

  // 리뷰 불러오기
  const loadReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/reviews/${pronum}`);
      setReviews(res.data);
    } catch (e) {
      console.error("리뷰 불러오기 오류:", e);
    }
  };
  useEffect(() => { loadReviews(); }, [pronum]);

  // 대표 이미지
  const mainImage = useMemo(() => {
    const cand =
      product?.prodetailimage ||
      product?.proimg ||
      product?.thumbnailUrl ||
      product?.imageUrl ||
      product?.image;
    return normalizeImage(cand);
  }, [product]);

  if (loading) return <div className="py-10 text-center text-gray-500">불러오는 중…</div>;
  if (err) return <div className="py-10 text-center text-red-600">{err}</div>;

  const { proname, probrand, prodetail, proborrow } = product;

  // 리뷰 등록/수정/삭제
  console.log("리뷰 전송 데이터:", {
  pronum: Number(pronum),
  mnum: Number(user.mnum),
  revtitle: newReview.revtitle.trim(),
  revtext: newReview.revtext.trim(),
  revscore: 5,
});
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!newReview.revtext.trim()) return alert("내용을 입력해주세요.");
    try {
      await axios.post("http://localhost:8080/reviews", {
  pronum: Number(pronum),
  mnum: Number(user.mnum),
  revtitle: newReview.revtitle.trim(),
  revtext: newReview.revtext.trim(),
  revscore: 5,
});

      alert("리뷰가 등록되었습니다!");
      setNewReview({ revtitle: "", revtext: "" });
      loadReviews();
      setTab("view");
    } catch {
      alert("리뷰 등록 실패");
    }
  };
  

  const startEdit = (r) => {
    setEditingReview({ ...r });
    setTab("write");
  };

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

  // 장바구니/바로구매
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

  return (
    <div className={styles.detailContainer}>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded border bg-gray-50 hover:bg-gray-100"
      >
        ← 뒤로가기
      </button>

      {/* 상품 정보 */}
      <div className={styles.detailWrapper}>
        <div className={styles.detailImageBox}>
          <img src={mainImage} alt={proname ?? "상품 이미지"} onError={onImgError} />
        </div>

        <div className={styles.detailInfo}>
          <h1 className={styles.detailTitle}>{proname}</h1>
          <div className={styles.detailPrice}>
            {proborrow ? Number(proborrow).toLocaleString() + "원" : "가격정보 없음"}
          </div>
          <p className={styles.detailDesc}>{prodetail}</p>

          <div className={styles.detailBtns}>
            <button
              className={`${styles.detailBtn} ${styles.cartBtn}`}
              onClick={addCart}
              disabled={adding}
            >
              {adding ? "담는 중…" : "장바구니에 담기"}
            </button>
            <button
              className={`${styles.detailBtn} ${styles.buyBtn}`}
              onClick={goToBuyPage}
            >
              바로 구매하기
            </button>
          </div>

          <div className={styles.detailMeta}>
            <p>브랜드: {probrand || "-"}</p>
          </div>
        </div>
      </div>

      {/* 🎀 리뷰 섹션 */}
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
    </div>
  );
}
