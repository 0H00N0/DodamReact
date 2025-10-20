import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from './contexts/AdminContext';;

export default function DeliverymanManagement() {
  const {
    getAllDeliverymen,
    getAllProducts,
    getDeliveryEligibleMembers,
    createDeliveryman,
    updateDeliveryman,
    deleteDeliveryman,
    addNotification,
  } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);           // 머지된 행
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);   // { mnum, delnum|null, ... }
  const [form, setForm] = useState({ pronum: '', dayoff: 0, delcost: 0, location: '' });

  // 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [dmList, memberList, prodList] = await Promise.all([
          getAllDeliverymen(),            // DELIVERYMAN 테이블 rows
          getDeliveryEligibleMembers(),   // 역할=딜리버리맨 회원
          getAllProducts(),               // 상품 셀렉트용
        ]);
        setProducts(prodList || []);

        // 맵: mnum -> deliveryman row
        const dmByMnum = new Map((dmList || []).map(d => [d.mnum || d.member?.mnum || d.member?.id, d]));

        // 회원을 기준으로 머지 (없으면 미배정)
        const merged = (memberList || []).map(mem => {
          const mnum = mem.mnum || mem.id;
          const dm = dmByMnum.get(mnum) || null;
          return {
            mnum,
            memberName: mem.mname || mem.name || mem.nickname || mem.mid,
            memberId: mem.mid || mem.loginId || mem.username,
            delnum: dm?.delnum ?? null,
            pronum: dm?.pronum ?? dm?.product?.pronum ?? null,
            dayoff: dm?.dayoff ?? 0,
            delcost: dm?.delcost ?? 0,
            location: dm?.location ?? '',
            assigned: !!dm,
          };
        });

        setRows(merged);
      } catch (e) {
        // 알림은 request 헬퍼가 띄움
      } finally {
        setLoading(false);
      }
    })();
  }, [getAllDeliverymen, getDeliveryEligibleMembers, getAllProducts]);

  const openCreate = (r) => {
    setEditing({ ...r });
    setForm({
      pronum: r.pronum || (products[0]?.pronum ?? ''),
      dayoff: r.dayoff ?? 0,
      delcost: r.delcost ?? 0,
      location: r.location ?? '',
    });
    setModalOpen(true);
  };

  const openEdit = (r) => {
    openCreate(r); // 같은 폼 사용
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async () => {
    try {
      if (!editing) return;
      if (!form.pronum) {
        addNotification('상품을 선택하세요.', 'warning');
        return;
      }
      if (editing.assigned) {
        await updateDeliveryman(editing.delnum, {
          pronum: form.pronum,
          mnum: editing.mnum,
          dayoff: Number(form.dayoff),
          delcost: Number(form.delcost),
          location: form.location,
        });
      } else {
        await createDeliveryman({
          pronum: form.pronum,
          mnum: editing.mnum,
          dayoff: Number(form.dayoff),
          delcost: Number(form.delcost),
          location: form.location,
        });
      }
      addNotification('저장되었습니다.', 'success');
      closeModal();
      // 다시 로드
      const fresh = await getAllDeliverymen();
      const dmByMnum = new Map((fresh || []).map(d => [d.mnum || d.member?.mnum || d.member?.id, d]));
      setRows(prev =>
        prev.map(r => {
          const dm = dmByMnum.get(r.mnum);
          return dm
            ? {
                ...r,
                delnum: dm.delnum,
                pronum: dm.pronum ?? dm.product?.pronum,
                dayoff: dm.dayoff,
                delcost: dm.delcost,
                location: dm.location,
                assigned: true,
              }
            : r;
        })
      );
    } catch (e) {
      // 헬퍼가 에러 알림 처리
    }
  };

  const remove = async (r) => {
    if (!r.assigned) return;
    if (!window.confirm('이 배치를 삭제할까요?')) return;
    try {
      await deleteDeliveryman(r.delnum);
      addNotification('삭제되었습니다.', 'success');
      setRows(prev => prev.map(x => x.mnum === r.mnum ? { ...x, delnum: null, assigned: false } : x));
    } catch (_) {}
  };

  const productOptions = useMemo(
    () => (products || []).map(p => ({ value: p.pronum || p.id, label: p.pname || p.name || `상품#${p.pronum}` })),
    [products]
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">배송기사 관리</h2>

      {loading ? (
        <div>불러오는 중...</div>
      ) : rows.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table className="min-w-[800px] text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">회원ID</th>
              <th className="py-2 pr-4">이름</th>
              <th className="py-2 pr-4">상태</th>
              <th className="py-2 pr-4">상품</th>
              <th className="py-2 pr-4">휴무일수</th>
              <th className="py-2 pr-4">배송비</th>
              <th className="py-2 pr-4">지역</th>
              <th className="py-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.mnum} className="border-b">
                <td className="py-2 pr-4">{r.memberId}</td>
                <td className="py-2 pr-4">{r.memberName}</td>
                <td className="py-2 pr-4">
                  {r.assigned ? <span className="text-green-600">배정</span> : <span className="text-gray-500">미배정</span>}
                </td>
                <td className="py-2 pr-4">{r.pronum ?? '-'}</td>
                <td className="py-2 pr-4">{r.dayoff}</td>
                <td className="py-2 pr-4">{r.delcost}</td>
                <td className="py-2 pr-4">{r.location || '-'}</td>
                <td className="py-2 space-x-2">
                  {r.assigned ? (
                    <>
                      <button className="px-2 py-1 border rounded" onClick={() => openEdit(r)}>수정</button>
                      <button className="px-2 py-1 border rounded" onClick={() => remove(r)}>삭제</button>
                    </>
                  ) : (
                    <button className="px-2 py-1 border rounded" onClick={() => openCreate(r)}>배치 등록</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 간단 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[520px]">
            <h3 className="text-lg font-semibold mb-4">
              {editing?.assigned ? '배치 수정' : '배치 등록'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block mb-1">상품</label>
                <select
                  className="border px-2 py-1 w-full"
                  value={form.pronum}
                  onChange={e => setForm(f => ({ ...f, pronum: e.target.value }))}
                >
                  <option value="">선택하세요</option>
                  {productOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block mb-1">휴무일수</label>
                  <input
                    type="number"
                    className="border px-2 py-1 w-full"
                    value={form.dayoff}
                    onChange={e => setForm(f => ({ ...f, dayoff: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">배송비</label>
                  <input
                    type="number"
                    className="border px-2 py-1 w-full"
                    value={form.delcost}
                    onChange={e => setForm(f => ({ ...f, delcost: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">지역</label>
                <input
                  className="border px-2 py-1 w-full"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={closeModal}>취소</button>
              <button className="px-3 py-1 border rounded bg-black text-white" onClick={submit}>
                {editing?.assigned ? '저장' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
