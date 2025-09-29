import React, { useState } from "react";
import { useAdmin } from "./contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import "./BulkProductUpload.css";

function BulkProductUpload() {
  const { bulkUploadProducts, addNotification } = useAdmin();
  const navigate = useNavigate();

  const [csvFile, setCsvFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleCsvChange = (e) => setCsvFile(e.target.files[0]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("CSV 파일을 선택해주세요.");
      return;
    }
    try {
      const result = await bulkUploadProducts(csvFile, imageFiles);
      addNotification(`총 ${result.registeredCount}개 상품 등록 완료`, "success");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      addNotification("일괄 등록 실패: " + error.message, "error");
    }
  };

  const handleDownloadSample = () => {
  const header = "상품명,상세설명,대여료,브랜드,제조사,연령,인증,출시일,예약번호,ctnum,카테고리ID,상태ID,미리보기URL,상세URL\n";
  const sample1 = "노트북,16GB RAM,10000,삼성,한국,15,KC,2025-09-01,100,200,1,1,https://cdn.example.com/laptop_main.jpg,https://cdn.example.com/laptop_detail.jpg\n";
  const sample2 = "마우스,게이밍 무선,1000,로지텍,중국,12,CE,2025-08-15,101,201,2,1,https://cdn.example.com/mouse_main.jpg,https://cdn.example.com/mouse_detail.jpg\n";

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
      <button type="button" className="admin-btn secondary" onClick={handleDownloadSample}>
        샘플 CSV 다운로드
      </button>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>CSV 파일 업로드</label>
          <input type="file" accept=".csv" onChange={handleCsvChange} required />
        </div>

        <div className="form-actions">
          <button type="button" className="admin-btn secondary" onClick={() => navigate("/admin/products")}>
            취소
          </button>
          <button type="submit" className="admin-btn primary">업로드</button>
        </div>
      </form>
    </div>
  );
}

export default BulkProductUpload;
