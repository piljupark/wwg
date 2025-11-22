# Trip Planner 🗺️

여행 일정을 지도 기반으로 계획하고 공유하는 웹 애플리케이션입니다.

## 주요 기능

### ✅ 완성된 기능
- 🗺️ Google Maps 기반 지도 표시
- 📍 목적지 검색 및 추가
- 🚗 이동수단 선택 (자동차, 대중교통, 도보, 자전거)
- 📅 일차별 여행 계획 관리
- 🔐 Google 로그인 연동
- 💾 Firebase Firestore 데이터 저장
- 🎨 애플/토스 스타일 모바일 최적화 UI

### 🚧 추가 개발 필요
- 경로 정보 표시 (거리, 소요시간)
- 목적지 드래그 앤 드롭 순서 변경
- 여행 계획 공유 기능
- 여행 계획 목록 페이지
- 목적지 상세 정보 모달

## 시작하기

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

\`\`\`bash
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCrEIrLmBSDhv6oOzThNAlSDRWcWcsGPdU

# Firebase Configuration (Firebase 콘솔에서 확인)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 2. 패키지 설치

\`\`\`bash
npm install
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Authentication > Sign-in method에서 Google 활성화
4. Firestore Database 생성 (테스트 모드로 시작)
5. 프로젝트 설정에서 웹 앱 추가
6. 설정 정보를 `.env.local`에 입력

## Google Maps API 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. 다음 API 활성화:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. 사용자 인증 정보에서 API 키 생성
5. API 키 제한사항 설정:
   - 애플리케이션 제한사항: HTTP 리퍼러
   - 웹사이트 제한사항: `http://localhost:3000/*`

## 프로젝트 구조

\`\`\`
trip-planner/
├── app/                    # Next.js 페이지
│   ├── login/             # 로그인 페이지
│   ├── planner/           # 여행 계획 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # 글로벌 스타일
├── components/            # React 컴포넌트
│   ├── TripMap.tsx       # 지도 컴포넌트
│   ├── DayTabs.tsx       # 일차 탭
│   ├── DestinationSearch.tsx  # 목적지 검색
│   ├── DestinationList.tsx    # 목적지 리스트
│   └── TransportSelector.tsx  # 이동수단 선택
├── lib/                   # 유틸리티 함수
│   ├── firebase.ts       # Firebase 설정
│   ├── firestore.ts      # Firestore 함수
│   └── googleMaps.ts     # Google Maps 함수
├── store/                 # 상태 관리
│   └── tripStore.ts      # Zustand 스토어
├── types/                 # TypeScript 타입
│   └── trip.ts           # 여행 관련 타입
└── public/               # 정적 파일
\`\`\`

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Maps**: Google Maps Platform
- **Icons**: Lucide React

## 개발 참고사항

### Google Maps API 사용량
- 무료 할당량: 월 $200 크레딧
- Maps JavaScript API: 1,000회 로드당 $7
- Places API: 1,000회 요청당 $17-32
- Directions API: 1,000회 요청당 $5

### Firebase 무료 할당량
- Firestore: 읽기 50,000회/일, 쓰기 20,000회/일
- Authentication: 무제한
- Storage: 1GB

## 다음 단계

1. Firebase 설정 완료
2. 실제 API 키로 교체
3. 경로 정보 표시 기능 추가
4. 여행 계획 저장/불러오기 기능 구현
5. 공유 기능 구현
6. Vercel 배포

## 라이선스

MIT
