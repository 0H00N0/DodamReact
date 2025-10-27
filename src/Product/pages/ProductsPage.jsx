import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/ProductApi";
import ProductCard from "./ProductCard";
import Pagination from "../../common/Pagination";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ProductPage.module.css";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { page: pageParam } = useParams();

  const initialPage = useMemo(() => {
    const p = Number(pageParam);
    return Number.isFinite(p) && p >= 0 ? p : 0;
  }, [pageParam]);

  const [params, setParams] = useState({
    page: initialPage,
    size: 12,
    sort: "pronum,desc",
  });
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { page = 0, size = 12, sort } = params;
      const data = await fetchProducts({ page, size, sort });
      setPageData(data);
    } catch (e) {
      console.error(e);
      setErr("목록을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);

  const onPageChange = (next) => {
    setParams((p) => ({ ...p, page: next }));
    if (next === 0) navigate("/products");
    else navigate(`/products/page/${next}`);
  };

  const onCardClick = (itemOrId) => {
    const id = typeof itemOrId === "number" ? itemOrId : itemOrId?.pronum;
    if (id) navigate(`/products/${id}`);
  };

  const items = pageData?.content ?? [];
  const page = pageData?.number ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const total = pageData?.totalElements ?? 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>상품 목록</h1>
        <p>총 {total.toLocaleString()}개의 상품</p>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">불러오는 중…</div>}
      {err && !loading && <div className="py-6 text-center text-red-600">{err}</div>}

      {!loading && !err && items.length > 0 && (
        <div className={styles.productGrid}>
          {items.map((it) => (
            <div key={it.pronum ?? it.id} onClick={() => onCardClick(it)}>
              <ProductCard item={it} />
            </div>
          ))}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="py-10 text-center text-gray-500">등록된 상품이 없습니다.</div>
      )}

      {/* ✅ 가시성 보장되는 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
        className={styles.pager}
      />
    </div>
  );
}
