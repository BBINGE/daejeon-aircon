export default function TermsPage() {
  return <main className="legal-page">
    <header className="legal-header"><a className="brand" href="/"><i>에어컨</i><span>설치·수리·중고</span></a><a href="/">홈으로 돌아가기</a></header>
    <article className="legal-content">
      <span className="legal-badge">사전 오픈 초안 · 대표 확인 필요</span><h1>서비스 이용안내</h1>
      <p className="legal-intro">상담 신청 전에 서비스 범위와 견적·일정이 확정되는 방식을 안내합니다.</p>
      <section className="legal-section"><h2>1. 상담 신청의 의미</h2><p>웹사이트의 견적 신청은 상담을 요청하는 단계이며 작업 계약이나 최종 가격 확정을 의미하지 않습니다. 지역, 제품, 현장 조건과 기사 일정을 확인한 뒤 작업 가능 여부와 견적을 안내합니다.</p></section>
      <section className="legal-section"><h2>2. 작업 가능 지역과 일정</h2><p>대전·세종·충청권과 안내된 일부 지역을 중심으로 상담합니다. 접수 시점, 작업 유형 및 기사 일정에 따라 작업이 어려울 수 있으며 기타 지역은 별도 확인 후 안내합니다.</p></section>
      <section className="legal-section"><h2>3. 견적과 추가 비용</h2><p>에어컨 종류, 배관 길이, 실외기 위치, 앵글·타공 필요 여부, 냉매 상태, 철거 여부, 이전 거리와 현장 난이도에 따라 최종 비용이 달라질 수 있습니다. 현장 확인이 필요한 비용은 작업 확정 전에 안내하는 것을 원칙으로 합니다. <span className="placeholder">[취소비·출장비·결제 방식 확인 필요]</span></p></section>
      <section className="legal-section"><h2>4. 중고 제품</h2><p>중고 제품은 개별 제품의 상태와 재고에 따라 제공 가능 여부가 달라집니다. 제품 상태 고지, 보증 범위, 교환·환불 기준은 <span className="placeholder">[대표 정책 확인 후 입력]</span>합니다.</p></section>
      <section className="legal-section"><h2>5. 사업자 정보</h2><table><tbody><tr><th>상호</th><td><span className="placeholder">[대표 확인 필요]</span></td></tr><tr><th>대표자</th><td>김대곤</td></tr><tr><th>사업자등록번호</th><td><span className="placeholder">[대표 확인 필요]</span></td></tr><tr><th>주소·연락처</th><td><span className="placeholder">[대표 확인 필요]</span></td></tr></tbody></table></section>
      <div className="legal-actions"><a href="/#estimate">견적 신청으로 돌아가기</a><a className="secondary" href="/privacy">개인정보처리방침 보기</a></div>
    </article>
  </main>;
}
