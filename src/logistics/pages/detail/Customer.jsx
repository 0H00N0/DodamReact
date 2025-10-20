import React, { useEffect, useState } from 'react';
import { DeliveryAPI } from '../../service/api';

export default function Customer() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const search = async () => setRows(await DeliveryAPI.customerList(q));
  useEffect(()=>{ search(); }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">고객정보</h2>
      <div className="flex gap-2 mb-4">
        <input className="border px-3 py-2 rounded w-72" value={q} onChange={e=>setQ(e.target.value)} placeholder="이름/주소/전화"/>
        <button onClick={search} className="px-3 py-2 border rounded">검색</button>
      </div>
      <table className="w-full table-fixed border">
        <thead><tr className="bg-gray-50">
          <th className="p-2 border w-24">주문ID</th>
          <th className="p-2 border w-32">고객명</th>
          <th className="p-2 border">주소</th>
          <th className="p-2 border w-40">연락처</th>
          <th className="p-2 border w-32">최근상태</th>
        </tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.orderId}>
              <td className="p-2 border text-center">{r.orderId}</td>
              <td className="p-2 border">{r.name}</td>
              <td className="p-2 border">{r.address}</td>
              <td className="p-2 border">{r.phone}</td>
              <td className="p-2 border text-center">{r.lastStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
