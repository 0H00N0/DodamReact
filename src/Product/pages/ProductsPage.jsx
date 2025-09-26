import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/ProductApi";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Pagination from "../../common/Pagination";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { page: pageParam } = useParams();

  // 경로로 받은 page (없으면 0)
  const initialPage = useMemo(() => {
    const p = Number(pageParam);
    return Number.isFinite(p) && p >= 0 ? p : 0;
  }, [pageParam]);

  const [params, setParams] = useState({
    page: initialPage,
    size: 12,
    sort: "productId,desc",
    keyword: "",
    categoryId: undefined,
    status: "",
    minPrice: undefined,
    maxPrice: undefined,
    lowStock: false,
  });

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 경로 page 변경 시 상태 초기화
  useEffect(() => {
    setParams((p) => ({ ...p, page: initialPage }));
  }, [initialPage]);

  const load = async (nextParams = params) => {
    setLoading(true);
    setErr("");
    try {
      const { page = 0, size = 12, sort, ...rest } = nextParams;
      const data = await fetchProducts({ page, size, sort, ...rest });
      setPageData(data);
    } catch (e) {
      console.error(e); 
      setErr("목록을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 파라미터(상태) 변경 시 데이터 로드
  useEffect(() => {
    load(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.size, params.sort, params.keyword, params.categoryId, params.status, params.minPrice, params.maxPrice, params.lowStock]);

  const onFilterChange = (f) => {
    // 필터 바뀌면 0페이지로, URL은 바꾸지 않음 (깔끔한 경로 유지)
    setParams((p) => ({ ...p, ...f, page: 0 }));
    // 첫 페이지는 /products 로 이동
    navigate("/products", { replace: true });
  };

  const onPageChange = (next) => {
    setParams((p) => ({ ...p, page: next }));
    // 0페이지면 /products, 그 외엔 /products/page/:page
    if (next === 0) navigate("/products");
    else navigate(`/products/page/${next}`);
  };

  const onCardClick = (item) => {
  if (!item || !item.pronum) return;
  navigate(`/products/${item.pronum}`);  //방어코드
};

  const items = pageData?.content ?? [];
  const page = pageData?.number ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const total = pageData?.totalElements ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">상품 목록</h1>
        <p className="text-sm text-gray-500">총 {total.toLocaleString()}개</p>
      </header>

      <section className="mb-6">
        <ProductFilters value={params} onChange={onFilterChange} />
      </section>

      {loading && <div className="py-10 text-center text-gray-500">불러오는 중…</div>}
      {err && !loading && <div className="py-6 text-center text-red-600">{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div className="py-10 text-center text-gray-500">등록된 상품이 없습니다.</div>
      )}

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {!loading && items.map((it) => (
          <ProductCard key={it.pronum} item={it} onClick={onCardClick} />
        ))}
      </section>

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} /> 
    </div>
  );
}
