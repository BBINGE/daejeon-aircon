"use client";

import { FormEvent, useMemo, useState } from "react";

const API_URL = "https://kimdaegon-aircon.bbinge95.chatgpt.site/api/leads";
const statusLabels: Record<string, string> = { new: "신규", contacted: "연락 완료", quoting: "견적 진행", won: "계약", completed: "작업 완료", hold: "보류", closed: "미계약 상담 종료" };

type Lead = { id: number; region: string; inquiryType: string; airconType: string; phone: string; sourceUrl: string | null; referrer: string | null; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; utmContent: string | null; utmTerm: string | null; status: string; createdAt: string };

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function load(e?: FormEvent) {
    e?.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(API_URL, { headers: { "X-Admin-Key": key } });
      const result = await response.json() as { error?: string; leads?: Lead[] };
      if (!response.ok || !result.leads) throw new Error(result.error || "목록을 불러오지 못했습니다.");
      setLeads(result.leads); setAuthenticated(true);
    } catch (err) { setError(err instanceof Error ? err.message : "목록을 불러오지 못했습니다."); }
    finally { setLoading(false); }
  }

  async function changeStatus(id: number, status: string) {
    const previous = leads; setLeads(current => current.map(row => row.id === id ? { ...row, status } : row));
    const response = await fetch(API_URL, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": key }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { setLeads(previous); setError("상태 변경에 실패했습니다."); }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? leads.filter(row => [row.phone, row.region, row.inquiryType, row.airconType, row.utmCampaign, row.utmTerm].some(value => value?.toLowerCase().includes(term))) : leads;
  }, [leads, query]);

  function downloadCsv() {
    const headers = ["번호","접수시각","상태","지역","문의유형","에어컨종류","연락처","UTM소스","UTM매체","캠페인","콘텐츠","키워드","유입URL"];
    const lines = filtered.map(row => [row.id,row.createdAt,statusLabels[row.status] || row.status,row.region,row.inquiryType,row.airconType,row.phone,row.utmSource,row.utmMedium,row.utmCampaign,row.utmContent,row.utmTerm,row.sourceUrl].map(value => `"${String(value ?? "").replaceAll('"','""')}"`).join(","));
    const blob = new Blob(["\uFEFF" + [headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `aircon-leads-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  if (!authenticated) return <main className="admin-login"><form onSubmit={load}><span>LEAD DESK</span><h1>에어컨·냉난방기 문의 관리</h1><p>관리 비밀번호를 입력하면 접수 목록을 확인할 수 있습니다.</p><label>관리 비밀번호<input type="password" value={key} onChange={e => setKey(e.target.value)} required autoFocus /></label>{error && <div className="admin-error">{error}</div>}<button disabled={loading}>{loading ? "확인 중" : "관리 화면 열기"}</button><a href="/">고객 화면으로 돌아가기</a></form></main>;

  const newCount = leads.filter(row => row.status === "new").length;
  const wonCount = leads.filter(row => ["won","completed"].includes(row.status)).length;
  return <main className="admin-page"><header><div><span>LEAD DESK</span><h1>에어컨·냉난방기 문의 관리</h1></div><div><button onClick={() => load()}>새로고침</button><button onClick={downloadCsv}>CSV 다운로드</button><a href="/">고객 화면</a></div></header><section className="admin-stats"><article><span>전체 접수</span><b>{leads.length}</b></article><article><span>신규 문의</span><b>{newCount}</b></article><article><span>계약·완료</span><b>{wonCount}</b></article></section><section className="admin-toolbar"><input placeholder="전화번호·지역·서비스·광고 키워드 검색" value={query} onChange={e => setQuery(e.target.value)} /><span>{filtered.length}건 표시</span></section>{error && <div className="admin-error">{error}</div>}<section className="admin-table-wrap"><table><thead><tr><th>접수</th><th>상태</th><th>고객 연락처</th><th>문의 내용</th><th>광고 정보</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}><td><b>#{row.id}</b><small>{row.createdAt}</small></td><td><select value={row.status} onChange={e => changeStatus(row.id,e.target.value)}>{Object.entries(statusLabels).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></td><td><a href={`tel:${row.phone.replaceAll("-","")}`}>{row.phone}</a><small>{row.region}</small></td><td><b>{row.inquiryType}</b><small>{row.airconType}</small></td><td><b>{row.utmCampaign || row.utmSource || "직접 유입"}</b><small>{row.utmTerm || row.referrer || "-"}</small></td></tr>)}</tbody></table>{!filtered.length && <p className="admin-empty">표시할 문의가 없습니다.</p>}</section></main>;
}
