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
      const result = await bulkUploadProducts(csvFile);
      addNotification(`총 ${result.registeredCount}개 상품 등록 완료`, "success");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      addNotification("일괄 등록 실패: " + error.message, "error");
    }
  };

  // ✅ 최신 ProductEntity 기반 샘플 CSV
  const handleDownloadSample = () => {
    const header =
      "상품명,브랜드명,대여가격,카테고리ID,상품등급ID,상품설명,이미지파일명\n";
    const sample1 =
      "레고 블록 세트,LEGO,15000,2,1,창의력을 키워주는 블록 장난감,lego1.jpg,lego2.jpg\n";
    const sample2 =
      "리틀타익스 미끄럼틀,LittleTikes,12000,7,2,실내외 사용 가능한 안전한 미끄럼틀,slide1.jpg\n";

    const csvContent = header + sample1 + sample2;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bulk-upload-container">
      <h2>상품 일괄 등록</h2>

      {/* ✅ 샘플 CSV 다운로드 버튼 */}
      <button
        type="button"
        className="admin-btn secondary"
        onClick={handleDownloadSample}
      >
        샘플 CSV 다운로드
      </button>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>CSV 파일 업로드</label>
          <input type="file" accept=".csv" onChange={handleCsvChange} required />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="admin-btn secondary"
            onClick={() => navigate("/admin/products")}
          >
            취소
          </button>
          <button type="submit" className="admin-btn primary">
            업로드
          </button>
        </div>
      </form>
    </div>
  );
}

export default BulkProductUpload;
