"use client";

import { FormEvent, useEffect, useState } from "react";

const LEAD_API_URL = "https://kimdaegon-aircon.bbinge95.chatgpt.site/api/leads";

const services = [
  ["이전설치", "출발·도착 지역과 철거·설치 희망일을 알려주세요. 가정과 사업장 모두 상담합니다."],
  ["철거", "이사·매장 정리로 남은 제품, 철거만 필요한 경우에도 작업 조건을 확인합니다."],
  ["중고 매입", "모델·연식·작동 상태에 따라 매입 여부를 확인합니다. 철거·수거 조건도 함께 문의하세요."],
  ["중고 구매·설치", "냉난방 기능과 공간·예산에 맞는 제품을 문의하세요. 실제 재고와 설치비를 확인합니다."],
];

const areas = ["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주"];

const workPhotos = [
  ["/images/install.webp", "실내기 설치", "벽걸이 설치"],
  ["/images/service.webp", "제품 점검", "현장 점검"],
  ["/images/roof.webp", "옥상 작업", "실외기 설치"],
  ["/images/work.webp", "실외기 작업", "배관·실외기"],
  ["/images/removal-load.jpg", "철거한 실내기와 실외기를 차량에 적재한 모습", "철거 제품 반출"],
  ["/images/removal-units.jpg", "철거 후 한 공간에 모아둔 실내기와 실외기", "철거 후 제품 정리"],
  ["/images/unit.webp", "제품 설치", "설치 완료"],
];

function LeadForm({ compact = false, selected = "" }: { compact?: boolean; selected?: string }) {
  const [sent, setSent] = useState(false);
  const [inquiry, setInquiry] = useState(selected);
  useEffect(() => { if (selected) setInquiry(selected); }, [selected]);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setFormError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    try {
      const response = await fetch(LEAD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: data.get("region"), inquiryType: data.get("inquiryType"), airconType: data.get("airconType"), phone: data.get("phone"), consent: data.get("consent") === "on", companyWebsite: data.get("companyWebsite"),
          sourceUrl: window.location.origin + window.location.pathname, referrer: document.referrer ? new URL(document.referrer).origin : null, consentVersion: "2026-09-13",
          utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"), utmCampaign: params.get("utm_campaign"), utmContent: params.get("utm_content"), utmTerm: params.get("utm_term"),
        }),
      });
      const responseText = await response.text();
      let result: { error?: string } = {};
      try { result = JSON.parse(responseText) as { error?: string }; } catch { throw new Error("접수 서버 연결에 실패했습니다. 전화 상담 010-9183-2200으로 연락해주세요."); }
      if (!response.ok) throw new Error(result.error || "접수에 실패했습니다.");
      setSent(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "접수에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  if (sent) return <div className="thanks"><strong>접수가 완료됐습니다.</strong><span>확인 후 작업 가능 지역과 일정을 안내드리겠습니다.</span></div>;

  return (
    <form className={`lead-form ${compact ? "compact" : ""}`} onSubmit={submit} id={compact ? "final-form" : "estimate"}>
      <label className="hp-field" aria-hidden="true">홈페이지<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label>
      <div className="form-heading"><span>김대곤 대표 직접 상담</span><h2>필요한 작업부터 알려주세요</h2></div>
      <div className="form-grid">
        <label><span>지역</span><select name="region" required defaultValue=""><option value="" disabled>지역을 선택하세요</option>{areas.map(a => <option key={a}>{a}</option>)}<option>기타 지역</option></select></label>
        <label><span>문의 유형</span><select name="inquiryType" required value={inquiry} onChange={e => setInquiry(e.target.value)}><option value="" disabled>필요한 작업을 선택하세요</option><option>이전설치</option><option>신규 설치</option><option>철거</option><option>중고 매입 문의</option><option>중고 구매</option><option>기타</option></select></label>
        <label><span>제품 종류</span><select name="airconType" required defaultValue=""><option value="" disabled>제품 종류를 선택하세요</option><option>벽걸이</option><option>스탠드</option><option>2in1</option><option>시스템</option><option>업소용</option><option>냉난방기</option><option>잘 모르겠음</option></select></label>
        <label><span>연락처</span><input name="phone" required inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" pattern="01[016789]-?[0-9]{3,4}-?[0-9]{4}" /></label>
      </div>
      <details className="consent-summary"><summary>개인정보 수집·이용 안내</summary><p>목적: 상담 접수, 작업 가능 여부 확인 및 견적 안내<br />항목: 지역, 문의 유형, 제품 종류, 연락처 및 접수·유입 정보<br /><strong>미계약 상담 정보는 상담 종료 후 3개월 보관 후 삭제합니다.</strong><br />동의를 거부할 수 있으며, 거부 시 온라인 접수가 제한됩니다. 자세한 내용은 개인정보처리방침을 확인해주세요.</p></details>
      <label className="agree"><input name="consent" type="checkbox" required /> <span>[필수] 개인정보 수집·이용 동의</span> <a href="/privacy">내용 보기</a></label>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <button className="submit" type="submit" disabled={sending}><span>{sending ? "접수 중입니다" : "상담 요청하기"}</span><b aria-hidden="true">→</b></button>
      <p className="form-note">신청만으로 결제나 예약이 확정되지 않습니다. 김대곤 대표가 확인 후 연락드립니다.</p>
    </form>
  );
}

export default function Home() {
  const [selected, setSelected] = useState("");
  const choose = (type: string) => setSelected(type);
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = document.querySelectorAll(
      ".section-title, .situation-grid article, .audience-banner, .service-grid article, .work-copy, .photo-grid, .factors span, .area-section > div, .process li, .faq details, .final > div, .final .lead-form"
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      (element as HTMLElement).style.setProperty("--reveal-order", String(index % 4));
    });

    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    revealTargets.forEach(element => observer.observe(element));

    let ticking = false;
    const updateScroll = () => {
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll-progress", `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
      root.classList.toggle("has-scrolled", window.scrollY > 90);
      if (!reduced && window.innerWidth > 800) {
        root.style.setProperty("--hero-parallax", `${Math.min(window.scrollY * 0.12, 72)}px`);
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      root.classList.remove("has-scrolled");
    };
  }, []);

  return (
    <main>
      <div className="scroll-progress" aria-hidden="true" />
      <header className="topbar"><a className="brand" href="#top"><i>에어컨·냉난방기</i><span>이전설치·철거·중고</span></a><nav className="desktop-nav" aria-label="주요 메뉴"><a href="#service">서비스</a><a href="#work">작업 현장</a><a href="#area">서비스 지역</a><a href="#faq">자주 묻는 질문</a></nav><a className="top-cta" href="#estimate">상담 문의</a></header>
      <aside className="quick-rail" aria-label="빠른 이동 메뉴">
        <a className="quick-rail-cta" href="#estimate"><b>30초</b><span>빠른 문의</span></a>
        <a href="#situations"><i>01</i><span>신청 상황</span></a>
        <a href="#service"><i>02</i><span>서비스</span></a>
        <a href="#work"><i>03</i><span>작업 현장</span></a>
        <a href="#area"><i>04</i><span>지역</span></a>
        <a href="#faq"><i>05</i><span>FAQ</span></a>
        <a className="quick-rail-call" href="tel:01091832200"><b>☎</b><span>전화 상담</span></a>
        <a className="quick-rail-top" href="#top" aria-label="맨 위로 이동">↑ TOP</a>
      </aside>

      <section className="hero" id="top">
        <div className="hero-image" role="img" aria-label="에어컨 현장 작업 사진" />
        <div className="hero-shade" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span /> 대전·세종·충청권 중심 · 가정부터 사업장까지</p>
            <h1><span>에어컨·냉난방기</span><em><span>옮길 때도,</span><span>새로 들일 때도.</span></em></h1>
            <p className="hero-sub">집 이사부터 사무실·식당·카페 이전까지.<br />이전설치·철거·중고 매입과 구매를 상담하세요.</p>
            <div className="intent-links">{[["이전설치","옮기고 싶어요"],["중고 매입 문의","철거·판매하고 싶어요"],["중고 구매","구매하고 싶어요"]].map(([value,label]) => <a key={value} href="#estimate" onClick={() => choose(value)}>{label}<b>↗</b></a>)}</div>
            <div className="trust-row"><span>✓ 실제 현장 사진</span><span>✓ 김대곤 대표 직접 상담</span><span>✓ 이전·매입·구매 상담</span></div>
            <div className="hero-guide"><strong>옮길지, 팔지 아직 정하지 못하셨나요?</strong><span>기존 제품과 새 공간에 필요한 작업부터 함께 확인합니다.</span></div>
          </div>
          <LeadForm selected={selected} />
        </div>
        <a className="scroll-cue" href="#situations"><span>SCROLL</span><i><b /></i><small>아래로 내려 더 보기</small></a>
      </section>

      <section className="quick-strip"><strong>에어컨·냉난방기, 필요한 작업을 상담하세요.</strong><div>{["이전설치", "철거", "중고 매입", "중고 판매", "신규 설치"].map(x => <span key={x}>{x}</span>)}</div></section>

      <section className="conversion-banner" aria-label="빠른 상담 안내">
        <div><p>사무실·식당·카페의 겨울 준비</p><h2>새 공간에 필요한 냉난방기,<br />구매와 설치를 함께 상담하세요.</h2><span>공간과 예산에 맞는 제품, 난방 기능과 설치 조건을 확인합니다.</span></div>
        <div className="conversion-actions"><a href="#estimate"><small>비용 결제 없이</small><strong>문의 남기기</strong><b>→</b></a><a className="conversion-call" href="tel:01091832200"><small>바로 연결하기</small><strong>010-9183-2200</strong><b>☎</b></a></div>
      </section>

      <section className="situations section" id="situations">
        <div className="section-title situations-title"><p>WHEN TO ASK</p><h2>옮기는 공간도, 필요한 일도.<br /><em>내 상황에 맞춰 문의하세요.</em></h2><span>가정의 이사, 사업장의 이전과 개업, 사용하던 제품의 정리까지 상담합니다.</span></div>
        <div className="situation-grid">
          <article>
            <div className="situation-icon">01</div><p className="situation-label">이전설치 · 신규설치</p><h3>집·사무실·매장을<br />옮길 예정이라면</h3>
            <ul><li>이사하면서 기존 에어컨을 옮겨야 할 때</li><li>철거일과 설치일을 조율해야 할 때</li><li>사무실·식당·카페의 제품을 옮길 때</li><li>철거와 재설치를 한 번에 맡기고 싶을 때</li></ul>
            <a href="#estimate" onClick={() => choose("이전설치")}>이전설치 상담하기 <b>→</b></a>
          </article>
          <article>
            <div className="situation-icon">02</div><p className="situation-label">철거 · 중고 매입</p><h3>남겨둘 제품,<br />정리가 필요하다면</h3>
            <ul><li>이사하며 기존 제품을 정리하고 싶을 때</li><li>사무실·매장 정리로 철거가 필요할 때</li><li>여러 대의 제품을 함께 문의하고 싶을 때</li><li>사용하던 제품의 매입 가능 여부가 궁금할 때</li></ul>
            <a href="#estimate" onClick={() => choose("중고 매입 문의")}>철거·매입 문의하기 <b>→</b></a>
          </article>
          <article>
            <div className="situation-icon">03</div><p className="situation-label">중고 구매</p><h3>새 제품 가격 앞에서<br />망설이고 있다면</h3>
            <ul><li>예산에 맞는 중고 제품을 찾고 있을 때</li><li>사무실·식당·카페에 냉난방기가 필요할 때</li><li>제품 구매와 설치를 함께 문의하고 싶을 때</li><li>난방 기능과 공간에 맞는 용량이 궁금할 때</li></ul>
            <a href="#estimate" onClick={() => choose("중고 구매")}>예산에 맞춰 문의하기 <b>→</b></a>
          </article>
        </div>
        <div className="audience-banner"><div><span>가정의 이사부터 사업장 이전까지</span><strong>옮길 제품과 새로 필요한 제품을 함께</strong><p>가정집은 물론 기업·사무실·소상공인 매장도 가능합니다. 공간과 설치 환경을 확인해 제품과 작업 가능 여부를 안내드립니다.</p></div><div className="audience-types">{["아파트·주택", "원룸·오피스텔", "기업·사무실", "카페·음식점", "미용실·학원", "일반 매장"].map(x=><span key={x}>✓ {x}</span>)}</div></div>
      </section>

      <section className="section service-section" id="service">
        <div className="section-title"><p>WHAT WE DO</p><h2>이전설치부터 철거·매입,<br /><em>중고 구매와 설치까지.</em></h2><span>에어컨과 냉난방기의 제품 상태·현장 조건을 확인해 가능한 작업을 안내합니다.</span></div>
        <div className="service-grid">{services.map(([title, desc], i) => <article key={title}><b>0{i + 1}</b><h3>{title}</h3><p>{desc}</p><a href="#estimate" onClick={() => choose(["이전설치","철거","중고 매입 문의","중고 구매"][i])}>가능 여부 확인 →</a></article>)}</div>
      </section>

      <section className="work-section" id="work">
        <div className="work-copy"><p>REAL WORK</p><h2><span>설치하는 순간부터</span><span>철거·반출까지.</span><em>실제 현장입니다.</em></h2><span>벽걸이 설치와 실외기 작업, 철거 제품 반출 현장입니다. 철거 사진 속 제품은 판매 재고를 의미하지 않습니다.</span><a href="#estimate">내 현장 상담하기 →</a></div>
        <div className="work-gallery" aria-label="실제 에어컨 작업 사진 슬라이드">
          <div className="gallery-head"><span><i /> 실제 현장 사진 7장</span><small>마우스를 올리면 멈춥니다</small></div>
          <div className="gallery-viewport">
            <div className="gallery-track">{[...workPhotos, ...workPhotos].map(([src, alt, label], index) => <figure key={`${src}-${index}`} aria-hidden={index >= workPhotos.length}><img src={src} loading="lazy" decoding="async" width={1920} height={2560} alt={index < workPhotos.length ? alt : ""} /><figcaption><span>{String((index % workPhotos.length) + 1).padStart(2,"0")}</span>{label}</figcaption></figure>)}</div>
          </div>
          <div className="gallery-hint"><span>←</span> 옆으로 밀어 더 보기 <span>→</span></div>
        </div>
      </section>

      <section className="price-section section">
        <div className="section-title"><p>PRICE CHECK</p><h2>견적을 받을 때,<br /><em>포함되는 비용까지 확인하세요.</em></h2></div>
        <div className="factors">{["제품 종류·대수", "철거 비용", "운반·이전 거리", "설치 비용", "배관·실외기 위치", "추가 작업", "매입·수거 조건", "제품 가격·보증"].map((x,i)=><span key={x}><b>{String(i+1).padStart(2,"0")}</b>{x}</span>)}</div>
        <p className="price-note">이전설치는 철거·운반·설치의 포함 범위를, 매입은 금액과 수거 비용을 확인합니다.<br />중고 구매는 제품 가격과 설치비, 보증 조건을 구분해 상담하세요.</p>
      </section>

      <section className="area-section" id="area">
        <div><p>WORK AREA</p><h2>거리 때문에 포기하기 전에<br /><em>우리 동네부터 확인하세요.</em></h2><span>대전·세종·충청권 중심, 전북 일부 지역까지 상담합니다. 기타 지역도 기사 일정과 작업 가능 여부를 확인해 안내드립니다.</span><a href="#estimate">내 지역 지금 확인 →</a></div>
        <div className="area-card"><strong>주요 상담 지역</strong><div>{areas.map(a=><span key={a}>{a}</span>)}</div><small>※ 접수 시점과 작업 조건에 따라 가능 여부가 달라질 수 있습니다.</small></div>
      </section>

      <section className="process section"><div className="section-title"><p>HOW IT WORKS</p><h2>복잡한 설명은 줄이고,<br /><em>결정에 필요한 것만.</em></h2></div><ol>{[["01","30초 신청","지역·작업·연락처만 남겨주세요."],["02","상황 확인","제품과 현장 조건을 대표가 직접 확인합니다."],["03","일정·견적 안내","작업 범위와 비용, 가능한 일정을 안내합니다."],["04","현장 작업","확정한 일정과 내용에 맞춰 작업합니다."]].map(([n,t,d])=><li key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

      <section className="faq section" id="faq"><div className="section-title"><p>FAQ</p><h2>망설이는 이유,<br /><em>여기서 먼저 풀어보세요.</em></h2></div><div>{[["사무실·식당·카페도 이전설치할 수 있나요?","네. 가정과 사업장 모두 상담합니다. 출발·도착 지역, 제품 종류와 대수, 희망일을 알려주시면 현장 조건과 작업 가능 여부를 확인합니다."],["철거만 하거나 중고 매입도 문의할 수 있나요?","철거만 필요한 경우와 매입을 원하는 경우를 구분해 상담합니다. 매입 여부와 금액은 제품 상태에 따라 달라지며 철거·수거 비용도 함께 확인합니다."],["냉난방기 중고 구매와 설치를 함께 문의할 수 있나요?","네. 사용할 공간과 예산을 알려주세요. 실제 재고, 제품의 난방 기능, 용량과 설치 조건을 확인합니다."],["중고 제품 가격에 설치비가 포함되나요?","제품과 현장에 따라 달라집니다. 제품 가격, 설치비와 추가 작업비의 포함 여부 및 보증 조건을 구매 전에 확인해주세요."],["신청하면 바로 예약되나요?","온라인 신청은 상담 요청입니다. 대표가 작업 가능 여부와 비용·일정을 안내하고 고객과 합의한 뒤 진행합니다."]].map(([q,a])=><details key={q}><summary>{q}<i>+</i></summary><p>{a}</p></details>)}</div></section>

      <section className="final"><div><p>집·사무실·식당·카페의 에어컨·냉난방기</p><h2>옮길 때도, 정리할 때도.<br /><em>필요한 작업부터 물어보세요.</em></h2><span>문의만으로 예약이나 결제가 확정되지 않습니다. 대표가 확인 후 안내합니다.</span></div><LeadForm compact selected={selected} /></section>
      <footer><div className="footer-top"><div className="brand"><i>에어컨·냉난방기</i><span>이전설치·철거·중고</span></div><nav><a href="/terms">서비스 이용안내</a><a href="/privacy"><strong>개인정보처리방침</strong></a></nav></div><div className="business-info"><p>상호 에어컨설치.에어컨이전설치.에어컨중고판매<br />대표자 김대곤　 사업자등록번호 801-39-00586</p><p>사업장 주소 대전광역시 서구 도산로 209-1, 1층(변동)　 대표전화 <a href="tel:01091832200"><strong>010-9183-2200</strong></a></p><p>개인정보 보호책임자 김대곤　 연락처 <a href="tel:01091832200"><strong>010-9183-2200</strong></a></p></div><p className="copyright">© 2026 에어컨설치.에어컨이전설치.에어컨중고판매. All rights reserved.</p></footer>
      <nav className="sticky"><a className="sticky-estimate" href="#estimate"><span>문의 남기기</span><small>이전·매입·구매</small><b>→</b></a><a className="sticky-call" href="tel:01091832200"><span>전화 상담</span><small>010-9183-2200</small><b>☎</b></a></nav>
    </main>
  );
}
