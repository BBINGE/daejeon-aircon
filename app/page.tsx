"use client";

import { useEffect } from "react";
import DesktopLeadForm from "./components/DesktopLeadForm";

const PHONE = "tel:01091832200";
const SMS = "sms:01091832200";

const areas = ["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주"];

const workPhotos = [
  ["/images/install.webp", "난간 옆 실외기 배관 작업 현장", "실외기 배관 작업", "난간 옆 실외기에 장비를 연결해 작업하는 모습입니다."],
  ["/images/service.webp", "제품 점검", "현장 점검"],
  ["/images/roof.webp", "옥상 작업", "실외기 설치"],
  ["/images/work.webp", "실외기 작업", "배관·실외기"],
  ["/images/removal-load.jpg", "철거한 실내기와 실외기를 차량에 적재한 모습", "철거 제품 반출", "철거한 실내기와 실외기를 차량에 적재한 모습입니다."],
  ["/images/removal-units.jpg", "철거 후 한 공간에 모아둔 실내기와 실외기", "철거 후 제품 정리", "여러 대의 실내기와 실외기를 한 공간에 모아둔 모습입니다."],
  ["/images/unit.webp", "제품 설치", "설치 완료"],
];


function ServiceIcon({ kind }: { kind: string }) {
  const paths: Record<string,string> = {
    home: 'M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7',
    truck: 'M2 6h12v12H2zM14 10h4l4 5v3h-8M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    air: 'M3 5h18v11H3zM6 12h12M7 16v4M12 16v6M17 16v4',
    camera: 'M3 7h5l2-3h4l2 3h5v14H3zM16 13a4 4 0 1 0-8 0 4 4 0 0 0 8 0',
    check: 'M7 3h10v3h4v16H3V6h4zM7 3v5h10V3M7 15l3 3 7-7',
    chat: 'M3 3h18v14H9l-6 5zM7 8h10M7 12h7',
    coin: 'M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9M12 6v12',
    tool: 'm14 5 5 5M3 21l8-8M14 3a6 6 0 0 0-7 8L2 16v5h5l5-5a6 6 0 0 0 9-7l-5 5-6-6z'
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind] || paths.air} /></svg>;
}
function ServiceFlow({ steps }: { steps: [string,string][] }) {
  return <ol className="service-flow" aria-label="서비스 진행 흐름">{steps.map(([icon,label],i)=><li key={label}><div className="flow-icon"><ServiceIcon kind={icon}/><small>0{i+1}</small></div><span>{label}</span>{i<steps.length-1 && <b aria-hidden="true">→</b>}</li>)}</ol>;
}
function AreaDiagram() {
  return <figure className="area-diagram"><div className="map-label"><span>대전 중심</span><strong>주요 상담 지역 안내</strong></div><svg viewBox="0 0 520 390" role="img" aria-label="대전을 중심으로 세종, 충청권, 전북 일부의 상담 지역을 표시한 개략 안내도">
    <defs><pattern id="area-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#bdd2e6"/></pattern></defs><rect width="520" height="390" rx="18" fill="url(#area-dots)"/>
    <path d="M260 210 175 72M260 210 355 74M260 210 220 125M260 210 125 170M260 210 143 263M260 210 345 260M260 210 385 187M260 210 178 340M260 210 340 340" fill="none" stroke="#90b4d7" strokeWidth="2" strokeDasharray="5 7"/>
    <circle cx="260" cy="210" r="42" fill="#1677f0" fillOpacity=".09"/><circle cx="260" cy="210" r="29" fill="#1677f0"/><text x="260" y="216" textAnchor="middle" fill="white" fontSize="17" fontWeight="800">대전</text>
    {[[175,72,'천안'],[355,74,'청주'],[220,125,'세종·조치원'],[125,170,'공주'],[143,263,'계룡·논산·부여'],[345,260,'금산'],[385,187,'옥천'],[178,340,'익산·전주'],[340,340,'무주']].map(([x,y,label])=><g key={label}><circle cx={x} cy={y} r="5" fill="#1677f0" stroke="white" strokeWidth="2"/><text x={x} y={Number(y)-14} textAnchor="middle" fill="#284c69" fontSize="18" fontWeight="700">{label}</text></g>)}
  </svg><figcaption>상담 지역을 묶어 표현한 안내도입니다. 실제 거리·경계와는 다릅니다.</figcaption></figure>;
}

function ContactCard({ compact = false }: { compact?: boolean }) {
  return <div className="contact-card" id={compact ? "final-contact" : "estimate"}>
    <span className="contact-badge">김대곤 대표 직접 상담</span>
    <h2>필요한 작업,<br />전화로 편하게 말씀해 주세요.</h2>
    <p className="contact-intro">이전설치·철거·중고 냉난방기 매입과 구매를 상담합니다.</p>
    <a className="contact-phone" href={PHONE}><span>대표님께 전화하기</span><strong>010-9183-2200</strong></a>
    <a className="contact-sms" href={SMS}>문자로 먼저 문의하기 <b aria-hidden="true">↗</b></a>
    <a className="contact-pc-form" href="#pc-inquiry">PC에서 전화 상담 신청하기 →</a>
    <p className="contact-help">통화가 어려우시면 지역과 필요한 작업을 문자로 남겨주세요. 제품 사진도 같은 번호로 보내시면 됩니다.</p>
    <p className="contact-fallback">버튼이 열리지 않으면 휴대폰에서 위 번호로 연락해주세요.</p>
  </div>;
}

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = document.querySelectorAll(
      ".section-title, .situation-grid article, .audience-banner, .service-grid article, .work-copy, .photo-grid, .factors span, .area-section > div, .process li, .faq details, .final > div, .final .contact-card"
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
      <header className="topbar"><a className="brand" href="#top"><i>냉난방기설치매입</i><span>이전설치·철거·중고</span></a><nav className="desktop-nav" aria-label="주요 메뉴"><a href="#service">서비스</a><a href="#work">작업 현장</a><a href="#area">서비스 지역</a><a href="#faq">자주 묻는 질문</a><a href="#pc-inquiry">상담 신청</a></nav><a className="top-cta" href={PHONE} aria-label="김대곤 대표에게 전화하기 010-9183-2200"><span aria-hidden="true">☎</span>010-9183-2200</a></header>
      <aside className="quick-rail" aria-label="빠른 이동 메뉴">
        <a className="quick-rail-cta" href={PHONE}><b>전화</b><span>대표님께 문의</span></a>
        <a href="#situations"><i>01</i><span>신청 상황</span></a>
        <a href="#service"><i>02</i><span>서비스</span></a>
        <a href="#work"><i>03</i><span>작업 현장</span></a>
        <a href="#area"><i>04</i><span>지역</span></a>
        <a href="#faq"><i>05</i><span>FAQ</span></a>
        <a className="quick-rail-call" href="tel:01091832200"><b>☎</b><span>전화 상담</span></a>
        <a className="quick-rail-top" href="#top" aria-label="맨 위로 이동">↑ TOP</a>
      </aside>

      <section className="hero story-hero" id="top">
        <div className="hero-image" role="img" aria-label="에어컨 실제 작업 현장" />
        <div className="hero-shade" />
        <div className="hero-inner">
          <p className="eyebrow">대전·세종·충청권 중심 · 가정부터 사업장까지</p>
          <h1>에어컨·냉난방기,<br /><em>옮기고 설치하고<br className="mobile-break" /> 정리할 때.</em></h1>
          <p className="hero-sub">이사하는 집에도, 새로 여는 매장에도.<br />필요한 제품과 작업을 함께 상담합니다.</p>
          <div className="hero-services" aria-label="상담 서비스"><span><ServiceIcon kind="air"/>에어컨 설치</span><span><ServiceIcon kind="truck"/>이전설치</span><span><ServiceIcon kind="tool"/>철거</span><span><ServiceIcon kind="coin"/>중고 매입</span><span><ServiceIcon kind="air"/>중고 에어컨 판매</span></div>
          <a className="hero-inquiry" href="#estimate">무엇이든 물어보세요 <span aria-hidden="true">↓</span></a>
          <p className="hero-signature">김대곤 대표 직접 상담 · 실제 현장 사진</p>
        </div>
      </section>

      <section className="ask-section" id="estimate">
        <p className="section-kicker">내 상황부터 편하게</p>
        <h2>무엇이든 물어보세요!</h2>
        <p className="ask-intro">내 제품도 가능한지, 우리 지역까지 오는지, 비용은 얼마나 들지.<br />김대곤 대표에게 전화나 문자로 편하게 물어보세요.</p>
        <div className="ask-actions"><a href={PHONE}>전화로 물어보기 <span>010-9183-2200</span></a><a href={SMS}>문자로 물어보기 <span>제품 사진도 같은 번호로</span></a></div>
        <DesktopLeadForm />
        <p className="ask-note">문의만으로 예약이 확정되지 않아요. 작업과 비용·일정을 상담한 뒤 결정하세요.</p>
      </section>

      <section className="service-stories" id="situations">
        <div className="stories-heading" id="service"><p className="section-kicker">이런 일을 도와드립니다</p><h2>지금 필요한 일,<br /><em>여기서 함께 확인하세요.</em></h2></div>
        <article className="service-story">
          <figure><img src="/images/unit.webp" alt="실외기와 배관을 작업하는 실제 현장" width="1350" height="1800" loading="lazy" /><figcaption>실제 실외기 작업 현장</figcaption><ServiceFlow steps={[["home","기존 공간"],["truck","운반"],["air","새 공간 설치"]]}/></figure>
          <div className="story-copy"><p className="story-number">01 <span>이전설치</span></p><h3>이사하는데,<br />에어컨도 옮겨야 해요.</h3><p>기존 제품 철거부터 새 공간의 설치까지.<br />집·사무실·식당·카페의 이전을 상담합니다.</p><ul><li>출발·도착 지역과 희망일 확인</li><li>철거일과 설치일 조율</li><li>제품 종류·대수와 현장 조건 확인</li></ul><a href="#estimate">이전설치 물어보기 →</a></div>
        </article>
        <article className="service-story story-dark">
          <figure><img src="/images/removal-load.jpg" alt="철거한 에어컨과 실외기를 차량에 적재한 현장" width="1920" height="2560" loading="lazy" /><figcaption>철거·반출 현장 사진이며 판매 재고가 아닙니다.</figcaption><ServiceFlow steps={[["camera","제품 사진"],["check","상태 확인"],["chat","매입 여부 안내"]]}/></figure>
          <div className="story-copy"><p className="story-number">02 <span>철거 · 중고 매입</span></p><h3>안 쓰는 냉난방기,<br />팔 수 있을까요?</h3><p>이사나 매장 정리로 남은 제품.<br />제품 상태와 철거 조건을 함께 확인합니다.</p><ul><li>모델·연식·작동 상태에 따른 매입 가능 여부</li><li>철거·수거 비용과 작업 조건 확인</li><li>철거만 필요하거나 여러 대여도 상담</li></ul><a href="#estimate">철거·매입 물어보기 →</a></div>
        </article>
        <article className="service-story story-blue">
          <figure><img src="/images/service.webp" alt="실내기를 준비하고 작업하는 실제 현장" width="1800" height="1013" loading="lazy" /><figcaption>실제 실내기 작업 현장</figcaption><ServiceFlow steps={[["home","공간·예산"],["air","제품 확인"],["chat","설치 상담"]]}/></figure>
          <div className="story-copy"><p className="story-number">03 <span>중고 에어컨 판매 · 설치</span></p><h3>중고로 구매하고<br />설치까지 맡기고 싶어요.</h3><p>공간과 예산에 맞는 제품을 함께 확인해요.<br />가정은 물론 새로 여는 사무실·매장도 상담합니다.</p><ul><li>판매 가능한 제품의 기능·용량 확인</li><li>제품 가격과 설치·추가 작업비 구분</li><li>제품 상태·보증 조건을 상담 후 결정</li></ul><a href="#estimate">구매·설치 물어보기 →</a></div>
        </article>
      </section>

      <section className="work-section" id="work">
        <div className="work-copy"><p>REAL WORK</p><h2><span>설치하는 순간부터</span><span>철거·반출까지.</span><em>실제 현장입니다.</em></h2><span>벽걸이 설치와 실외기 작업, 철거 제품 반출 현장입니다. 철거 사진 속 제품은 판매 재고를 의미하지 않습니다.</span><a href="#estimate">내 현장 상담하기 →</a></div>
        <div className="work-gallery" aria-label="실제 에어컨 작업 사진 슬라이드">
          <div className="gallery-head"><span><i /> 실제 현장 사진 7장</span><small>마우스를 올리면 멈춥니다</small></div>
          <div className="gallery-viewport">
            <div className="gallery-track">{[...workPhotos, ...workPhotos].map(([src, alt, label, detail], index) => <figure key={`${src}-${index}`} aria-hidden={index >= workPhotos.length}><img src={src} loading="lazy" decoding="async" width={1920} height={2560} alt={index < workPhotos.length ? alt : ""} /><figcaption><span>{String((index % workPhotos.length) + 1).padStart(2,"0")}</span><div>{label}{detail && <p>{detail}</p>}</div></figcaption></figure>)}</div>
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
        <div className="area-visual"><AreaDiagram/><div className="area-card"><strong>주요 상담 지역</strong><div>{areas.map(a=><span key={a}>{a}</span>)}</div><small>※ 문의 시점과 작업 조건에 따라 가능 여부가 달라질 수 있습니다.</small></div></div>
      </section>

      <section className="process section"><div className="section-title"><p>HOW IT WORKS</p><h2>복잡한 설명은 줄이고,<br /><em>결정에 필요한 것만.</em></h2></div><ol>{[["01","전화·문자 상담","대표님 번호로 지역과 필요한 작업을 말씀해주세요."],["02","상황 확인","제품과 현장 조건을 대표가 직접 확인합니다."],["03","일정·견적 안내","작업 범위와 비용, 가능한 일정을 안내합니다."],["04","현장 작업","확정한 일정과 내용에 맞춰 작업합니다."]].map(([n,t,d])=><li key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

      <section className="faq section" id="faq"><div className="section-title"><p>FAQ</p><h2>망설이는 이유,<br /><em>여기서 먼저 풀어보세요.</em></h2></div><div>{[["사무실·식당·카페도 이전설치할 수 있나요?","네. 가정과 사업장 모두 상담합니다. 출발·도착 지역, 제품 종류와 대수, 희망일을 알려주시면 현장 조건과 작업 가능 여부를 확인합니다."],["철거만 하거나 중고 매입도 문의할 수 있나요?","철거만 필요한 경우와 매입을 원하는 경우를 구분해 상담합니다. 매입 여부와 금액은 제품 상태에 따라 달라지며 철거·수거 비용도 함께 확인합니다."],["냉난방기 중고 구매와 설치를 함께 문의할 수 있나요?","네. 사용할 공간과 예산을 알려주세요. 실제 재고, 제품의 난방 기능, 용량과 설치 조건을 확인합니다."],["중고 제품 가격에 설치비가 포함되나요?","제품과 현장에 따라 달라집니다. 제품 가격, 설치비와 추가 작업비의 포함 여부 및 보증 조건을 구매 전에 확인해주세요."],["통화가 어렵거나 제품 사진을 보내고 싶어요.","010-9183-2200으로 지역과 필요한 작업을 문자로 남겨주세요. 제품 사진도 같은 번호로 보내시면 됩니다. 문의만으로 예약이 확정되지는 않으며, 작업 범위와 비용·일정을 상담한 뒤 결정합니다."]].map(([q,a])=><details key={q}><summary>{q}<i>+</i></summary><p>{a}</p></details>)}</div></section>

      <section className="final"><div><p>집·사무실·식당·카페의 에어컨·냉난방기</p><h2>옮길 때도, 정리할 때도.<br /><em>필요한 작업부터 물어보세요.</em></h2><span>문의만으로 예약이나 결제가 확정되지 않습니다. 대표가 확인 후 안내합니다.</span></div><ContactCard compact /></section>
      <footer><div className="footer-top"><div className="brand"><i>냉난방기설치매입</i><span>이전설치·철거·중고</span></div><nav><a href="/terms">서비스 이용안내</a><a href="/privacy"><strong>개인정보처리방침</strong></a></nav></div><div className="business-info"><p>상호 에어컨설치.에어컨이전설치.에어컨중고판매<br />대표자 김대곤　 사업자등록번호 801-39-00586</p><p>사업장 주소 대전광역시 서구 도산로 209-1, 1층(변동)　 대표전화 <a href="tel:01091832200"><strong>010-9183-2200</strong></a></p><p>개인정보 보호책임자 김대곤　 연락처 <a href="tel:01091832200"><strong>010-9183-2200</strong></a></p></div><p className="copyright">© 2026 에어컨설치.에어컨이전설치.에어컨중고판매. All rights reserved.</p></footer>
      <nav className="sticky" aria-label="전화·문자 문의"><a className="sticky-call" href={PHONE}><span>대표님께 전화</span><small>010-9183-2200</small><b>☎</b></a><a className="sticky-sms" href={SMS}><span>문자 문의</span><small>사진도 같은 번호로</small><b>↗</b></a></nav>
    </main>
  );
}
