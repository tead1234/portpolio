# Portpolio (React + Vite + SQLite)

프로젝트 목록/상세를 보여주는 포트폴리오 웹사이트입니다.

## 로컬 실행 (Node)

```bash
npm install
npm run dev
```

- 프론트엔드(Vite): `http://localhost:5173`
- API 서버(Express + SQLite): `http://localhost:3001` (개발 모드)

## Docker로 실행 (권장)

```bash
docker compose up --build
```

브라우저 접속:
- `http://localhost`

## 데이터 저장 위치

- 프로젝트 데이터는 SQLite 파일에 저장됩니다.
- 초기에는 프로젝트 데이터가 비어 있으며, 관리자 로그인 후 직접 등록합니다.
- 기본 파일 경로: `data/portfolio.db` (환경변수 `DATA_DIR`/`DB_PATH`로 변경 가능)
- Docker 실행 시 명명 볼륨 `portfolio-data:/app/data`를 사용하므로 `docker compose down` 후 재실행해도 데이터가 유지됩니다.
- 단, `docker compose down -v`를 실행하면 볼륨이 삭제되어 데이터가 초기화됩니다.

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
