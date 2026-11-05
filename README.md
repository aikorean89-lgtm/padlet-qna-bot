# 🤖 패들렛 AI 답변 도우미

강의 때 선생님들이 패들렛에 남긴 질문에 Claude가 **댓글로 1차 답변**을 달아 주는 도구입니다.
강의마다 새 패들렛을 만들어 연결해서 쓰면 돼요.

```
선생님들 질문 작성 ──▶ 패들렛
                         │  (20~60초마다 확인)
                관리 화면 / 예약 실행
                         │
              Claude가 답변 작성 (강의 메모 참고)
                         │
                패들렛 댓글로 게시  "🤖 AI 답변"
```

## 1. 준비물 (처음 한 번)

| 준비물 | 어디서 |
|---|---|
| Padlet API 키 | Padlet 대시보드 → ⚙️ 설정 → 개인 계정 → **개발자** → API 키 *생성* (Zapier 키 아님) |
| Claude API 키 | https://console.anthropic.com → API Keys (사용량만큼 과금, 크레딧 충전 필요) |
| GitHub + Vercel | 평소 쓰시던 계정 그대로 |

> Padlet API는 유료 구독자이면서 **그 패들렛의 작성자(관리자)** 일 때만 쓸 수 있어요. 질문 패들렛은 꼭 본인 계정으로 만드세요.

## 2. 배포

1. 이 폴더 전체를 새 GitHub 저장소(예: `padlet-qna-bot`)에 올립니다.
2. Vercel → Add New Project → 저장소 선택 → Deploy
3. Vercel 프로젝트 → Settings → **Environment Variables** 에 아래를 넣고 **Redeploy**

| 이름 | 값 | 필수 |
|---|---|---|
| `PADLET_API_KEY` | Padlet API 키 | ✅ |
| `ANTHROPIC_API_KEY` | Claude API 키 | ✅ |
| `ADMIN_PASSWORD` | 관리 화면 비밀번호 (아무 문자열) | ✅ |
| `CRON_SECRET` | 예약 실행용 비밀값 (긴 아무 문자열) | 예약 자동답변 쓸 때 |
| `DEFAULT_BOARD` | `https://padlet.com/aikorean89/padlet-s024rs87hoanqoy6i7h8` (관리 화면에서 자동 선택) | 선택 |
| `INSTRUCTOR_NAME` | 예: `조은택` (답변 말투에 반영) | 선택 |
| `CLAUDE_MODEL` | 기본 `claude-sonnet-5-5` / 저렴하게: `claude-haiku-5-5` | 선택 |

## 3. 강의 날 쓰는 법

1. 패들렛을 새로 만들고 제목을 `10/30 생성형 AI 연수 – 궁금한 점` 처럼 정합니다.
2. 배포한 주소(예: `padlet-qna-bot.vercel.app`)를 노트북에서 열고 비밀번호로 로그인
3. **① 패들렛 선택** → 목록에서 고르거나 주소 붙여넣기
4. **강의 메모**에 오늘 다룬 내용을 몇 줄 적어 두면 답변이 강의 맥락에 맞춰져요
5. **② 답변 방식**
   - ⚡ 바로 게시: 질문이 올라오면 바로 댓글
   - ✋ 확인 후 게시: 초안을 보고 고친 뒤 [게시] (처음엔 이걸 추천)
6. **▶ 실시간 답변 시작** — 화면을 켜 둔 동안 계속 확인해요 (화면 꺼짐 방지 자동)

### 중복·예외 처리
- `🤖` 표시 댓글이 있거나 **강사님이 직접 댓글을 단 글**은 다시 답하지 않아요.
- 강사 본인이 쓴 안내 글, 승인 대기 중인 글은 건너뛰어요.
- 초안의 [건너뛰기]를 누른 글은 다시 묻지 않아요.

## 4. (선택) 화면을 꺼도 자동 답변 — 예약 실행

패들렛 **설명**에 `#AI답변` 을 넣어 두면, 관리 화면을 켜지 않아도 예약 실행이 그 패들렛의 새 질문에 자동으로 답해요. (최근 14일 안에 바뀐 패들렛만, 항상 "바로 게시" 방식)

- 기본: Vercel Cron이 **매일 밤 10시** 한 번 확인 (`vercel.json`)
- 더 자주: GitHub 저장소 → Settings → Secrets and variables → Actions 에
  `APP_URL`(배포 주소)과 `CRON_SECRET`(위와 같은 값)을 등록하면
  **오전 9시~밤 9시 15분마다** 확인해요 (`.github/workflows/padlet-auto-answer.yml`)

> 확인 후 게시 방식으로 쓰고 싶은 패들렛에는 `#AI답변` 을 넣지 마세요. 예약 실행은 바로 게시하거든요.

## 5. 참고

- Padlet API 요청 한도: IP당 분당 250회 (이 도구는 한 번 확인에 1~4회만 써요)
- 답변 머리말은 "🤖 AI 답변 (강사 확인 전 자동 답변이에요)" — 참여자가 AI 답변임을 알 수 있게 했어요.
- 답변 규칙(말투, 길이 등)은 `lib/core.js`의 `askClaude` 안 `[답변 원칙]`에서 고칠 수 있어요.

### 파일 구조
```
index.html            관리 화면
api/process.js        패들렛 확인 + 답변 (관리 화면용)
api/publish.js        확인 후 게시
api/boards.js         내 패들렛 목록
api/cron.js           예약 자동 답변
lib/core.js           Padlet·Claude 연동 핵심 로직
vercel.json           함수 설정 + 매일 밤 예약
.github/workflows/    15분 예약 실행(선택)
```
