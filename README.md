# 백현정 웹 퍼블리셔 포트폴리오

하늘색과 크림색을 중심으로 제작 중인 반응형 웹 퍼블리셔 포트폴리오입니다. 현재는 화면 구성과 디자인을 먼저 다듬고 있으며, 실제 프로젝트와 상세 소개는 추후 등록합니다.

> 프로젝트 3개는 구성과 설명을 위한 작성 예시입니다. 실제 작업 실적을 의미하지 않습니다.

## 개발 환경

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 14 App Router, React 18 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS 3, CSS Module |
| 모션·스크롤 | Framer Motion, Lenis |

정확한 의존성 버전과 실행 스크립트는 [package.json](./package.json), 작업 지침은 [AGENTS.md](./AGENTS.md)에서 확인할 수 있습니다.

## 로컬 실행

저장소 루트에서 실행합니다. 아래 명령은 Windows PowerShell 기준입니다. 다른 셸에서는 `npm.cmd` 대신 `npm`을 사용합니다.

```powershell
npm.cmd ci
npm.cmd run dev
```

개발 화면: [localhost:3000](http://localhost:3000)

프로덕션 빌드와 실행:

```powershell
npm.cmd run build
npm.cmd run start
```

다른 포트를 사용하려면 다음처럼 실행합니다.

```powershell
npm.cmd run dev -- --port 3001
```

개발 서버와 프로덕션 빌드는 기본적으로 같은 `.next/` 경로를 사용합니다. 빌드 전에는 개발 서버를 종료하고, 빌드 완료 후 필요한 서버를 다시 실행하세요. 동시에 실행하면 산출물이 충돌해 스타일이나 모듈을 불러오지 못할 수 있습니다.

## 화면 구성과 현재 상태

메인 페이지는 Hero → 소개 → 학습·사용 기술 → 대표 프로젝트 → 보조 프로젝트 → 디자인 → 연락처 순서입니다. 보조 프로젝트가 없으면 해당 섹션은 표시하지 않습니다.

| 영역 | 현재 구성 |
| --- | --- |
| 헤더 | 반투명 캡슐 메뉴, 원형 프로필 아이콘(홈 링크), 메일 아이콘이 있는 Work with me 버튼, 모바일 접이식 메뉴 |
| Hero | 하늘 사진, 영문 제목, HTML·CSS·JavaScript·React 단계별 데모, 음성 소개 플레이어 |
| 소개 | PC 사진·정보 좌우 배치, 모바일 세로 배치, 교육·자격 정보 분리 |
| 기술 | 기존 기술명 6개를 카드로 표시, PC·태블릿 3열 / 모바일 2열 |
| 대표 프로젝트 | 예시 카드 3개, PC 2열 / 모바일 1열, 16:9 이미지, 상세 페이지 링크 |
| 디자인 | 데이터가 없으면 준비 안내 표시 |
| 연락처 | 등록된 연락 채널만 표시 |

소개 사진은 자리 표시 상태이며 소개글과 자격증은 입력 전까지 숨깁니다. 음성 플레이어는 `/audio/intro.mp3`를 참조하지만, 현재 해당 파일은 등록되지 않았습니다. 재생에 실패하면 안내 문구를 표시합니다.

## 폴더 구조

```text
app/
├─ layout.tsx                 공통 레이아웃
├─ page.tsx                   메인 페이지
├─ globals.css                전역 스타일
└─ work/[slug]/page.tsx        대표 프로젝트 상세 페이지
components/
├─ layout/                    SiteNav, SiteFooter, SmoothScroll
├─ sections/                  About, Skills, WorkGrid, SideProjects, DesignGallery
│  └─ hero/                   Hero, Hero.module.css, HeroBrowserDemo, VoiceIntro
└─ ui/                        Reveal, ProjectLinks, ProjectTags
data/                         프로젝트·내비게이션·디자인 데이터
public/                       이미지·폰트·음성 등 정적 파일
artifacts/                    화면 캡처와 로컬 확인 결과
```

여러 섹션에서 사용하는 요소는 `ui/`, Hero 전용 요소는 `sections/hero/`에서 관리합니다. `.next/`와 `node_modules/`는 생성물이며 Git 관리 대상에서 제외되어 있습니다.

## 디자인과 스타일 기준

크림색 배경과 하늘색 포인트, 짙은 남색 글자를 사용합니다. Hero는 종이 질감과 곡선 장식을 유지하고, 본문은 평평한 배경과 작은 포인트로 가독성을 확보합니다.

| 역할 | 색상 |
| --- | --- |
| 기본 배경 | `#FFF9F1` |
| 보조 배경 | `#F6F3EC` |
| 포인트 | `#B9DBF6` |
| 기본 글자 | `#202731` |
| 보조 글자 | `#58636E` |
| 구분선 | `#DDD9D0` |

공통 색상은 `tailwind.config.ts`의 `portfolio` 테마에서 관리합니다. 소개·기술·대표 프로젝트에는 본문 최대 너비 1120px, PC 상하 여백 96px, 모바일 상하 여백 64px를 적용했습니다. 프로젝트 상세 본문도 같은 색상과 최대 너비를 사용하며, 기간·담당 범위 및 문제 해결 과정을 카드로 구분합니다.

- **Tailwind CSS:** 일반 UI의 배치, 간격, 글자와 반응형 스타일을 관리합니다.
- **CSS Module:** `components/sections/hero/Hero.module.css`에서 Hero와 HeroBrowserDemo의 복잡한 배치·장식·애니메이션을 함께 관리합니다.
- **전역 CSS:** `app/globals.css`에서 문서 기본 스타일, 기존 색상 변수, 키보드 포커스와 모션 감소 규칙을 관리합니다.
- **인라인 스타일:** 재생 진행률 같은 런타임 값과 기존 음성 플레이어의 개별 장식 표현에 사용합니다.

일반 UI는 Tailwind로 작성하고 복잡한 Hero 표현은 CSS Module로 분리합니다. 상세 수치와 모바일 유지 기준은 [AGENTS.md](./AGENTS.md)에 정리되어 있습니다.

## 콘텐츠를 수정할 위치

현재는 디자인 작업을 우선하며, 아래 항목은 실제 내용을 등록할 때 사용합니다.

| 수정 항목 | 위치 |
| --- | --- |
| 메뉴 이름·링크 | `data/navigation.ts` |
| 헤더 프로필 아이콘 사진 | `data/navigation.ts`의 `navProfile.image` (`public/images/avatar.webp` 권장, 정사각형 크롭) |
| Hero 제목·문구 | `components/sections/hero/Hero.tsx` |
| 하늘 사진 | `public/images/sky-photo.webp` |
| 이름·사진·소개글·교육·자격증 | `components/sections/About.tsx`의 `profile` |
| 직무 문구 | `components/sections/About.tsx`의 표시 문구 |
| 기술명·선택적 활용 설명 | `components/sections/Skills.tsx`의 `skills` |
| 프로젝트 목록·상세 내용 | `data/projects.ts` |
| 디자인 이미지·제목 | `data/design.ts` |
| 연락처·이력서 링크 | `components/layout/SiteFooter.tsx`의 `contact` |
| 음성 파일 | `public/audio/intro.mp3` |

### 이미지와 선택적 정보

- Hero의 하늘 사진은 정적 import로 불러옵니다. 파일 내용이 바뀌면 빌드에서 생성되는 이미지 주소도 바뀝니다.
- 480px 미만 화면에서는 Hero 장식 사진을 숨깁니다.
- 소개 사진은 `profile.photo`, 소개글은 `profile.introduction`에 입력합니다. 빈 자격증 목록은 표시하지 않습니다.
- 기술별 설명은 `skills` 항목의 `description`에 추가할 수 있습니다. 값이 없으면 기술명만 표시합니다.
- 프로젝트 이미지는 `public/images/`에 두고 `image`, `desktopImage`, `mobileImage` 경로를 지정합니다. 상세 페이지의 이미지 크기도 실제 비율에 맞게 확인합니다.

### 프로젝트 데이터

- `featured`: 대표 작업과 보조 작업을 구분합니다. 프로젝트 유형과는 별개입니다.
- `placeholder`: 예시 여부를 나타냅니다. 실제 내용으로 교체한 뒤 `false`로 바꾸고 제목의 `PLACEHOLDER` 문구도 정리합니다.
- `scope`: 직접 담당한 범위와 참고 출처를 기록합니다.
- `categoryTags`, `featureTags`, `stack`: 분류, 구현 기능, 사용 기술을 표시합니다.
- `challenges`: 실제로 겪은 문제와 해결 방법을 `problem` / `solution`으로 기록합니다.
- `links.website`, `links.github`, `links.figma`: 실제 주소가 있는 링크만 표시합니다. 빈 링크는 숨깁니다.
- `size`: 기존 데이터에 남아 있는 필드입니다. 현재 대표 카드 목록은 이 값과 관계없이 PC 2열로 표시합니다.

현재 `/work/[slug]` 상세 페이지는 대표 프로젝트 데이터를 기준으로 구성됩니다.

## 화면 확인

코드 변경 후 `npm.cmd run build`로 빌드와 타입 검사를 확인합니다. `lint` 스크립트는 등록되어 있으나 독립적인 ESLint 실행 환경은 별도로 설정 여부를 확인해야 합니다.

화면 변경 시 다음 항목을 확인합니다.

- PC 1440×900, 모바일 390×844의 배치
- 반응형 수정 시 320px·480px 및 태블릿 너비
- 가로 넘침, 글자·버튼 겹침, 이미지 로딩 실패, 브라우저 오류
- 모바일 메뉴 열기·닫기, Escape 키, 키보드 포커스
- Hero 데모 단계 변경·초기화와 프로젝트 상세 페이지 이동
- 음성 파일 등록 후 재생·일시정지·탐색
- 모션 감소 설정에서의 동작

캡처와 확인 기록은 `artifacts/`의 작업별 폴더에 보관합니다. 기존 비교 이미지는 덮어쓰지 않습니다. 폴더 안의 브라우저 확인 스크립트 일부는 로컬 Playwright 설치 경로와 포트에 의존하므로, 다른 환경에서 실행하려면 경로를 조정해야 합니다. 정식 공통 테스트 환경으로 구성된 상태는 아닙니다.

## 다음 작업

- [x] 디자인 갤러리의 빈 상태와 카드 외형 정리
- [x] 연락처·푸터 디자인 정리
- [ ] 남아 있는 이전 색상·간격과 공통 디자인의 일관성 점검
- [ ] PC·태블릿·모바일 전체 화면과 접근성 점검
- [ ] 디자인 정리 후 실제 소개·프로젝트·이미지·음성 등록



