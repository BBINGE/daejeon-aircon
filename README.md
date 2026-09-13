# 냉난방기설치매입 — 김대곤 대표 상담 사이트

- **공식 주소·광고 연결 URL:** https://naengnanmarket.com/
- 기본 제공 주소: https://kimdaegon-aircon.bbinge95.chatgpt.site/
- GitHub: https://github.com/BBINGE/daejeon-aircon (main)
- 기존 정적 배포 주소: https://bbinge.github.io/daejeon-aircon/

공식 도메인은 Sites에 연결되어 있다. chatgpt.site는 기본 호스팅 주소이며 사이트 이름에 붙는 표시가 아니다. 광고와 공유에는 공식 주소를 사용한다.

## 회사 PC에서 이어가기

Git이 설치된 터미널에서 새 폴더로 가져온다.

```powershell
git clone https://github.com/BBINGE/daejeon-aircon.git
cd daejeon-aircon
npm ci
npm run dev
```

Node.js 22.13.0 이상 필요. 이미 체크아웃이 있으면 먼저 git status를 확인한다. 변경이 없을 때만 git pull --ff-only origin main을 실행한다. 변경이 있으면 덮어쓰지 말고 비교한다. 로컬 주소는 개발 서버가 출력하는 URL을 사용한다.

## 먼저 읽을 문서

1. [HANDOFF.md](HANDOFF.md): 현재 완료 범위, 남은 일, 배포 상태
2. [PROJECT_BRIEF.md](PROJECT_BRIEF.md): 서비스·카피·사용자 의도
3. [OPERATIONS.md](OPERATIONS.md): 상담 운영과 배포 절차
4. [PRELAUNCH_CHECKLIST.md](PRELAUNCH_CHECKLIST.md): 광고 전 확인 상태
5. [ANALYTICS_ACTIVATION.md](ANALYTICS_ACTIVATION.md): 분석 설정과 한계

[HISTORY_LEGACY.md](HISTORY_LEGACY.md)는 과거 계획 원문이다. 현재 지침으로 사용하지 않는다.

## 소스와 검사

- app/page.tsx, app/globals.css: 고객 화면
- app/layout.tsx: 사이트 제목
- app/privacy/page.tsx, app/terms/page.tsx: 공개 안내
- public/analytics.js: 동의 기반 GA4
- public/images/: 기존 현장 사진
- docs/: GitHub Pages 정적 배포본; 직접 수정 대신 export
- .openai/hosting.json: 기존 Sites 프로젝트 식별자

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/analytics.test.mjs
npm run export:pages
```

GitHub push만으로 Sites 운영 사이트가 갱신되지는 않는다. 게시 절차는 OPERATIONS.md 참고. 비밀번호·토큰·고객 자료는 저장소에 넣지 않는다.
