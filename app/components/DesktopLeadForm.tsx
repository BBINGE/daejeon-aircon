"use client";

import { useState, type FormEvent } from "react";

const inquiryTypes = ["에어컨 설치", "이전설치", "철거", "중고 매입", "중고 에어컨 판매", "기타 상담"];

export default function DesktopLeadForm() {
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [region, setRegion] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "done-needs-call">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, inquiryType, region, consent: agreed, website }),
      });
      const result = await response.json() as { error?: string; notificationPending?: boolean };
      if (!response.ok) throw new Error(result.error || "접수되지 않았습니다. 다시 시도해주세요.");
      setState(result.notificationPending ? "done-needs-call" : "done");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "접수되지 않았습니다. 다시 시도해주세요.");
      setState("idle");
    }
  }

  return <div className="desktop-lead" id="pc-inquiry">
    <div className="desktop-lead-copy"><span>전화 상담 신청</span><h3>연락처를 남기시면<br />전화로 상담드립니다.</h3><p>연락받을 번호를 입력하고 ‘상담 신청하기’를 누르시면, 접수 내용을 확인한 뒤 담당자가 전화드립니다.</p><a href="tel:01091832200">바로 통화하고 싶다면 010-9183-2200</a></div>
    {state === "done" || state === "done-needs-call" ? <div className="desktop-lead-done" role="status"><strong>상담 신청을 받았습니다.</strong><p>{state === "done-needs-call" ? "접수 알림이 지연되고 있어요. 빠른 상담을 원하시면 010-9183-2200으로 직접 전화해주세요." : "접수 내용을 확인한 뒤 담당자가 전화드리겠습니다. 급한 문의는 010-9183-2200으로 전화해주세요."}</p></div> : <form className="desktop-lead-form" onSubmit={submit}>
      <label htmlFor="lead-phone">연락받을 번호 <b>필수</b></label><input id="lead-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" value={phone} onChange={event => setPhone(event.target.value)} maxLength={20} required />
      <div className="desktop-lead-fields"><div><label htmlFor="lead-type">필요한 작업 <small>선택</small></label><select id="lead-type" name="inquiryType" value={inquiryType} onChange={event => setInquiryType(event.target.value)}><option value="">선택하지 않아도 돼요</option>{inquiryTypes.map(type => <option key={type}>{type}</option>)}</select></div><div><label htmlFor="lead-region">지역 <small>선택</small></label><input id="lead-region" name="region" placeholder="예: 대전 서구" value={region} onChange={event => setRegion(event.target.value)} maxLength={40} /></div></div>
      <div className="lead-trap" aria-hidden="true"><label htmlFor="lead-website">웹사이트</label><input id="lead-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
      <label className="desktop-lead-consent"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} required /><span>입력하신 번호로 상담 전화를 드리는 데 동의합니다. <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보 안내</a></span></label>
      {error && <p className="desktop-lead-error" role="alert">{error}</p>}
      <button type="submit" disabled={state === "sending"}>{state === "sending" ? "신청 중…" : "상담 신청하기"}</button><p className="desktop-lead-foot">신청만으로 예약·견적이 확정되지 않습니다.</p>
    </form>}
  </div>;
}
