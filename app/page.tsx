"use client";

import { FormEvent, useEffect, useState } from "react";

const services = [
  ["에어컨 수리", "찬바람이 약하거나 물이 떨어지면 더 기다리지 마세요."],
  ["에어컨 설치", "벽걸이부터 스탠드·2in1·업소용까지 설치 일정을 확인하세요."],
  ["에어컨 이전설치", "이사 날짜가 잡혔다면 철거와 재설치 일정부터 확인하세요."],
  ["중고 에어컨 판매", "예산과 공간에 맞는 중고 제품 구매·설치를 함께 문의하세요."],
];

const areas = ["대전", "세종·조치원", "청주", "천안", "공주", "계룡", "논산", "부여", "금산", "옥천", "전주", "익산", "무주"];

const workPhotos = [
  ["/images/install.webp", "실내기 설치", "벽걸이 설치"],
  ["/images/service.webp", "제품 점검", "현장 점검"],
  ["/images/roof.webp", "옥상 작업", "실외기 설치"],
  ["/images/work.webp", "실외기 작업", "배관·실외기"],
  ["/images/repair.webp", "수리 작업", "에어컨 수리"],
  ["/images/outdoor.webp", "외부 작업", "실외기 점검"],
  ["/images/unit.webp", "제품 설치", "설치 완료"],
];

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
        <label><span>문의 유형</span><select required defaultValue=""><option value="" disabled>필요한 작업을 선택하세요</option><option>에어컨 수리</option><option>에어컨 설치</option><option>에어컨 이전설치</option><option>중고 에어컨 구매</option><option>중고 에어컨 매입 문의</option><option>가스 충전</option><option>철거</option><option>기타</option></select></label>
        <label><span>에어컨 종류</span><select required defaultValue=""><option value="" disabled>제품 종류를 선택하세요</option><option>벽걸이</option><option>스탠드</option><option>2in1</option><option>시스템</option><option>업소용</option><option>잘 모르겠음</option></select></label>
        <label><span>연락처</span><input required inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" pattern="[0-9-]{10,13}" /></label>
      </div>
      <label className="agree"><input type="checkbox" required /> <span>[필수] 개인정보 수집·이용 동의</span> <a href="/privacy">내용 보기</a></label>
      <button className="submit" type="submit"><span>내 지역 빠른 견적 받기</span><b aria-hidden="true">→</b></button>
      <p className="form-note">접수 후 지역과 기사 일정을 확인해 연락드립니다.</p>
    </form>
  );
}

export default function Home() {
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
    };
  }, []);

  return (
    <main>
      <div className="scroll-progress" aria-hidden="true" />
      <header className="topbar"><a className="brand" href="#top"><i>에어컨</i><span>설치·수리·중고</span></a><nav className="desktop-nav" aria-label="주요 메뉴"><a href="#service">서비스</a><a href="#work">작업 현장</a><a href="#area">서비스 지역</a><a href="#faq">자주 묻는 질문</a></nav><a className="top-cta" href="#estimate">빠른 견적 신청</a></header>

      <section className="hero" id="top">
        <div className="hero-image" role="img" aria-label="에어컨 현장 작업 사진" />
        <div className="hero-shade" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span /> 여름철 설치·수리 일정 확인 중</p>
            <h1><span>에어컨,</span><em><span>기다리다</span><span>여름 다 갑니다.</span></em></h1>
            <p className="hero-sub">에어컨 수리·설치·이전설치·중고 판매까지.<br />지금 우리 지역 작업 가능 여부부터 확인하세요.</p>
            <div className="trust-row"><span>✓ 실제 현장 사진</span><span>✓ 지역별 일정 확인</span><span>✓ 30초 문의</span></div>
            <div className="hero-guide"><strong>어떤 서비스를 골라야 할지 모르겠나요?</strong><span>증상과 상황을 확인한 뒤 필요한 작업부터 안내해드립니다.</span></div>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="quick-strip"><strong>지금 필요한 작업, 한 번에 문의하세요</strong><div>{["에어컨 수리", "신규 설치", "이전 설치", "중고 판매", "중고 매입", "가스 충전", "철거"].map(x => <span key={x}>{x}</span>)}</div></section>

      <section className="situations section" id="situations">
        <div className="section-title situations-title"><p>WHEN TO ASK</p><h2>이럴 때,<br /><em>바로 신청하세요.</em></h2><span>에어컨 용어를 몰라도 괜찮습니다. 지금 처한 상황만 선택하면 필요한 작업부터 함께 확인합니다.</span></div>
        <div className="situation-grid">
          <article>
            <div className="situation-icon">01</div><p className="situation-label">이전설치 · 신규설치</p><h3>이사·입주 날짜가<br />정해졌다면</h3>
            <ul><li>이사하면서 기존 에어컨을 옮겨야 할 때</li><li>새집·신혼집에 처음 설치해야 할 때</li><li>사무실이나 매장을 이전·오픈할 때</li><li>철거와 재설치를 한 번에 맡기고 싶을 때</li></ul>
            <a href="#estimate">설치 일정 확인하기 <b>→</b></a>
          </article>
          <article>
            <div className="situation-icon">02</div><p className="situation-label">에어컨 수리</p><h3>켜도 시원하지<br />않다면</h3>
            <ul><li>찬바람이 약하거나 아예 나오지 않을 때</li><li>실내기에서 물이 떨어지거나 소리가 날 때</li><li>작동 중 꺼짐·냄새·오류가 반복될 때</li><li>가스 충전인지 수리인지 판단하기 어려울 때</li></ul>
            <a href="#estimate">증상 상담 신청하기 <b>→</b></a>
          </article>
          <article>
            <div className="situation-icon">03</div><p className="situation-label">중고 에어컨 구매</p><h3>새 제품 비용이<br />부담된다면</h3>
            <ul><li>예산에 맞는 중고 제품을 찾고 있을 때</li><li>원룸·사무실·매장에 빠르게 필요할 때</li><li>제품 구매와 설치를 함께 문의하고 싶을 때</li><li>어떤 용량과 형태가 맞는지 모를 때</li></ul>
            <a href="#estimate">중고 제품 문의하기 <b>→</b></a>
          </article>
        </div>
        <div className="audience-banner"><div><span>공간이 달라도 상담은 한 번에</span><strong>가정집부터 기업·사무실·소상공인 매장까지</strong><p>공간 용도와 면적, 설치 환경을 확인한 뒤 알맞은 제품과 작업 가능 여부를 안내드립니다.</p></div><div className="audience-types">{["아파트·주택", "원룸·오피스텔", "기업·사무실", "카페·음식점", "미용실·학원", "일반 매장"].map(x=><span key={x}>✓ {x}</span>)}</div></div>
      </section>

      <section className="section service-section" id="service">
        <div className="section-title"><p>WHAT WE DO</p><h2>필요한 작업을<br /><em>한 번에 확인하세요.</em></h2><span>설치부터 수리와 중고 제품까지, 상담 후 현장에 필요한 작업과 가능 일정을 확인합니다.</span></div>
        <div className="service-grid">{services.map(([title, desc], i) => <article key={title}><b>0{i + 1}</b><h3>{title}</h3><p>{desc}</p><a href="#estimate">가능 여부 확인 →</a></article>)}</div>
      </section>

      <section className="work-section" id="work">
        <div className="work-copy"><p>REAL WORK</p><h2>말보다 현장.<br />직접 작업한 사진으로<br /><em>확인하세요.</em></h2><span>배관 한 줄, 실외기 위치 하나도 현장마다 다릅니다. 사진만 보고 정찰가를 약속하기보다 작업 조건을 확인하고 안내합니다.</span><a href="#estimate">내 현장 견적 물어보기 →</a></div>
        <div className="work-gallery" aria-label="실제 에어컨 작업 사진 슬라이드">
          <div className="gallery-head"><span><i /> 실제 현장 사진 7장</span><small>마우스를 올리면 멈춥니다</small></div>
          <div className="gallery-viewport">
            <div className="gallery-track">{[...workPhotos, ...workPhotos].map(([src, alt, label], index) => <figure key={`${src}-${index}`} aria-hidden={index >= workPhotos.length}><img src={src} alt={index < workPhotos.length ? alt : ""} /><figcaption><span>{String((index % workPhotos.length) + 1).padStart(2,"0")}</span>{label}</figcaption></figure>)}</div>
          </div>
          <div className="gallery-hint"><span>←</span> 옆으로 밀어 더 보기 <span>→</span></div>
        </div>
      </section>

      <section className="price-section section">
        <div className="section-title"><p>PRICE CHECK</p><h2>무조건 싸다는 말보다<br /><em>비용이 달라지는 이유부터.</em></h2></div>
        <div className="factors">{["에어컨 종류", "배관 길이", "실외기 위치", "앵글 필요 여부", "냉매 상태", "철거 여부", "이전 거리", "현장 난이도"].map((x,i)=><span key={x}><b>{String(i+1).padStart(2,"0")}</b>{x}</span>)}</div>
        <p className="price-note">현장 조건 없이 만든 ‘최저가’는 실제 결제 금액과 달라질 수 있습니다.<br />지역과 작업 유형을 남겨주시면 필요한 확인 사항부터 안내드립니다.</p>
      </section>

      <section className="area-section" id="area">
        <div><p>WORK AREA</p><h2>우리 동네도 오나요?<br /><em>먼저 확인해드릴게요.</em></h2><span>대전·세종·충청권 중심, 전북 일부 지역까지 상담합니다. 기타 지역은 기사 일정과 작업 가능 여부 확인 후 안내드립니다.</span><a href="#estimate">내 지역 일정 확인 →</a></div>
        <div className="area-card"><strong>주요 상담 지역</strong><div>{areas.map(a=><span key={a}>{a}</span>)}</div><small>※ 접수 시점과 작업 조건에 따라 가능 여부가 달라질 수 있습니다.</small></div>
      </section>

      <section className="process section"><div className="section-title"><p>HOW IT WORKS</p><h2>복잡하게 말고,<br /><em>딱 4단계로.</em></h2></div><ol>{[["01","빠른 신청","지역·작업·연락처만 남겨주세요."],["02","전화 확인","현장 상황과 필요한 작업을 확인합니다."],["03","일정·견적 안내","작업 가능 기사와 일정을 확인해 안내합니다."],["04","현장 작업","확정한 일정에 맞춰 작업을 진행합니다."]].map(([n,t,d])=><li key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

      <section className="faq section" id="faq"><div className="section-title"><p>FAQ</p><h2>신청 전,<br /><em>이것만 확인하세요.</em></h2></div><div>{[["당일 작업도 가능한가요?","지역과 접수 시간, 기사 일정에 따라 달라집니다. 접수 후 가장 빠른 가능 일정을 확인해드립니다."],["중고 에어컨도 설치하나요?","중고 제품 설치와 매입·판매 모두 문의할 수 있습니다. 제품과 현장 상태를 먼저 확인합니다."],["철거만 따로 요청할 수 있나요?","가능합니다. 철거 위치와 제품 종류, 이동 여부를 남겨주세요."],["수리비는 어떻게 정해지나요?","증상과 제품, 부품 및 냉매 상태에 따라 달라집니다. 전화 확인 후 필요한 점검 절차를 안내합니다."],["출장비나 추가비용이 있나요?","지역과 작업 조건에 따라 발생할 수 있어 작업 확정 전에 확인할 항목을 안내드립니다."]].map(([q,a])=><details key={q}><summary>{q}<i>+</i></summary><p>{a}</p></details>)}</div></section>

      <section className="final"><div><p>아직도 업체만 찾고 계신가요?</p><h2>더 더워지기 전에<br /><em>가능한 일정부터 잡으세요.</em></h2><span>30초 신청으로 지역과 작업 가능 여부를 확인하세요.</span></div><LeadForm compact /></section>
      <footer><div className="footer-top"><div className="brand"><i>에어컨</i><span>설치·수리·중고</span></div><nav><a href="/terms">서비스 이용안내</a><a href="/privacy"><strong>개인정보처리방침</strong></a></nav></div><div className="business-info"><p>상호 <b>[대표 확인 필요]</b>　 대표자 김대곤　 사업자등록번호 <b>[대표 확인 필요]</b></p><p>사업장 주소 <b>[대표 확인 필요]</b>　 대표전화 <b>[대표 확인 필요]</b>　 이메일 <b>[대표 확인 필요]</b></p><p>개인정보 보호책임자 김대곤 <b>[담당 및 연락처 확인 필요]</b></p></div><p className="copyright">© 2026 <b>[상호 확인 필요]</b>. All rights reserved.</p></footer>
      <nav className="sticky"><a href="#estimate">내 지역 빠른 견적 받기 <b>→</b></a></nav>
    </main>
  );
}
