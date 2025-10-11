// src/components/community/CommunityWriteForm.jsx
import React, { useState } from "react";
import { createCommunityPost } from "../../api/communityApi";

const CommunityWriteForm = () => {
  const [formData, setFormData] = useState({
    bsub: "",       // 제목
    bcontent: "",   // 내용
    mnic: "",       // 작성자
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCommunityPost(formData);
      alert("게시글이 등록되었습니다!");
      window.location.href = "/board/community/list"; // 등록 후 목록 페이지로 이동
    } catch (error) {
      console.error("등록 오류:", error);
      alert("게시글 등록에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="community-write-form">
      <div>
        <label>제목</label>
        <input
          type="text"
          name="bsub"
          value={formData.bsub}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>내용</label>
        <textarea
          name="bcontent"
          value={formData.bcontent}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>작성자</label>
        <input
          type="text"
          name="mnic"
          value={formData.mnic}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">등록하기</button>
    </form>
  );
};

export default CommunityWriteForm;