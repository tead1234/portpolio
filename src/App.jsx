import { useEffect, useMemo, useState } from 'react';

const statusOptions = ['전체', '운영중', '완료', 'PoC'];
const ADMIN_TOKEN_KEY = 'portfolio-admin-token-v1';

const emptyForm = {
  title: '',
  category: 'Web',
  status: 'PoC',
  period: '',
  summary: '',
  goal: '',
  implementation: '',
  stack: '',
  liveUrl: '',
  repoUrl: '',
  difficulty: '3',
  novelty: '3',
  impact: '3',
  scalability: '3'
};

const pastelPalette = [
  ['#FFE6EA', '#FFD6E0'],
  ['#E7F4FF', '#D9EEFF'],
  ['#EAFBE7', '#DDF7D9'],
  ['#FFF5DF', '#FFEBC8'],
  ['#F2EBFF', '#E8DDFF'],
  ['#E6FAF8', '#D4F4F0']
];

const toSlug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const clamp5 = (value) => Math.min(5, Math.max(1, Number(value) || 1));

const normalizeProject = (project) => ({
  ...project,
  stats: {
    difficulty: clamp5(project?.stats?.difficulty ?? 3),
    novelty: clamp5(project?.stats?.novelty ?? 3),
    impact: clamp5(project?.stats?.impact ?? 3),
    scalability: clamp5(project?.stats?.scalability ?? 3)
  }
});

const serializeForm = (form) => ({
  title: form.title.trim(),
  category: form.category.trim() || 'General',
  status: form.status,
  period: form.period.trim(),
  summary: form.summary.trim(),
  goal: form.goal.trim(),
  implementation: form.implementation.trim(),
  stack: form.stack
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  metrics: [
    { label: '구현 난이도', value: `${clamp5(form.difficulty)}/5` },
    { label: '신기술 사용도', value: `${clamp5(form.novelty)}/5` },
    { label: '사용자 임팩트', value: `${clamp5(form.impact)}/5` },
    { label: '확장성', value: `${clamp5(form.scalability)}/5` }
  ],
  liveUrl: form.liveUrl.trim(),
  repoUrl: form.repoUrl.trim(),
  stats: {
    difficulty: clamp5(form.difficulty),
    novelty: clamp5(form.novelty),
    impact: clamp5(form.impact),
    scalability: clamp5(form.scalability)
  }
});

const fillFormFromProject = (project) => ({
  title: project.title,
  category: project.category,
  status: project.status,
  period: project.period,
  summary: project.summary,
  goal: project.goal,
  implementation: project.implementation,
  stack: project.stack.join(', '),
  liveUrl: project.liveUrl,
  repoUrl: project.repoUrl,
  difficulty: String(project.stats.difficulty),
  novelty: String(project.stats.novelty),
  impact: String(project.stats.impact),
  scalability: String(project.stats.scalability)
});

function RadarChart({ stats }) {
  const axes = [
    { key: 'difficulty', label: '구현 난이도', angle: -90, value: stats.difficulty },
    { key: 'novelty', label: '신기술 사용도', angle: 0, value: stats.novelty },
    { key: 'impact', label: '사용자 임팩트', angle: 90, value: stats.impact },
    { key: 'scalability', label: '확장성', angle: 180, value: stats.scalability }
  ];

  const center = 70;
  const radius = 48;

  const toXY = (angleDeg, ratio) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: center + Math.cos(rad) * radius * ratio,
      y: center + Math.sin(rad) * radius * ratio
    };
  };

  const valuePoints = axes.map((axis) => toXY(axis.angle, axis.value / 5));

  return (
    <div className="spark-wrap">
      <svg viewBox="0 0 140 140" aria-label="4축 레이더 차트" className="spark-chart">
        {[1, 2, 3, 4, 5].map((level) => {
          const ratio = level / 5;
          const poly = axes.map((axis) => {
            const p = toXY(axis.angle, ratio);
            return `${p.x},${p.y}`;
          });
          return <polygon key={level} points={poly.join(' ')} fill="none" stroke={level === 5 ? '#94a3b8' : '#cbd5e1'} strokeWidth="1" />;
        })}

        {axes.map((axis) => {
          const p = toXY(axis.angle, 1);
          return <line key={axis.key} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#94a3b8" strokeWidth="1" />;
        })}

        {axes.map((axis) => {
          const p = toXY(axis.angle, 1.22);
          const anchor = axis.angle === 0 ? 'start' : axis.angle === 180 ? 'end' : 'middle';
          return (
            <text key={`${axis.key}-label`} x={p.x} y={p.y} textAnchor={anchor} className="radar-axis-label">
              {axis.label}
            </text>
          );
        })}

        <polygon points={valuePoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="#8b5cf633" stroke="#7c3aed" strokeWidth="2" />
        {valuePoints.map((p, idx) => (
          <circle key={axes[idx].key} cx={p.x} cy={p.y} r="3" fill="#6d28d9" />
        ))}
      </svg>

      <div className="spark-legend">
        <span>구현 난이도 {stats.difficulty}/5</span>
        <span>신기술 사용도 {stats.novelty}/5</span>
        <span>사용자 임팩트 {stats.impact}/5</span>
        <span>확장성 {stats.scalability}/5</span>
      </div>
    </div>
  );
}

function App() {
  const [projectItems, setProjectItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [adminToken, setAdminToken] = useState(() => window.localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const isAdmin = Boolean(adminToken);

  const loadProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    const normalized = data.map(normalizeProject);
    setProjectItems(normalized);
    if (!selectedSlug && normalized[0]) setSelectedSlug(normalized[0].slug);
  };

  useEffect(() => {
    loadProjects().finally(() => setLoading(false));
  }, []);

  const filteredProjects = useMemo(() => {
    if (statusFilter === '전체') return projectItems;
    return projectItems.filter((project) => project.status === statusFilter);
  }, [projectItems, statusFilter]);

  const selectedProject = useMemo(
    () => projectItems.find((project) => project.slug === selectedSlug) ?? filteredProjects[0],
    [projectItems, selectedSlug, filteredProjects]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSlug('');
  };

  const openCreateModal = () => {
    if (!isAdmin) return setIsLoginOpen(true);
    resetForm();
    setIsEditorOpen(true);
  };

  const openEditModal = () => {
    if (!selectedProject || !isAdmin) return;
    setForm(fillFormFromProject(selectedProject));
    setEditingSlug(selectedProject.slug);
    setIsEditorOpen(true);
  };

  const closeEditorModal = () => {
    setIsEditorOpen(false);
    resetForm();
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUsername, password: adminPassword })
    });

    if (!res.ok) {
      setAuthError('관리자 계정 정보가 올바르지 않습니다.');
      return;
    }

    const data = await res.json();
    window.localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    setAdminToken(data.token);
    setIsLoginOpen(false);
    setAdminPassword('');
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken('');
    setIsEditorOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const next = serializeForm(form);
    if (!next.title || !next.summary || !next.goal || !next.implementation) return alert('제목, 요약, 목표, 구현 내용은 필수입니다.');
    if (next.stack.length === 0) return alert('기술 스택을 최소 1개 이상 입력하세요.');

    if (editingSlug) {
      await fetch(`/api/projects/${editingSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ ...next, slug: editingSlug })
      });
      await loadProjects();
      setSelectedSlug(editingSlug);
      setIsEditorOpen(false);
      return;
    }

    const baseSlug = toSlug(next.title);
    let slug = baseSlug || `project-${Date.now()}`;
    let suffix = 1;
    while (projectItems.some((project) => project.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...next, slug })
    });
    await loadProjects();
    setSelectedSlug(slug);
    setIsEditorOpen(false);
  };

  const removeProject = async () => {
    if (!selectedProject || !isAdmin) return;
    const confirmed = window.confirm(`'${selectedProject.title}' 프로젝트를 삭제할까요?`);
    if (!confirmed) return;

    await fetch(`/api/projects/${selectedProject.slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    await loadProjects();
    setSelectedSlug('');
    setIsDetailOpen(false);
  };

  if (loading) return <div className="layout"><p>로딩 중...</p></div>;

  return (
    <div className="layout pastel-bg">
      <header className="hero soft-card">
        <p className="hero-kicker">PORTFOLIO</p>
        <h1>Portpolio</h1>
        <p className="hero-subtitle">프로덕트 엔지니어로서 고명섭이 만든 것들</p>
      </header>

      <section className="section soft-card">
        <div className="section-head">
          <h2>Projects</h2>
          <div className="toolbar">
            {isAdmin ? (
              <>
                <button type="button" className="primary" onClick={openCreateModal}>프로젝트 추가</button>
                <button type="button" className="ghost" onClick={handleAdminLogout}>관리자 로그아웃</button>
              </>
            ) : (
              <button type="button" className="ghost" onClick={() => setIsLoginOpen(true)}>관리자 로그인</button>
            )}
            <div className="filters" role="group" aria-label="status filter">
              {statusOptions.map((status) => (
                <button key={status} type="button" className={statusFilter === status ? 'active' : ''} onClick={() => setStatusFilter(status)}>{status}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="tile-grid">
          {filteredProjects.map((project, index) => {
            const [from, to] = pastelPalette[index % pastelPalette.length];
            return (
              <button key={project.slug} type="button" className="tile-card" style={{ background: `linear-gradient(145deg, ${from}, ${to})` }} onClick={() => { setSelectedSlug(project.slug); setIsDetailOpen(true); }}>
                <div className="tile-top">
                  <span className="badge">{project.category}</span>
                  <span className="status">{project.status}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <RadarChart stats={project.stats} />
              </button>
            );
          })}
        </div>
      </section>

      {isDetailOpen && selectedProject && (
        <div className="modal-overlay" onClick={() => setIsDetailOpen(false)}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="section-head"><h2>{selectedProject.title}</h2><button type="button" className="ghost" onClick={() => setIsDetailOpen(false)}>닫기</button></div>
            <p className="period">기간: {selectedProject.period}</p>
            <RadarChart stats={selectedProject.stats} />
            <div className="detail-block"><h3>무엇을 위해 작업했는가</h3><p>{selectedProject.goal}</p></div>
            <div className="detail-block"><h3>어떻게 구현했는가</h3><p>{selectedProject.implementation}</p></div>
            <div className="detail-block"><h3>성과</h3><ul>{selectedProject.metrics.map((m) => <li key={m.label}><strong>{m.label}:</strong> {m.value}</li>)}</ul></div>
            <div className="actions">
              {isAdmin && <><button type="button" className="ghost" onClick={openEditModal}>수정</button><button type="button" className="danger" onClick={removeProject}>삭제</button></>}
              {selectedProject.liveUrl ? <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer">서비스 이용하기</a> : <span className="disabled-link">현재 공개 서비스 없음</span>}
              {selectedProject.repoUrl ? <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer">저장소 보기</a> : <span className="disabled-link">비공개 또는 미공개 저장소</span>}
            </div>
          </section>
        </div>
      )}

      {isEditorOpen && isAdmin && (
        <div className="modal-overlay" onClick={closeEditorModal}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="section-head"><h2>{editingSlug ? '프로젝트 수정' : '프로젝트 추가'}</h2><button type="button" className="ghost" onClick={closeEditorModal}>닫기</button></div>
            <form className="project-form" onSubmit={handleSubmit}>
              <input placeholder="프로젝트 제목*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="inline-fields">
                <input placeholder="카테고리" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statusOptions.filter((s) => s !== '전체').map((status) => <option key={status} value={status}>{status}</option>)}</select>
                <input placeholder="기간" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
              </div>
              <textarea placeholder="한 줄 요약*" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
              <textarea placeholder="목표*" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} rows={2} />
              <textarea placeholder="구현 내용*" value={form.implementation} onChange={(e) => setForm({ ...form, implementation: e.target.value })} rows={3} />
              <input placeholder="기술 스택* (쉼표)" value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} />
              <div className="inline-fields">
                <label>구현 난이도 (1~5)<input type="number" min="1" max="5" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} /></label>
                <label>신기술 사용도 (1~5)<input type="number" min="1" max="5" value={form.novelty} onChange={(e) => setForm({ ...form, novelty: e.target.value })} /></label>
                <label>사용자 임팩트 (1~5)<input type="number" min="1" max="5" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} /></label>
                <label>확장성 (1~5)<input type="number" min="1" max="5" value={form.scalability} onChange={(e) => setForm({ ...form, scalability: e.target.value })} /></label>
              </div>
              <div className="inline-fields">
                <input placeholder="운영 서비스 URL (선택)" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
                <input placeholder="저장소 URL (선택)" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} />
              </div>
              <button type="submit" className="primary">{editingSlug ? '수정 저장' : '프로젝트 추가'}</button>
            </form>
          </section>
        </div>
      )}

      {isLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
          <section className="modal auth-box" onClick={(e) => e.stopPropagation()}>
            <h3>관리자 로그인</h3>
            <p className="auth-help">수정/삭제/추가는 관리자만 가능합니다.</p>
            <form onSubmit={handleAdminLogin} className="project-form">
              <input placeholder="관리자 아이디" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} />
              <input type="password" placeholder="관리자 비밀번호" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="primary">로그인</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
