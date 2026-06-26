# ParkView 설정 가이드

미니어처 주차장 모형을 웹캠으로 촬영해 YOLOv8로 차량을 감지하고, Firebase Realtime Database를 거쳐 브라우저에서 실시간으로 보는 시스템입니다.

## 1. 패키지 설치

```bash
cd 주차장
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

처음 실행 시 `yolov8n.pt` 모델 파일이 자동으로 다운로드됩니다 (인터넷 필요).

## 2. Firebase 프로젝트 준비

이미 Firebase 계정이 있다는 가정하에 진행합니다.

### 2-1. Realtime Database 생성

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트 선택
2. 왼쪽 메뉴 **빌드 > Realtime Database** 클릭
3. **데이터베이스 만들기** → 위치 선택 → 테스트 모드 또는 잠금 모드 선택
   - 처음엔 테스트 모드로 시작해도 되지만, 실제 사용 시에는 보안 규칙을 설정하세요.
4. 생성된 데이터베이스 URL을 복사해둡니다.
   - 형태: `https://프로젝트ID-default-rtdb.리전.firebasedatabase.app`

### 2-2. 서비스 계정 키 발급 (detect.py 가 사용)

`detect.py`는 서버(파이썬)에서 Firebase Admin SDK로 데이터를 씁니다. 이를 위해 서비스 계정 키가 필요합니다.

1. Firebase 콘솔 → **프로젝트 설정(톱니바퀴 아이콘)** → **서비스 계정** 탭
2. **새 비공개 키 생성** 클릭 → JSON 파일 다운로드
3. 다운로드한 파일을 `주차장/serviceAccountKey.json` 으로 저장
   - **절대 git에 커밋하지 마세요.** (`.gitignore`에 추가 권장)

### 2-3. 웹 앱 설정 (index.html 이 사용)

`index.html`은 브라우저에서 Firebase JS SDK로 데이터를 읽기만 합니다. 이를 위해 웹 앱 설정값이 필요합니다.

1. Firebase 콘솔 → **프로젝트 설정** → **일반** 탭 → 하단 **내 앱**
2. 웹 앱이 없다면 `</>` 아이콘으로 웹 앱 추가
3. 표시되는 `firebaseConfig` 객체를 복사
4. `index.html` 하단 `<script type="module">` 안의 `firebaseConfig` 값을 본인 값으로 교체

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "https://....firebasedatabase.app",
  projectId: "...",
};
```

### 2-4. (권장) 보안 규칙 설정

읽기는 누구나 가능하게, 쓰기는 서비스 계정(Admin SDK)만 가능하게 하려면 Realtime Database 규칙을 다음과 같이 설정할 수 있습니다.

```json
{
  "rules": {
    "parking": {
      ".read": true,
      ".write": false
    }
  }
}
```

> Admin SDK는 보안 규칙을 우회하므로 `detect.py`는 정상적으로 쓸 수 있고, 브라우저에서의 직접 쓰기만 막힙니다.

## 3. config.json 설정

`config.json`에서 다음을 본인 환경에 맞게 수정합니다.

```json
{
  "firebase": {
    "databaseURL": "https://프로젝트ID-default-rtdb.리전.firebasedatabase.app",
    "serviceAccountKeyPath": "serviceAccountKey.json"
  },
  "camera": {
    "deviceIndex": 0,
    "width": 1280,
    "height": 720
  }
}
```

- `databaseURL`: 2-1에서 복사한 URL
- `serviceAccountKeyPath`: 2-2에서 저장한 파일 이름/경로 (기본값 그대로 두면 됨)
- `camera.deviceIndex`: 웹캠이 여러 개면 0, 1, 2 중 맞는 번호로 변경 (보통 내장 웹캠은 0)

`floors.spots`는 주차 칸 좌표 목록입니다. 직접 숫자를 입력해도 되고, 아래 캘리브레이션 모드로 마우스로 지정해도 됩니다.

## 4. 주차 칸 좌표 캘리브레이션

웹캠 화면을 보면서 마우스로 드래그해 주차 칸 영역을 지정할 수 있습니다.

```bash
python3 detect.py --calibrate
```

1. 미니어처 모형이 잘 보이도록 웹캠을 고정
2. 화면에서 각 주차 칸 위에 마우스로 드래그해 사각형을 그림
3. 터미널에 칸 ID, 층 이름, 종류(normal/woman/disabled)를 입력
4. 모든 칸을 다 그렸으면 `s` 키로 `config.json`에 저장
5. `q` 키로 종료

기존에 그려둔 칸은 다시 캘리브레이션 모드를 열었을 때 화면에 표시되어 겹치지 않게 추가할 수 있습니다.

## 5. 실행

```bash
python3 detect.py
```

- 웹캠 화면에 칸 영역(초록=빈칸, 빨강=주차됨)과 감지된 차량 박스가 표시됩니다.
- 0.5초마다 각 칸의 점유 여부가 Firebase에 업데이트됩니다.
- `q` 키로 종료합니다.

Firebase 연결 없이 카메라/감지 로직만 테스트하려면:

```bash
python3 detect.py --no-firebase
```

## 6. 브라우저에서 확인

`index.html`을 더블클릭하거나 간단한 로컬 서버로 열면 됩니다.

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

`detect.py`가 실행 중이면 칸 상태가 실시간으로 갱신됩니다.

## 개인정보 보호 안내

- 웹캠 영상 원본은 어디로도 전송되지 않습니다. 모든 영상 처리는 로컬(Mac)에서만 이루어집니다.
- Firebase에 저장되는 정보는 각 칸의 `occupied`(true/false)와 `type` 뿐이며, 이미지나 차량 식별 정보는 포함되지 않습니다.
