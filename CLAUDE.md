# CLAUDE.md

## 프로젝트 개요

프론트엔드 DX 향상을 위한 MCP 서버 모노레포.

## 기술 스택 & 버전

| 도구       | 버전                      |
| ---------- | ------------------------- |
| Node.js    | 20 LTS                    |
| pnpm       | 10.x                      |
| TypeScript | 5.x                       |
| ESLint     | 9.x (Flat Config)         |
| Prettier   | 3.x                       |
| Turborepo  | 2.x                       |
| MCP SDK    | @modelcontextprotocol/sdk |

## 폴더 구조

- `packages/` - MCP 서버 패키지들 (@frontend-mcp-kit/\*)
- `tooling/` - 공통 설정 (typescript-config, eslint-config, prettier-config)
- `apps/` - 문서 사이트 등

## 코드 스타일

### 포맷팅 (Prettier)

- 들여쓰기: 2스페이스
- 따옴표: 쌍따옴표 (`"`)
- 세미콜론: 사용
- 줄 길이: 80자

### TypeScript

- strict 모드 필수
- `any` 사용 금지 → `unknown` 사용 후 타입 가드
- 명시적 반환 타입 권장
- `as` 타입 단언 최소화

### 네이밍

- 변수/함수: camelCase
- 타입/인터페이스: PascalCase
- 상수: SCREAMING_SNAKE_CASE
- 파일명: kebab-case

## 개발 규칙

### 패키지 네이밍

- 스코프: `@frontend-mcp-kit/`
- 케밥케이스: `hardcoded-strings`, `test-generator`

### 커밋 메시지

```
:gitmoji: type: 설명
```

- `:sparkles:` feat: 새 기능
- `:bug:` fix: 버그 수정
- `:wrench:` chore: 설정, 의존성
- `:memo:` docs: 문서
- `:recycle:` refactor: 리팩토링
- `:white_check_mark:` test: 테스트

## 개발 워크플로우

```bash
# 의존성
pnpm install                              # 전체 설치
pnpm add <pkg> --filter @frontend-mcp-kit/<name>  # 특정 패키지에 추가

# 개발
pnpm build                                # 전체 빌드
pnpm dev                                  # 전체 dev
pnpm dev --filter @frontend-mcp-kit/<name>  # 특정 패키지만

# 검사
pnpm lint                                 # 린트
pnpm format                               # 포맷팅
pnpm format:check                         # 포맷 검사 (CI용)
```

## 테스트 규칙

- 테스트 파일: `*.test.ts` 또는 `*.spec.ts`
- 테스트 위치: 소스 파일과 같은 디렉토리 또는 `__tests__/`
- 단위 테스트 필수, 통합 테스트 권장

## PR 체크리스트

- [ ] 린트 통과 (`pnpm lint`)
- [ ] 포맷팅 적용 (`pnpm format`)
- [ ] 빌드 성공 (`pnpm build`)
- [ ] 테스트 통과 (해당 시)
- [ ] 관련 문서 업데이트 (해당 시)

## MCP 서버 개발

### 새 패키지 생성

1. `packages/<name>` 폴더 생성
2. `@modelcontextprotocol/sdk`, `zod` 의존성 추가
3. `@frontend-mcp-kit/typescript-config` 확장
4. `src/index.ts`에서 서버 정의

### 필수 구조

```
packages/<name>/
├── src/
│   └── index.ts    # 진입점
├── package.json
├── tsconfig.json
└── README.md
```

### 의존성

```bash
pnpm add @modelcontextprotocol/sdk zod --filter @frontend-mcp-kit/<name>
```

## Git Hooks

커밋 시 자동 실행:

- **pre-commit**: lint-staged (staged 파일 린트/포맷)
- **commit-msg**: commitlint (커밋 메시지 검사)

### 커밋이 차단되는 경우

- ESLint 에러가 있는 코드
- 잘못된 커밋 메시지 형식

### Hooks 건너뛰기 (비권장)

```bash
git commit --no-verify -m "message"
```

## 주의사항

- Node 20 필수 (`.nvmrc` 참고)
- 패키지 간 의존성은 `workspace:*` 사용
- 새 패키지 추가 후 `pnpm install` 필요
- Turborepo 캐시 문제 시 `pnpm turbo clean`
