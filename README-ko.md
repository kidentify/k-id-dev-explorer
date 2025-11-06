# k-ID Dev Explorer

k-ID 컴플라이언스 개발 키트(CDK) 플로우를 탐색하고 테스트하기 위한 대화형 개발자 도구입니다. Next.js로 구축되었으며, 모든 CDK 플로우 타입을 테스트하고, API 트래픽을 실시간으로 관찰하며, k-ID의 연령 확인 및 컴플라이언스 플로우를 애플리케이션에 통합하는 방법을 이해할 수 있는 시각적 인터페이스를 제공합니다.

![k-ID Dev Explorer Screenshot](./cdk-screenshot.png)

## k-ID CDK란?

k-ID 컴플라이언스 개발 키트는 연령 확인, 부모 동의 및 컴플라이언스 관리를 위한 사전 구축된 플로우 세트를 제공합니다. 이 도구는 다음을 제공하여 개발자가 이러한 플로우를 통합하는 방법을 이해할 수 있도록 도와줍니다:

- **시각적 플로우 테스트**: 실제 API 호출로 모든 CDK 플로우 타입 테스트
- **실시간 API 트래픽**: 플로우 실행 시 요청 및 응답 관찰
- **트래픽 로깅**: 디버깅 및 분석을 위한 API 트래픽 로그 다운로드
- **Webhook 수신기**: ngrok 지원으로 Webhook 통합 테스트

전체 문서는 [k-ID Developer Hub](https://docs.k-id.com)를 방문하세요.

## 🚀 빠른 시작

### 필수 조건

시스템에 ngrok이 설치되어 있는지 확인하세요:
- **macOS**: `brew install ngrok`
- **Windows**: [ngrok.com](https://ngrok.com/download)에서 다운로드
- **Linux**: [ngrok.com](https://ngrok.com/download)에서 다운로드

### 설치

먼저 종속성을 설치합니다:

```bash
npm install
```

## 환경 설정

### k-ID API 구성

1. 예제 환경 파일을 복사합니다:
   ```bash
   cp .env.example .env.local
   ```

2. [k-ID Compliance Studio](https://portal.k-id.com)에서 API 키를 가져옵니다

3. `.env.local`을 편집하고 API 키를 추가합니다:
   ```bash
   K_ID_API_KEY=your_actual_api_key_here
   K_ID_API_URL=https://game-api.test.k-id.com
   ```

   `your_actual_api_key_here`를 Compliance Studio에서 가져온 실제 API 키로 교체하세요. `K_ID_API_URL`은 기본적으로 테스트 환경으로 설정됩니다. 준비가 되면 프로덕션 환경 URL로 변경하세요.

k-ID 시작하기에 대한 자세한 내용은 [k-ID Developer Hub](https://docs.k-id.com)를 참조하세요.

## 애플리케이션 실행

### 옵션 1: 로컬 개발만
```bash
npm run dev
```
- 서버가 `http://localhost:3100`에서 실행됩니다
- Webhook URL: `http://localhost:3100/api/webhook`

### 옵션 2: 로컬 + 외부 액세스 (권장)
```bash
npm run dev:remote
```
- 서버가 `http://localhost:3100`에서 실행됩니다
- Ngrok 터널이 외부 HTTPS URL을 생성합니다
- Webhook URL: `https://[random].ngrok-free.app/api/webhook`

**참고**: ngrok 계정 및 인증 토큰이 없는 한, 원격 개발 서버를 재시작할 때마다 ngrok URL이 변경됩니다.

**📱 모바일 액세스를 위한 QR 코드**: ngrok(옵션 2)으로 실행할 때, QR 코드가 자동으로 생성되어 "Public Tunnel Access" 섹션에 표시됩니다. 휴대폰으로 이 QR 코드를 스캔하면 모바일 기기에서 k-ID Dev Explorer에 액세스할 수 있어 모바일 기기에서 직접 CDK 플로우를 테스트할 수 있습니다.

### ⚠️ 중요: WebAuthn 요구사항

로컬에서 개발할 때 **HTTPS로 실행하지 않으면 연령 키 생성 및 검증이 작동하지 않습니다**. 이는 WebAuthn의 요구사항입니다. 이것은 ngrok 터널(옵션 2)의 또 다른 중요한 사용 사례입니다. 연령 키 생성 또는 검증을 포함하는 플로우를 테스트하는 경우, 애플리케이션이 HTTPS를 통해 액세스 가능하도록 `npm run dev:remote`를 사용해야 합니다.

## 사용 방법

k-ID Dev Explorer는 k-ID CDK 플로우를 테스트하는 대화형 방법을 제공합니다:

1. **플로우 선택**: 드롭다운 메뉴에서 CDK 플로우 타입을 선택합니다(예: Age Gate, Access Age Verification, Age Appeal 등)

2. **필수 필드 입력**: 선택한 플로우에 필요한 필드를 입력합니다:
   - **관할권**: 대부분의 플로우에 필요합니다(예: "US-CA", "GB")
   - **연령 기준**: 연령 숫자 또는 연령 카테고리(일부 플로우에 필요)
   - **대상자 정보**: 이메일, ID, 생년월일 또는 주장된 연령(일부 플로우에 선택사항)
   - **로케일**: 언어/로케일 코드(예: "en-GB") - 일부 플로우에 선택사항

3. **"Embed CDK Flow" 클릭**: 이렇게 하면 k-ID에 대한 API 호출이 시작되고 반환된 URL이 화면 오른쪽의 iframe에 포함됩니다.

4. **트래픽 관찰**: **Events & API Traffic** 창에서 다음을 확인합니다:
   - k-ID에 대한 API 요청
   - URL 및 ID가 포함된 API 응답
   - iframe의 PostMessage 이벤트
   - Webhook 이벤트(구성된 경우)
   - 오류 또는 경고

5. **플로우 단계별 진행**: iframe에 포함된 CDK 플로우와 상호 작용합니다. 확인 단계를 진행하면서 이벤트 창에 나타나는 이벤트를 관찰합니다.

6. **트래픽 로그 다운로드**: Events & API Traffic 섹션의 **Download** 버튼을 클릭하여 모든 API 트래픽의 복사본을 텍스트 파일로 저장하여 분석 또는 디버깅에 사용합니다.

### 사용 가능한 CDK 플로우

- **Access Age Verification**: 액세스 권한 부여 전에 사용자의 연령을 확인
- **Age Gate**: 사용자에게 연령 확인 옵션 제공
- **Facial Age Estimation**: 얼굴 인식을 사용하여 연령 추정
- **ID Verification**: 정부 발급 신분증을 사용하여 신원 확인
- **Trusted Adult Verification**: 신뢰할 수 있는 성인 확인을 통해 확인
- **Age Appeal**: 사용자가 연령 확인 결정에 대해 이의를 제기할 수 있도록 허용
- **VPC End-to-End**: 완전한 확인, 동의 및 권한 플로우
- **Direct Notices**: 컴플라이언스 공지를 직접 표시
- **Manage Session Permissions**: 기존 세션의 권한 관리

각 플로우에 대한 자세한 문서는 [k-ID Developer Hub](https://docs.k-id.com)를 방문하세요.

## 🌐 Webhook 수신기

애플리케이션에는 ngrok 터널을 통해 로컬 및 외부에서 액세스할 수 있는 Webhook 수신기가 포함되어 있습니다.

### Webhook URL

애플리케이션은 ngrok이 실행 중일 때 외부 URL을 자동으로 감지하고 표시합니다:

- **🌐 외부 URL**: `https://[random].ngrok-free.app/api/webhook`(ngrok이 활성화된 경우)
- **🏠 로컬 URL**: `http://localhost:3100/api/webhook`(ngrok이 실행되지 않은 경우의 폴백)

**Webhook URL 구성**: k-ID에서 Webhook 이벤트를 수신하려면 [k-ID Compliance Studio](https://portal.k-id.com)에서 Webhook URL을 구성해야 합니다. 제품 설정으로 이동하여 Webhook 수신기 URL을 위의 외부 URL(ngrok 사용 시) 또는 배포된 애플리케이션 URL로 설정합니다. Webhook URL은 k-ID가 애플리케이션에 이벤트를 보낼 수 있도록 공개적으로 액세스 가능해야 합니다.

## 📊 실시간 모니터링

- **이벤트 창**: 모든 Webhook 이벤트가 메인 인터페이스에 실시간으로 표시됩니다
- **Server-Sent Events**: Webhook을 수신할 때 자동 업데이트
- **이벤트 세부정보**: 헤더, 본문, 메서드 및 타임스탬프를 포함한 전체 요청 정보
- **복사 기능**: 복사 버튼을 클릭하여 Webhook 데이터를 클립보드에 복사

## 🛠️ 개발

### 환경 변수

`.env.example`을 `.env.local`로 복사하고 구성합니다:

- `K_ID_API_KEY` - k-ID API 키(CDK 플로우에 필요)
  - [k-ID Compliance Studio](https://portal.k-id.com)에서 API 키 가져오기
- `K_ID_API_URL` - k-ID API 기본 URL(기본값: https://game-api.test.k-id.com)
  - 테스트 환경: `https://game-api.test.k-id.com`
  - 프로덕션 환경: `https://game-api.k-id.com`
- `PORT` - 서버 포트(기본값: 3100, 선택사항)
- `NEXT_PUBLIC_APP_URL` - 로컬 URL 재정의(선택사항)

### 스크립트

- `npm run dev` - 개발 서버만 시작
- `npm run dev:remote` - ngrok 터널과 함께 개발 서버 시작
- `npm run dev:ngrok` - ngrok 터널만 시작
- `npm run build` - 프로덕션용 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행

## 📝 참고사항

- Ngrok은 보안을 위해 기본적으로 HTTPS 터널을 생성합니다
- 애플리케이션은 HTTP 및 HTTPS 터널을 자동으로 감지합니다
- Webhook 이벤트는 메모리에 저장됩니다(최근 100개 이벤트)
- SSE 연결에는 연결을 유지하기 위한 하트비트가 포함됩니다
- Ngrok 터널 정보는 10초마다 새로 고침됩니다
- 이벤트 창에는 의미 있는 이벤트만 표시됩니다(API 트래픽, Webhook 페이로드, JS 이벤트)

## 문서 및 리소스

- **[k-ID Developer Hub](https://docs.k-id.com)** - k-ID의 전체 문서 및 통합 가이드
- **[k-ID Compliance Studio](https://portal.k-id.com)** - API 키를 가져오고 k-ID 통합 관리
- **[k-ID CDK Documentation](https://docs.k-id.com/docs/cdk/intro)** - CDK 개요 및 시작하기
- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js 프레임워크 문서
- **[Ngrok Documentation](https://ngrok.com/docs)** - Ngrok 터널링 문서



