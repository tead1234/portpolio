# Portpolio (React + Vite + SQLite)

프로젝트 목록/상세를 보여주는 포트폴리오 웹사이트입니다.

## 로컬 실행 (Node)

```bash
npm install
npm run dev
```

- 프론트엔드(Vite): `http://localhost:5173`
- API 서버(Express + SQLite): `http://localhost:3001`

## Docker로 실행 (권장)

```bash
docker compose up --build
```

브라우저 접속:
- `http://localhost:8080`

## 데이터 저장 위치

- 프로젝트 데이터는 SQLite 파일에 저장됩니다.
- 초기에는 프로젝트 데이터가 비어 있으며, 관리자 로그인 후 직접 등록합니다.
- 기본 파일 경로: `data/portfolio.db`
- Docker 실행 시 `./data:/app/data` 볼륨을 사용하므로 컨테이너 재시작 후에도 데이터가 유지됩니다.

## 관리자 기능

- 수정/삭제/추가는 관리자 로그인 후에만 가능합니다.
- 기본 계정:
  - 아이디: `admin`
  - 비밀번호: `admin1234`
- 운영 시에는 환경변수로 변경 권장:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `JWT_SECRET`

## 배포 빌드 확인

```bash
npm run build
```
