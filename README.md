# Portpolio (React + Vite)

프로젝트 목록/상세를 보여주는 포트폴리오 웹사이트입니다.

## 로컬 실행 (Node)

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

## Docker로 실행 (권장)

아래 명령으로 이미지 빌드 + 컨테이너 실행 후 브라우저에서 `http://localhost:8080` 접속:

```bash
docker compose up --build
```

백그라운드 실행:

```bash
docker compose up --build -d
```

중지:

```bash
docker compose down
```

## 배포 빌드 확인

```bash
npm run build
```

## 참고

- 현재 저장소 기본 작업 브랜치는 `work` 입니다.



## 관리자 기능

- 수정/삭제/추가는 관리자 로그인 후에만 가능합니다.
- 기본 비밀번호: `admin1234` (필요 시 `src/App.jsx`의 `ADMIN_PASSWORD` 값 변경)
