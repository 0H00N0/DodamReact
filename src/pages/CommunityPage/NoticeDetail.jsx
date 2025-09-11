import React from "react";
import { useParams, Link } from "react-router-dom";

const notices = [
  { id: 1, title: "추석 연휴 배송 안내", date: "2025-09-05", content: "추석 연휴 기간(9/12~9/15) 동안 배송이 중단됩니다. 9/10(수) 오후 2시 이전 결제 건까지는 연휴 전 발송됩니다." },
  { id: 2, title: "신학기 맞이 학습완구 특별 할인전 🎁", date: "2025-09-02", content: "신학기를 맞아 학습완구를 최대 30% 할인합니다. (기간: 9/2~9/15)" },
  { id: 3, title: "인기 상품 재입고! 블록 놀이 세트", date: "2025-08-28", content: "품절되었던 블록 놀이 세트가 재입고되었습니다. 한정 수량으로 빠른 품절이 예상됩니다." }
];

const NoticeDetail = () => {
  const { noticeId } = useParams();
  const notice = notices.find((n) => n.id === Number(noticeId));

  if (!notice) return <p>공지사항을 찾을 수 없습니다.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{notice.title}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>{notice.date}</p>
      <p>{notice.content}</p>
      <br />
      <Link to="/board/notice">← 목록으로 돌아가기</Link>
    </div>
  );
};

export default NoticeDetail;