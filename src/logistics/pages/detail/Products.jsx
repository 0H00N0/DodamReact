import React, { useState } from 'react';
import { DeliveryAPI } from '../../service/api';

export default function Products() {
  const [key, setKey] = useState('');
  const [res, setRes] = useState(null);
  const check = async () => setRes(await DeliveryAPI.productCheck(key));
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">상품확인</h2>
      <div className="flex gap-2 mb-4">
        <input className="border px-3 py-2 rounded w-96" placeholder="바코드/주문번호/상품ID"
               value={key} onChange={e=>setKey(e.target.value)} />
        <button onClick={check} className="px-3 py-2 border rounded">확인</button>
      </div>
      {res && (
        <div className={`p-4 border rounded ${res.ok ? 'bg-green-50':'bg-red-50'}`}>
          <div>상품ID: {res.productId}</div>
          <div>상품명: {res.proname}</div>
          <div>등급: {res.grade}</div>
          <div>결과: {res.ok ? 'OK' : 'NG'}</div>
          <div>메시지: {res.message}</div>
        </div>
      )}
    </div>
  );
}
