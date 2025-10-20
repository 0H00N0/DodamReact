import React, { useEffect, useState } from 'react';
import { DeliveryAPI } from '../service/api';

export default function Home() {
  const [me, setMe] = useState(null);
  useEffect(() => { DeliveryAPI.me().then(setMe); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">배송기사페이지</h1>
      {me && (
        <div className="p-4 border rounded">
          <div>기사: {me.name}</div>
          <div>지역: {me.location}</div>
          <div>잔여 휴무일: {me.dayoffRemain}</div>
        </div>
      )}
    </div>
  );
}
