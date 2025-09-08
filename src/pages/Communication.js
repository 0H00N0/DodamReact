const Communication = () => {
  return (
    <div className="flex flex-col justify-center items-end h-screen pr-12 space-y-4">
      <a href="/notice" className="text-lg font-semibold">공지사항</a>
      <a href="/event" className="text-lg font-semibold">이벤트</a>
      <a href="/qna" className="text-lg font-semibold">문의</a>
      <a href="/faq" className="text-lg font-semibold">FAQ</a>
      <a href="/company" className="text-lg font-semibold">회사소개</a>
    </div>
  );
};

export default Communication;