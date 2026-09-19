# 상담 운영과 사이트 게시

2026-09-20 작업 중 기준. 과거 DB 운영 원문은 HISTORY_LEGACY.md에 보존. PC 접수는 메일 인증·실제 수신·게시 확인 전까지 로컬 변경이다.

## 상담

- 010-9183-2200 전화·문자로 대표 직접 수신. 사진도 같은 번호.
- 모바일은 기존 전화·문자 직통을 유지. PC 상담 신청은 연락처 필수, 작업·지역 선택 입력으로 박성호가 먼저 확인하여 대표에게 전달하는 구조로 변경 중.
- PC POST /api/leads는 유효성·동의·중복 검사를 거쳐 기존 D1 `leads`에 저장. 메일 알림은 FormSubmit을 통해 `박성호의 수신 메일`으로 보내며, `LEAD_NOTIFY_EMAIL` 환경값과 수신 메일 인증이 필요하다. 인증·실제 수신·게시 확인 전 공개 운영으로 보고하지 않음.
- 메일 전송 실패에도 DB 접수는 남는다. 방문자에게 지연을 알리고 대표 전화번호를 보여준다. 박성호는 메일 알림 외에 기존 인증 관리자 화면의 신규 접수도 확인해야 한다.
- 이전 접수 잔여 데이터는 인증 조회로 확인되지 않았다. 비어 있다고 단정하거나 임의 삭제하지 않음.
- 미계약 상담 종료 후 3개월 보관 뒤 대표가 휴대폰 문자·사진과 별도 저장본을, 박성호가 받은 알림 메일을 삭제한다. PC DB 기록은 종료 상태로 표시한 뒤 기한이 지나면 관리 조회 때 정리된다. 웹사이트가 휴대폰이나 메일 사본을 자동 삭제하지 않음.
- 실제 계약·거래 기록 보존 기준과 백업 파기는 별도 확인 대상. 명시하지 않은 보증·출장비·취소 조건을 만들지 않음.

## 개발과 검사

Node.js >=22.13.0, npm ci 후 개발. 새 DB를 만들거나 Sites 프로젝트를 재생성하지 않는다.

```powershell
npm run build
node --test tests/rendered-html.test.mjs tests/analytics.test.mjs
npm run export:pages
git diff --check
```

수정에 맞춰 모바일·데스크톱을 검사한다. 문서 전용 변경은 사이트 rebuild 불필요.

## 공개 배포

공식 도메인 naengnanmarket.com은 Sites 운영본에 연결됨. GitHub Pages는 docs/ 정적 출력 별도 유지. GitHub push가 Sites 게시를 대신하지 않는다.

1. 현 Sites 스킬을 읽고 .openai/hosting.json의 기존 project_id 재사용.
2. 변경 소스 build 및 검사, 필요 시 docs/ export.
3. 변경 파일만 명시적으로 stage/commit. 미추적 임시 파일을 git add .로 포함하지 않음.
4. GitHub origin/main 및 Sites 소스 main에 동일 소스 push. Sites 인증은 연결된 도구로 임시 발급해 명령 단위로 사용; 파일·remote URL에 저장하지 않음.
5. push 후 git rev-parse --verify HEAD 전체 SHA 확보. 같은 소스의 빌드 결과를 스킬 helper로 package.
6. Sites 버전 저장·배포 후 succeeded 확인. 현재 공개 audience 유지.
7. 광고·공유 주소는 https://naengnanmarket.com/ 사용. 기본 chatgpt.site 주소도 같은 사이트를 제공.

이전 Windows 환경에서는 Node helper가 경로 오류를 냈고 Git Bash의 sites-hosting/scripts/package-site.sh로 성공했다. 회사 PC에서는 현재 설치 경로와 스킬을 먼저 확인한다. 사이트 소스 수정이 없는 인수인계 문서 커밋은 GitHub push까지만 하면 됨.

## 계정 정보 보호

ADMIN_KEY는 사이트 환경 비밀값으로만 유지. 사이트 편집에 관리자 키가 꼭 필요한 것은 아니다. GitHub 권한·Sites 연결은 회사 PC에서 인증이 필요할 수 있다. 대표·사용자의 로그인 비밀번호, 인증 토큰, 고객 DB를 커밋하지 않는다.
