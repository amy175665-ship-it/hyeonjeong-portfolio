# 포트폴리오 작업 지침

이 문서는 저장소 전체에 적용되는 에이전트 작업 기준입니다. 사용자와의 대화 및 작업 결과 설명은 한국어로 작성합니다. 사용자의 최신 명시적 요청을 우선하며, 요청 범위 안에서 작업합니다.

README는 프로젝트 소개와 개발 안내, 이 문서는 에이전트의 구현·검증 기준을 담당합니다. 구조나 실행 방식이 바뀌면 두 문서를 함께 고칩니다. 이 문서의 내용은 갱신 시점(2026-10-01) 기준이므로, 작업 전에 실제 파일을 먼저 확인합니다.

## 1. 기본 원칙

- 작업 경험, 교육 이력, 자격증, 연락처, 프로젝트 성과, 숙련도를 임의로 만들지 않습니다.
- 현재 프로젝트 3개와 사진은 자리 표시입니다. 실제 자료 등록은 사용자가 요청할 때 진행하며, 그 전까지 `placeholder` 표시와 "작성 예시" 문구를 유지합니다.
- 사용자가 디자인만 요청하면 기존 문구·데이터·링크 목적지를 보존합니다.
- 외부 링크는 값이 있을 때만 표시하고, 확인용 가짜 주소를 넣지 않습니다.
- 화면에 넣는 문구는 사용자가 정했거나 이미 있는 문구를 씁니다. 새 문구가 필요하면 후보를 제안하고 확인받습니다.

## 2. 컨셉

- 핵심 문장: "새로운 환경에서 필요한 것을 빠르게 파악하고, 직접 구현하며, 끝까지 완성해 성장으로 이어가는 사람."
- ABSORB.(파악·배움) → BUILD.(직접 구현) → GROW.(끝까지 완성) 흐름을 페이지 전체의 순서로 씁니다.
- 선인장은 "환경에 유연하게 적응하면서도 쉽게 흔들리지 않고 꾸준히 자라는" 태도를 뜻합니다. "척박한 환경", "천천히", "자신의 속도로" 같은 표현은 쓰지 않습니다(선생님 피드백).
- 한글 문구는 "~습니다" 완결형 교훈 문장을 크게 쓰면 공익광고처럼 보입니다. 큰 문구는 짧은 표어형으로 둡니다.

## 3. 페이지 구성

`app/page.tsx`의 플래그로 구성을 바꿉니다.

| 플래그 | 값 | 내용 |
| --- | --- | --- |
| `showConceptIntro` | true(현재) | ConceptScenes(히어로 + 모래 전환 + 선인장 장면) → AboutStory → WorkStory |
| | false | 이전 구성: ScrollHero(히어로 + 날아오는 데모 + 브라우저 창 소개·기술) → ProjectCarousel |
| `showLowerSections` | false(현재) | SideProjects, DesignGallery, SiteFooter 숨김 |

- 이전 구성 컴포넌트(ScrollHero, PinnedBrowser, HeroBrowserDemo, ProjectCarousel, About, Skills, WorkGrid)는 삭제하지 않고 보존합니다.
- 헤더 메뉴의 ABOUT(#about)·SKILLS(#skill)·PROJECTS(#project)는 동작합니다. DESIGN(#design)·CONTACT(#contact)는 해당 섹션이 숨겨져 있어 현재 이동할 곳이 없습니다.
- 마무리(GROW.·연락처) 섹션은 아직 없습니다. 푸터를 다시 켜거나 새로 만들 때 기존 연락처 데이터를 사용합니다.
- 음성 소개(VoiceIntro)는 코드만 있고 `public/audio/`가 없습니다. 현재 화면에서도 쓰지 않습니다.

## 4. 폴더 구조

```text
app/                       page, layout(폰트·CustomCursor), globals.css, work/[slug] 상세 페이지
components/
├─ layout/                 SiteNav, SiteFooter, SmoothScroll(Lenis)
├─ sections/
│  ├─ AboutStory, WorkStory           컨셉 흐름의 소개·기술, 대표 프로젝트
│  ├─ About, Skills, ProjectCarousel, WorkGrid, SideProjects, DesignGallery   이전 구성·숨김 섹션(데이터 공유)
│  ├─ hero/                Hero, GrowthScene, HeroAvatar/AvatarCanvas, SandStream, ScrollHero, PinnedBrowser, HeroBrowserDemo, VoiceIntro
│  └─ concept/             ConceptScenes, scenes.ts, CactusScene, WindGust, PollenGrow
└─ ui/                     Reveal, ProjectLinks, ProjectTags, CustomCursor
data/                      projects, navigation, design
assets/                    원본 디자인 소스(커서·모래 PNG). 배포되지 않으며 화면에서 쓰지 않음
public/                    화면에 쓰는 정적 파일(이미지 WebP, 폰트, models/avatar6.glb, 로고)
artifacts/                 화면 캡처와 확인 스크립트
```

- 여러 섹션에서 쓰는 요소는 `ui/`, 히어로 전용은 `sections/hero/`, 사막 이후 컨셉 장면은 `sections/concept/`에 둡니다.
- 폴더를 넘는 참조는 `@/components/...`를 씁니다. 파일을 옮기면 import와 README 경로를 함께 고칩니다.
- 섹션 ID(#about, #skill, #project)와 상세 경로(/work/[slug])를 임의로 바꾸지 않습니다.
- 원본 이미지는 `assets/`, 화면용 변환본은 `public/`에 둡니다. 원본을 교체하면 변환본(WebP)도 다시 만듭니다.

## 5. 디자인 기준

### 색상

| 용도 | 값 | 사용처 |
| --- | --- | --- |
| 기본 글자 | `#202731` | 제목·본문 |
| 보조 글자 | `#58636E` | 설명·라벨 |
| 크림 배경 | `#FBF6EE` | AboutStory·WorkStory, 컨셉 전환 구간 끝 |
| 모래 | `#E3BF91` | 모래 이미지에서 추출, 전환 그라데이션 |
| 따뜻한 구분선 | `#E7DCCB` | 크림 배경 위 구분선 |
| 코랄 | `#E96B5A` | ABSORB. 강조 |
| 선인장 초록 | `#7F9657` | BUILD. 강조, 글자 호버 |
| 노랑·주황 | `#E9A33A` | GROW. 강조 |

- 강조색은 위 세 가지만 쓰고, 작은 표시(점, 밑줄, 태그, 강조 글자)에 한정합니다.
- `tailwind.config.ts`의 `portfolio`·`paper`·`ink`·`forest` 토큰과 `globals.css`의 `--paper`(#F7FBFE) 등은 이전 하늘색 디자인 값입니다. 이전 구성 컴포넌트와 상세 페이지가 사용하므로 요청 범위 밖에서 일괄 교체하지 않습니다.

### 글자

- 제목·큰 문구: `var(--font-editorial), var(--font-hangul-serif)` 순서로 지정합니다. 영문·문장부호는 DM Serif Display, 한글은 Noto Serif KR 600(본명조)으로 나옵니다.
- 본문: Pretendard(`--font-pretendard`), 줄 간격 1.7 기준.
- Noto Serif KR은 `next/font/google`(preload false)이라 빌드할 때 인터넷 연결이 필요합니다. 함렛(Hahmlet)은 한글이 고딕에 가까워 쓰지 않습니다.
- 섹션 제목 36px(모바일 28px), 카드 제목 24px(모바일 20px), 보조 설명 14px, 태그 12px를 기준으로 합니다.
- JavaScript 같은 기술명이 단어 중간에서 끊기지 않는지 확인합니다.

### 너비와 여백

- 본문 최대 너비 1120px, 좌우 여백 PC 40px·모바일 24px, 섹션 상하 PC 96px·모바일 64px.
- 히어로와 컨셉 장면은 전체 화면 구성을 유지합니다.

### 장식

- 프로젝트 이미지와 본문 글자 위에 질감이나 곡선을 겹치지 않습니다.
- 의미 없는 장식은 `aria-hidden`과 `pointer-events: none`을 둡니다. 장식 때문에 가로 스크롤이 생기면 안 됩니다.

## 6. 영역별 현재 구현

### 헤더 (SiteNav)

- 가운데 선인장 로고(`public/images/logo/logo.png`, 76px, 홈 링크)와 오른쪽 햄버거 버튼만 둡니다. 메뉴는 전체 화면 패널로 열립니다.
- 로고 호버: 0.62초 동안 두 번 흔들리는 종 모션(Web Animations API, 재생 중 재호버 무시, 터치·모션 감소 제외).
- 컨셉 트랙 아래 끝이 화면 아래에서 40px 이상 올라오면 html에 `data-header-solid`가 붙고 `.header::before`(PC 108px, 모바일 92px 반투명 흰색+blur)가 나타납니다. 히어로와 컨셉 장면이 고정된 동안에는 배경이 없습니다.
- 모바일 메뉴의 열기·닫기, 바깥 클릭, Escape, 포커스 복귀를 보존합니다. 스크롤에 따른 활성 메뉴 표시는 구현되어 있지 않습니다.
- 메뉴 이름과 목적지는 `data/navigation.ts`에서 관리합니다.

### 히어로 (Hero, GrowthScene, HeroAvatar, SandStream)

- 배경: `public/images/hero/hero-sunlight-bg.webp`(center/cover). GrowthScene이 햇살·그림자 장식을 더합니다.
- 3D 얼굴: AvatarCanvas가 React Three Fiber로 `public/models/avatar6.glb`를 표시합니다. GLB 원본 재질을 쓰고 중복 검은 머리 `Hair_Web.001`만 숨깁니다. 마우스를 따라 회전하고, 1.8초 동안 움직임이 없으면 대기 모션(IDLE_MOTION)으로 바뀝니다. 모델 로드 후 0.8초 쉬었다가 1.8초 동안 나타납니다.
- PC 타이포(1024px 이상, GrowthScene): ABSORB.(왼쪽 위 -7deg) / BUILD.(중앙 -3deg) / GROW.(왼쪽 아래, bottom 26%, BUILD. top 31%) 비대칭 배치. 보이는 너비 비율은 약 GROW. 100 / ABSORB. 70 / BUILD. 40입니다. 1024px 미만에서는 숨기고 얼굴 중심 화면을 씁니다. 실제 h1은 시각적으로 숨긴 채 유지합니다.
- 글자 색: 기본 #202731, ABSORB.의 A·마침표 코랄, BUILD.의 U·마침표 초록, GROW.의 G·마침표 노랑(`:where`로 우선순위를 낮춤).
- 글자 호버: 글자마다 `.char`(호버·색)와 `.glyph`(기울기)로 나뉩니다. 호버한 글자만 #7F9657과 -8~8deg 기울기·2~4px 이동. inline-block으로 사라지는 커닝은 HoverLetters가 원래 위치를 측정해 em 여백으로 보정합니다. 커서는 기본 화살표, 텍스트 선택은 막습니다.
- 단어 부유: 단어 div의 `translate` 애니메이션(5.6s/6.4s/7.2s, ±16/±19/±22px, 위아래만).
- 모래 줄기(SandStream, Canvas 2D): PC는 ABSORB.의 S 위에서 시작해 바람에 휜 중심선(STREAM.path)을 따라 넓게 퍼지며 떨어집니다(PC 10,000개·모바일 2,500개, 초당 약 105~170px). 모바일은 왼쪽 가장자리에서 약하게 흐릅니다.
- 사막 모드(`desert`)에서 히어로는 자체 모래 이미지를 숨기고 cover 높이를 max(600px, 100svh)로 맞춥니다. 같은 위치의 모래는 ConceptScenes가 그립니다.
- 꺼 둔 기능: GrowthScene의 3D 선인장(`SHOW_CACTUS = false`).

### 컨셉 장면 (ConceptScenes)

하나의 고정 트랙(5화면, sticky 무대 높이 max(600px, 100svh), 고정된 동안 4화면 스크롤)에서 진행합니다. 구간은 `scenes.ts`의 SCENES(cover 0~0.27 / build 0.27~0.54 / adapt 0.54~0.76 / grow 0.76~1)이며, 모든 장면은 진행률(story)을 따릅니다.

- cover만 스크롤로 움직입니다. 고정 스크롤의 앞 절반(`COVER_SCROLL` 0.5, 2화면)을 `useSpring(stiffness 55, damping 22)`로 부드럽게 따라갑니다.
- 모래가 수평선에 자리 잡으면 build → adapt → grow가 `PLAY_SECONDS`(7초) 동안 시간 기반으로 재생됩니다(playhead). 뒤 절반(2화면)은 무대를 붙잡아 두는 구간이며 스크롤을 막지 않으므로, 계속 스크롤하면 재생 중에도 지나갈 수 있습니다. 화면 밖으로 나가도 재생은 계속되고, 모래가 다시 선인장을 덮을 만큼 위로 올라가면 처음 상태로 돌아가 다시 내려올 때 재생됩니다.
- 모션 감소 설정에서는 시간 재생 대신 뒤 절반의 스크롤이 build~grow를 움직입니다.
- 트랙 높이(`.track`의 5)와 `COVER_SCROLL`은 함께 고칩니다.

- cover: 모래(`public/images/hero/hero-sand-bg.webp`)가 히어로의 원래 언덕 위치에서 올라와 화면을 덮고(COVER.risen), 덮인 동안 히어로를 숨겨 하늘 배경으로 바꾼 뒤(COVER.swap), 모래 윗선이 무대 62%에 올 때까지 내려갑니다.
- cover 중 헤더(coverHeader): 올라오는 능선 뒤로 가려지고, 덮인 동안 숨겨지며, 내려가는 능선을 따라 다시 드러납니다. CREST_PROFILE(모래 이미지 가로 11지점의 능선 높이)로 clip-path를 만듭니다. cover 구간이 끝나면(local ≥ 1) 인라인 스타일을 모두 지웁니다. 능선이 헤더에 닿기 전에는 clip-path를 걸지 않아 모바일 메뉴 패널이 잘리지 않습니다.
- build: CactusScene(R3F 로우폴리 선인장)이 새싹 → 마디 4개 → 윗머리 → 양팔 순서로 자랍니다. WindGust(가로 모래바람, PC는 마우스 가로 이동으로 강화)에 살짝 휘었다 돌아옵니다. 문구 "직접 만들고".
- adapt: 하늘이 노을 → 밤(별 70개) → 새벽으로 바뀌고, 3D 조명이 돌며 그림자가 회전합니다. 문구 "표면을 설계하고, / 경험을 짓다."(첫 줄 차콜·밤에는 아이보리, 둘째 줄 아이보리).
- grow: 꽃이 피고 PollenGrow가 위에서 떨어지는 모래알로 "GROW."를 왼쪽부터 쌓습니다. 아래에 "웬만해선 시들지 않습니다."와 "선인장처럼, 어떤 환경에서도 생각보다 잘 자라는 사람입니다."(선생님 추천 문구)가 이어집니다.
- 배치: PC 선인장은 오른쪽 70%에 고정(1.18배, 4svh 아래), 모바일은 가운데. 장면 문구는 왼쪽 15vw·높이 26%(모바일 왼쪽 24px·높이 18~20%). GROW. 블록은 무대 33%(모바일 30%) 기준선이며 PollenGrow baseline과 `.closing` top을 함께 고칩니다.
- 전환: 재생의 마지막 15% 동안, 또는 재생이 끝나기 전에 스크롤로 고정 구간 끝 15%에 닿으면 무대 하단이 모래색으로 흐려지고(.groundFade, 선인장 뒤), 트랙 뒤 `.handoff`가 #E3BF91 → `--next-bg`(#FBF6EE)로 이어집니다.
- 층 순서: 하늘(+시간대 층) < 히어로 < 모래 < 색조 < 바닥 흐림 < 선인장 < 모래바람 < 꽃가루 < 문구.
- 성능: 히어로가 덮이면 `[data-pause-scope]`에 `data-paused`를 붙여 AvatarCanvas(frameloop never)와 SandStream을 멈춥니다. 선인장 3D는 모래가 내려가기 시작한 뒤, 무대가 화면에 있을 때만 그립니다.
- 스크린리더 순서: 직접 만들고 → 표면을 설계하고, 경험을 짓다. → GROW.(sr-only) → 웬만해선 시들지 않습니다. → 설명.

### 소개·기술 (AboutStory, #about·#skill)

- 크림 배경, "ABSORB."(코랄 점) 표시, 큰 세리프 문장("화면을 만들고, 클릭했을 때 동작하게 만드는 과정이 재밌습니다."), 모래빛 사진 자리, 이름·직무·교육, 기술 6개를 3열(모바일 2열) 세리프 목록으로 보여 줍니다.
- 데이터는 `About.tsx`의 `profile`, `Skills.tsx`의 `skills`를 씁니다. 소개글·자격증·기술 설명은 값이 있을 때만 표시합니다.

### 대표 프로젝트 (WorkStory, #project)

- 크림 배경, "BUILD."(초록 점) 표시, 자리 표시 안내 문구(예시가 있을 때만), mainProjects를 16:9 이미지와 설명이 좌우로 번갈아 놓이는 행으로 보여 줍니다(900px 미만은 세로).
- 이미지·제목·"상세 보기"는 /work/[slug]로 연결됩니다. sideProjects가 있을 때만 "이전 작업" 번호 목록이 나오며 현재 데이터에는 없습니다.

### 커스텀 커서 (CustomCursor)

- `app/layout.tsx`에서 전역으로 렌더링합니다. `(hover: hover) and (pointer: fine) and (min-width: 768px)`에서만 켜지고, html의 `has-custom-cursor`로 기본 커서를 숨깁니다(입력창 제외).
- 기본(26px, 프레임당 38% 보간, 빠를 때만 최대 8% 늘어남) / 호버(a[href]·button·interactive role·`[data-cursor="hover"]`에서 투명 구로 0.24초 전환) / 클릭(물방울 이미지 0.42초 후 제거).
- 화면용 파일은 `public/images/cursor/*.webp`, 원본은 `assets/cursor/*.png`입니다.

## 7. 스타일 작성 방식

- 새 섹션과 복잡한 장면은 CSS Module, 이전 구성의 일반 UI는 Tailwind를 씁니다. 통일한다는 이유만으로 전체를 다시 쓰지 않습니다.
- `app/globals.css`: 전역 변수, 기본 스타일, 키보드 포커스, 모션 감소, 커스텀 커서 숨김 규칙.
- 런타임 값(스크롤 진행률, 위치)은 인라인 스타일이나 CSS 변수로 넣습니다.
- `ProjectLinks`·`ProjectTags`는 상세 페이지에서도 씁니다. 기본 표현을 바꾸면 다른 사용처를 확인합니다.
- `Reveal`은 서버가 숨김 상태로 렌더링합니다. 모션 감소 설정에서도 애니메이션을 건너뛰지 말고 지속 0초로 보이게 둡니다(건너뛰면 내용이 투명하게 남음).

## 8. 이미지와 데이터

- 프로젝트·디자인·내비게이션 데이터는 `data/`에서 관리합니다. 상세 페이지는 대표 프로젝트만 대상으로 하며, 보조 프로젝트에 상세 링크를 넣기 전에 라우트 지원을 확인합니다.
- 이 환경에는 sharp가 없어 Next 이미지 최적화가 큰 PNG에서 멈춥니다. 큰 이미지는 미리 WebP로 변환하고 `unoptimized`로 불러옵니다(모래, 커서).
- 모래 이미지를 교체하면 WebP 재생성, 능선 높이(35%, CREST_PROFILE), 전환 모래색(#E3BF91)을 다시 확인합니다.
- 이미지가 바뀌지 않으면 실제 파일, 참조 경로, 브라우저 요청 주소와 로딩 상태를 확인합니다. 캐시 문제로 단정하거나 생성물을 먼저 지우지 않습니다.
- 이미지 교체 후 비율, 잘림, 대체 텍스트를 확인합니다.

## 9. 접근성과 모션

- 제목 계층, 대체 텍스트, 버튼의 접근 가능한 이름, 키보드 포커스 표시를 유지합니다.
- `prefers-reduced-motion`: 단어 부유·모래 줄기·모래바람·커서 보간을 멈추고, 선인장은 다 자란 상태로 보이며, 하늘·꽃·꽃가루는 스크롤에 맞춰 바뀝니다.
- 장식 캔버스와 3D 영역은 `aria-hidden`, 의미 있는 문구는 텍스트로 둡니다(꽃가루 "GROW."는 sr-only 텍스트를 함께 둠).
- 화면 밖 애니메이션은 멈춥니다(IntersectionObserver, data-paused).

## 10. 작업 및 확인 절차

1. 수정할 파일과 관련 스타일·데이터를 먼저 확인합니다.
2. 요청한 영역만 수정하고, 관계없는 콘텐츠나 기능을 함께 바꾸지 않습니다.
3. 코드 변경 후 최소 `npx.cmd tsc --noEmit -p .`로 타입을 확인하고, 마무리 단계에서는 `npm.cmd run build`를 실행합니다. 이 Windows 환경에서는 `npm` 대신 `npm.cmd`를 씁니다.
4. 화면 변경은 PC 1440×900과 모바일 390×844를 기본으로, 반응형 변경은 1024px·320px도 확인합니다.
5. 가로 넘침, 글자·버튼 겹침, 이미지 로딩 실패, 브라우저 오류를 확인하고, 기능 변경은 해당 조작(호버, 클릭, 메뉴 이동)을 직접 확인합니다.
6. 캡처는 `artifacts/` 아래 새 폴더에 저장하고 기존 캡처를 덮어쓰지 않습니다.
7. 결과는 변경 내용, 확인한 사항, 남은 한계를 설명합니다. 실행하지 않은 검사는 통과했다고 쓰지 않습니다.

- 단순 문서 수정에는 빌드가 필요하지 않습니다. 내용과 경로의 정확성을 확인합니다.
- `.next/`, `node_modules/` 등 생성물은 직접 수정하지 않습니다. 파일은 UTF-8로 저장하고 한글이 깨지지 않았는지 확인합니다.

### 개발 서버와 빌드

- 사용자가 3000번 포트에서 개발 서버를 띄워 두는 경우가 많습니다. 개발 서버와 프로덕션 빌드는 `.next/`를 공유하므로 동시에 실행하지 않습니다. 포트만 바꿔도 충돌은 해결되지 않습니다.
- 사용자 서버를 유지한 채 빌드해야 하면, `next.config.mjs`에 `distDir: process.env.NEXT_DIST_DIR || ".next"`를 잠시 넣고 `NEXT_DIST_DIR=.next-verify npm.cmd run build`로 확인합니다. 끝나면 `next.config.mjs`와 `tsconfig.json`(빌드가 include를 추가함)을 원래대로 되돌리고 `.next-verify`를 지웁니다.
- 에이전트가 띄운 서버는 작업 종료 시 정리하고, 사용자 서버나 관계없는 Node 프로세스는 종료하지 않습니다.
- CSS 로딩 실패나 모듈 누락은 응답 상태와 서버 로그부터 확인해 코드 문제와 산출물 충돌을 구분합니다.
- 빌드 결과와 브라우저 확인 결과는 따로 보고하고, 과거 빌드 성공을 현재 변경의 근거로 쓰지 않습니다. `lint`는 별도 ESLint 설정이 없으므로 실행하지 않았다면 완료 목록에 넣지 않습니다.
- 빌드 시 `metadataBase` 미설정 경고가 나옵니다(기존 경고).

### 캡처와 브라우저 확인

- Playwright는 `%LOCALAPPDATA%/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright`에 있습니다. 새 스크립트는 대상 주소를 인자로 받게 작성하고, 테스트 프레임워크나 의존성을 추가하지 않습니다.
- 3D 화면 때문에 headless 브라우저가 느립니다. 첫 요청은 `waitUntil: "domcontentloaded"`와 넉넉한 timeout을 쓰고, 이동 후 2~3초 기다린 뒤 캡처합니다. 스프링으로 따라오는 장면은 더 기다립니다.
- 애니메이션 시점에 따라 값이 달라지는 확인(픽셀 비교, 호버 색)은 해당 애니메이션·전환을 잠시 끄고 측정합니다.
- 빈 제목이나 로딩 중 화면을 정상 결과로 보고하지 않습니다. 헤더 검증은 헤더를 숨기지 않은 일반 화면으로 합니다.
- 기존 캡처는 그 시점의 비교 기준이며 최신 변경을 반영한다고 가정하지 않습니다.

## 11. 남은 작업

1. 마무리(GROW.) 섹션과 연락처: 푸터를 컨셉 톤으로 다시 켜거나 새로 구성(연락처 데이터 재사용, 문구는 사용자 확인)
2. 헤더 메뉴의 DESIGN·CONTACT 대상 정리(섹션 표시 또는 메뉴 조정)
3. 실제 소개·사진·프로젝트·이미지 등록(사용자 요청 시)
4. 상세 페이지(/work/[slug])를 크림 톤으로 맞출지 결정
5. 전체 `npm.cmd run build`와 PC·태블릿·모바일 최종 점검

이 순서는 작업 방향이며, 사용자가 요청하지 않은 단계를 자동으로 진행하라는 뜻은 아닙니다.
