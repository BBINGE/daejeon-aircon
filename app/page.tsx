"use client";

import { FormEvent, useState } from "react";

const services = [
  ["설치·이전설치", "이사 날짜가 잡혔다면 에어컨 일정부터 확인하세요."],
  ["수리·가스충전", "찬바람이 약하거나 물이 떨어지면 더 기다리지 마세요."],
  ["중고 매입·판매", "버리기 전에 매입 가능 여부부터 확인하세요."],
  ["철거·재설치", "폐업·이전 철거부터 재설치까지 한 번에 문의하세요."],
];

const areas = ["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주"];

function LeadForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) return <div className="thanks"><strong>접수가 완료됐습니다.</strong><span>확인 후 작업 가능 지역과 일정을 안내드리겠습니다.</span></div>;

  return (
    <form className={`lead-form ${compact ? "compact" : ""}`} onSubmit={submit} id={compact ? "final-form" : "estimate"}>
      <div className="form-heading"><span>30초 빠른 접수</span><h2>가능한 일정과 견적부터 확인하세요</h2></div>
      <div className="form-grid">
        <label><span>지역</span><select required defaultValue=""><option value="" disabled>지역을 선택하세요</option>{areas.map(a => <option key={a}>{a}</option>)}<option>기타 지역</option></select></label>
        <label><span>문의 유형</span><select required defaultValue=""><option value="" disabled>필요한 작업을 선택하세요</option><option>설치</option><option>이전설치</option><option>수리·가스충전</option><option>중고 매입</option><option>중고 구매</option><option>철거</option><option>기타</option></select></label>
        <label><span>에어컨 종류</span><select required defaultValue=""><option value="" disabled>제품 종류를 선택하세요</option><option>벽걸이</option><option>스탠드</option><option>2in1</option><option>시스템</option><option>업소용</option><option>잘 모르겠음</option></select></label>
        <label><span>연락처</span><input required inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" pattern="[0-9-]{10,13}" /></label>
      </div>
      <label className="agree"><input type="checkbox" required /> 개인정보 수집·이용에 동의합니다 <button type="button">내용 보기</button></label>
      <button className="submit" type="submit">내 지역 빠른 견적 받기 <b>→</b></button>
      <p className="form-note">접수 후 지역과 기사 일정을 확인해 연락드립니다.</p>
    </form>
  );
}

export default function Home() {
  return (
    <main>
      <header className="topbar"><a className="brand" href="#top"><i>에어컨</i><span>설치·수리·중고</span></a><a className="top-cta" href="#estimate">빠른 견적 신청</a></header>

      <section className="hero" id="top">
        <div className="hero-image" role="img" aria-label="에어컨 현장 작업 사진" />
        <div className="hero-shade" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span /> 여름철 설치·수리 일정 확인 중</p>
            <h1>에어컨,<br /><em>기다리다 여름 다 갑니다.</em></h1>
            <p className="hero-sub">설치부터 이전·수리·철거·중고 매입까지.<br />지금 우리 지역 작업 가능 여부부터 확인하세요.</p>
            <div className="trust-row"><span>✓ 실제 현장 사진</span><span>✓ 지역별 일정 확인</span><span>✓ 30초 문의</span></div>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="quick-strip"><strong>지금 필요한 작업, 한 번에 문의하세요</strong><div>{["신규 설치", "이전 설치", "수리", "가스 충전", "중고 매입", "철거"].map(x => <span key={x}>{x}</span>)}</div></section>

      <section className="section service-section">
        <div className="section-title"><p>WHAT WE DO</p><h2>덥고 급할수록<br /><em>일정부터 잡아야 합니다.</em></h2><span>서비스가 정확히 정해지지 않았어도 괜찮습니다. 현재 상황을 남기면 필요한 작업을 함께 확인합니다.</span></div>
        <div className="service-grid">{services.map(([title, desc], i) => <article key={title}><b>0{i + 1}</b><h3>{title}</h3><p>{desc}</p><a href="#estimate">가능 여부 확인 →</a></article>)}</div>
      </section>

      <section className="work-section">
        <div className="work-copy"><p>REAL WORK</p><h2>말보다 현장.<br />직접 작업한 사진으로<br /><em>확인하세요.</em></h2><span>배관 한 줄, 실외기 위치 하나도 현장마다 다릅니다. 사진만 보고 정찰가를 약속하기보다 작업 조건을 확인하고 안내합니다.</span><a href="#estimate">내 현장 견적 물어보기 →</a></div>
        <div className="photo-grid"><img src="/images/install.webp" alt="실내 에어컨 설치 작업" /><img src="/images/service.webp" alt="에어컨 점검 현장" /><img src="/images/roof.webp" alt="옥상 실외기 작업" /><img src="/images/work.webp" alt="실외기 설치 작업" /></div>
      </section>

      <section className="price-section section">
        <div className="section-title"><p>PRICE CHECK</p><h2>무조건 싸다는 말보다<br /><em>비용이 달라지는 이유부터.</em></h2></div>
        <div className="factors">{["에어컨 종류", "배관 길이", "실외기 위치", "앵글 필요 여부", "냉매 상태", "철거 여부", "이전 거리", "현장 난이도"].map((x,i)=><span key={x}><b>{String(i+1).padStart(2,"0")}</b>{x}</span>)}</div>
        <p className="price-note">현장 조건 없이 만든 ‘최저가’는 실제 결제 금액과 달라질 수 있습니다.<br />지역과 작업 유형을 남겨주시면 필요한 확인 사항부터 안내드립니다.</p>
      </section>

      <section className="area-section">
        <div><p>WORK AREA</p><h2>우리 동네도 오나요?<br /><em>먼저 확인해드릴게요.</em></h2><span>대전·세종·충청권 중심, 전북 일부 지역까지 상담합니다. 기타 지역은 기사 일정과 작업 가능 여부 확인 후 안내드립니다.</span><a href="#estimate">내 지역 일정 확인 →</a></div>
        <div className="area-card"><strong>주요 상담 지역</strong><div>{areas.map(a=><span key={a}>{a}</span>)}</div><small>※ 접수 시점과 작업 조건에 따라 가능 여부가 달라질 수 있습니다.</small></div>
      </section>

      <section className="process section"><div className="section-title"><p>HOW IT WORKS</p><h2>복잡하게 말고,<br /><em>딱 4단계로.</em></h2></div><ol>{[["01","빠른 신청","지역·작업·연락처만 남겨주세요."],["02","전화 확인","현장 상황과 필요한 작업을 확인합니다."],["03","일정·견적 안내","작업 가능 기사와 일정을 확인해 안내합니다."],["04","현장 작업","확정한 일정에 맞춰 작업을 진행합니다."]].map(([n,t,d])=><li key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

      <section className="faq section"><div className="section-title"><p>FAQ</p><h2>신청 전,<br /><em>이것만 확인하세요.</em></h2></div><div>{[["당일 작업도 가능한가요?","지역과 접수 시간, 기사 일정에 따라 달라집니다. 접수 후 가장 빠른 가능 일정을 확인해드립니다."],["중고 에어컨도 설치하나요?","중고 제품 설치와 매입·판매 모두 문의할 수 있습니다. 제품과 현장 상태를 먼저 확인합니다."],["철거만 따로 요청할 수 있나요?","가능합니다. 철거 위치와 제품 종류, 이동 여부를 남겨주세요."],["수리비는 어떻게 정해지나요?","증상과 제품, 부품 및 냉매 상태에 따라 달라집니다. 전화 확인 후 필요한 점검 절차를 안내합니다."],["출장비나 추가비용이 있나요?","지역과 작업 조건에 따라 발생할 수 있어 작업 확정 전에 확인할 항목을 안내드립니다."]].map(([q,a])=><details key={q}><summary>{q}<i>+</i></summary><p>{a}</p></details>)}</div></section>

      <section className="final"><div><p>아직도 업체만 찾고 계신가요?</p><h2>더 더워지기 전에<br /><em>가능한 일정부터 잡으세요.</em></h2><span>30초 신청으로 지역과 작업 가능 여부를 확인하세요.</span></div><LeadForm compact /></section>
      <footer><div className="brand"><i>에어컨</i><span>설치·수리·중고</span></div><p>상호·대표자·사업자등록번호·주소·연락처 입력 예정</p><p>© 2026. All rights reserved.</p></footer>
      <nav className="sticky"><a href="#estimate">내 지역 빠른 견적 받기 <b>→</b></a></nav>
    </main>
  );
}
