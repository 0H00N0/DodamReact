// BulkProductUpload.js (테마 적용판)
import React, { useState } from "react";
import { useAdmin } from "./contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import "./BulkProductUpload.css";

function BulkProductUpload() {
  const { bulkUploadProducts, addNotification } = useAdmin();
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);

  const handleCsvChange = (e) => setCsvFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("CSV 파일을 선택해주세요.");
      return;
    }
    try {
      const result = await bulkUploadProducts(csvFile); // POST /admin/products/bulk-upload
      addNotification(`총 ${result.registeredCount}개 상품 등록 완료`, "success");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      addNotification("일괄 등록 실패: " + error.message, "error");
    }
  };

  const handleDownloadSample = () => {
    const header =
      [
        "상품명",
        "상세설명",
        "대여료",
        "브랜드",
        "제조사",
        "연령",
        "인증",
        "출시일(YYYY-MM-DD)",
        "카테고리ID",
        "상태ID",
        "메인이미지URL",
        "상세이미지URL",
      ].join(",") + "\n";

    const s1 =
      [
        "레고 블록 세트",
        "창의력을 키워주는 블록 장난감",
        "15000",
        "LEGO",
        "LEGO",
        "6",
        "KC인증",
        "2024-03-15",
        "2",
        "1",
        "https://cdn.example.com/images/lego-main.jpg",
        "https://cdn.example.com/images/lego-detail.jpg",
      ].join(",") + "\n";

    const s2 =
      [
        "리틀타익스 미끄럼틀",
        "실내외 사용 가능한 안전한 미끄럼틀",
        "12000",
        "LittleTikes",
        "LittleTikes",
        "3",
        "KC인증",
        "2023-11-02",
        "7",
        "2",
        "https://cdn.example.com/images/slide-main.jpg",
        "https://cdn.example.com/images/slide-detail.jpg",
      ].join(",") + "\n";

    const csv = header + s1 + s2;
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="panel bulk-upload-card">
      <h2 className="page-title">상품 일괄 등록</h2>

      {/* 테마 버튼: 연한 배경 + 진한 테두리(ghost), 기본(btn) */}
      <div className="page-actions">
        <button type="button" className="btn ghost" onClick={handleDownloadSample}>
          샘플 CSV 다운로드
        </button>
      </div>

      <form className="m-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="m-label">CSV 파일 업로드</label>
          <input
            className="m-input"
            type="file"
            accept=".csv"
            onChange={handleCsvChange}
            required
          />
          <p className="hint">
            ※ 컬럼 순서는 샘플과 동일해야 하며, 이미지 컬럼은 <b>접근 가능한 URL</b>을 넣어주세요.
            (파일명만 넣으면 저장되지 않습니다)
          </p>
        </div>

        <div className="m-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate("/admin/products")}
          >
            취소
          </button>
          <button type="submit" className="btn">업로드</button>
        </div>
      </form>
    </section>
  );
}

export default BulkProductUpload;
