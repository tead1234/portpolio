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
