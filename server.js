import express from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 80);
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'portfolio.db');

const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const normalizeProject = (project) => ({
  ...project,
  stats: {
    difficulty: Number(project?.stats?.difficulty ?? 3),
    novelty: Number(project?.stats?.novelty ?? 3),
    impact: Number(project?.stats?.impact ?? 3),
    scalability: Number(project?.stats?.scalability ?? 3)
  },
  metrics:
    Array.isArray(project?.metrics) && project.metrics.length > 0
      ? project.metrics
      : [
          { label: '구현 난이도', value: `${Number(project?.stats?.difficulty ?? 3)}/5` },
          { label: '신기술 사용도', value: `${Number(project?.stats?.novelty ?? 3)}/5` },
          { label: '사용자 임팩트', value: `${Number(project?.stats?.impact ?? 3)}/5` },
          { label: '확장성', value: `${Number(project?.stats?.scalability ?? 3)}/5` }
        ]
});

const initDb = async () => {
  await run('CREATE TABLE IF NOT EXISTS projects (slug TEXT PRIMARY KEY, data TEXT NOT NULL)');
  await run('CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, password TEXT NOT NULL)');

  const admin = await get('SELECT username FROM admins WHERE username = ?', [ADMIN_USERNAME]);
  if (!admin) {
    await run('INSERT INTO admins (username, password) VALUES (?, ?)', [ADMIN_USERNAME, ADMIN_PASSWORD]);
  }

};

const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  const row = await get('SELECT username FROM admins WHERE username = ? AND password = ?', [username, password]);
  if (!row) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, username });
});

app.get('/api/projects', async (_req, res) => {
  const rows = await all('SELECT data FROM projects ORDER BY rowid DESC');
  res.json(rows.map((row) => JSON.parse(row.data)));
});

app.post('/api/projects', authRequired, async (req, res) => {
  const project = normalizeProject(req.body || {});
  if (!project.slug) return res.status(400).json({ message: 'slug is required' });
  await run('INSERT INTO projects (slug, data) VALUES (?, ?)', [project.slug, JSON.stringify(project)]);
  res.status(201).json(project);
});

app.put('/api/projects/:slug', authRequired, async (req, res) => {
  const project = normalizeProject({ ...req.body, slug: req.params.slug });
  await run('UPDATE projects SET data = ? WHERE slug = ?', [JSON.stringify(project), req.params.slug]);
  res.json(project);
});

app.delete('/api/projects/:slug', authRequired, async (req, res) => {
  await run('DELETE FROM projects WHERE slug = ?', [req.params.slug]);
  res.status(204).send();
});

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
});
