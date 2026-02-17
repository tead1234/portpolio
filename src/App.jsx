import { useEffect, useMemo, useState } from 'react';
import { projects as initialProjects } from './data/projects';

const statusOptions = ['전체', '운영중', '완료', 'PoC'];
const STORAGE_KEY = 'portfolio-projects-v1';
const emptyForm = {
  title: '',
  category: 'Web',
  status: 'PoC',
  period: '',
  summary: '',
  goal: '',
  implementation: '',
  stack: '',
  metrics: '',
  liveUrl: '',
  repoUrl: ''
};

const toSlug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

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
  metrics: form.metrics
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');
      return {
        label: (label || '').trim(),
        value: rest.join(':').trim()
      };
    })
    .filter((metric) => metric.label && metric.value),
  liveUrl: form.liveUrl.trim(),
  repoUrl: form.repoUrl.trim()
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
  metrics: project.metrics.map((metric) => `${metric.label}: ${metric.value}`).join('\n'),
  liveUrl: project.liveUrl,
  repoUrl: project.repoUrl
});

function App() {
  const [projectItems, setProjectItems] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialProjects;

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialProjects;
    } catch {
      return initialProjects;
    }
  });
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedSlug, setSelectedSlug] = useState(initialProjects[0]?.slug || '');
  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState('');


  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projectItems));
  }, [projectItems]);

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

  const selectFilter = (status) => {
    setStatusFilter(status);
    const first = (status === '전체' ? projectItems : projectItems.filter((p) => p.status === status))[0];
    setSelectedSlug(first?.slug || '');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = serializeForm(form);

    if (!next.title || !next.summary || !next.goal || !next.implementation || !next.repoUrl) {
      alert('제목, 요약, 목표, 구현, 저장소 URL은 필수입니다.');
      return;
    }

    if (next.stack.length === 0) {
      alert('기술 스택을 1개 이상 입력하세요.');
      return;
    }

    if (next.metrics.length === 0) {
      alert('성과 지표를 1개 이상 입력하세요. (형식: 항목: 값)');
      return;
    }

    if (editingSlug) {
      const updated = projectItems.map((project) =>
        project.slug === editingSlug ? { ...project, ...next, slug: editingSlug } : project
      );
      setProjectItems(updated);
      setSelectedSlug(editingSlug);
      resetForm();
      return;
    }

    const baseSlug = toSlug(next.title);
    let slug = baseSlug || `project-${Date.now()}`;
    let suffix = 1;
    while (projectItems.some((project) => project.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const created = { ...next, slug };
    const updated = [created, ...projectItems];
    setProjectItems(updated);
    setSelectedSlug(slug);
    resetForm();
  };

  const startEdit = () => {
    if (!selectedProject) return;
    setForm(fillFormFromProject(selectedProject));
    setEditingSlug(selectedProject.slug);
  };

  const removeProject = () => {
    if (!selectedProject) return;
    const confirmed = window.confirm(`'${selectedProject.title}' 프로젝트를 삭제할까요?`);
    if (!confirmed) return;

    const updated = projectItems.filter((project) => project.slug !== selectedProject.slug);
    setProjectItems(updated);

    const nextSelected = updated.find((p) => p.status === statusFilter) || updated[0];
    setSelectedSlug(nextSelected?.slug || '');

    if (editingSlug === selectedProject.slug) {
      resetForm();
    }
  };

  return (
    <div className="layout">
      <header className="hero">
        <p className="hero-kicker">PORTFOLIO</p>
        <h1>내가 만든 프로젝트를 문제-구현-성과 중심으로 보여주는 공간</h1>
        <p>
          프로젝트가 계속 추가되어도 같은 템플릿으로 확장 가능하게 구성했습니다. 운영중인 서비스는
          즉시 접속 링크를 제공합니다.
        </p>
      </header>

      <section className="section editor">
        <div className="section-head">
          <h2>{editingSlug ? '프로젝트 수정' : '프로젝트 추가'}</h2>
          {editingSlug && (
            <button type="button" className="ghost" onClick={resetForm}>
              수정 취소
            </button>
          )}
        </div>

        <form className="project-form" onSubmit={handleSubmit}>
          <input placeholder="프로젝트 제목*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="inline-fields">
            <input placeholder="카테고리 (예: Web)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statusOptions.filter((s) => s !== '전체').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input placeholder="기간 (예: 2025.01 - 진행중)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </div>
          <textarea placeholder="한 줄 요약*" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
          <textarea placeholder="무엇을 위해 작업했는가*" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} rows={2} />
          <textarea placeholder="어떻게 구현했는가*" value={form.implementation} onChange={(e) => setForm({ ...form, implementation: e.target.value })} rows={3} />
          <input placeholder="기술 스택* (쉼표로 구분)" value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} />
          <textarea
            placeholder={"성과 지표* (줄바꿈 구분, 형식: 항목: 값)\n예) 응답속도: 1.2초 -> 0.8초"}
            value={form.metrics}
            onChange={(e) => setForm({ ...form, metrics: e.target.value })}
            rows={3}
          />
          <div className="inline-fields">
            <input placeholder="운영 서비스 URL (선택)" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
            <input placeholder="저장소 URL*" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} />
          </div>
          <button type="submit" className="primary">
            {editingSlug ? '수정 내용 저장' : '프로젝트 추가'}
          </button>
        </form>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>프로젝트 목록</h2>
          <div className="filters" role="group" aria-label="status filter">
            {statusOptions.map((status) => (
              <button key={status} type="button" className={statusFilter === status ? 'active' : ''} onClick={() => selectFilter(status)}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {filteredProjects.map((project) => (
            <article
              key={project.slug}
              className={`card ${selectedProject?.slug === project.slug ? 'selected' : ''}`}
              onClick={() => setSelectedSlug(project.slug)}
            >
              <div className="card-head">
                <span className="badge">{project.category}</span>
                <span className="status">{project.status}</span>
              </div>
              <h3>{project.title}</h3>
              <p className="summary">{project.summary}</p>
              <p className="goal">
                <strong>목표:</strong> {project.goal}
              </p>
              <div className="stack-list">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </article>
          ))}
          {filteredProjects.length === 0 && <p className="empty">해당 상태의 프로젝트가 없습니다.</p>}
        </div>
      </section>

      {selectedProject && (
        <section className="section detail">
          <div className="section-head">
            <h2>프로젝트 상세: {selectedProject.title}</h2>
            <div className="actions">
              <button type="button" className="ghost" onClick={startEdit}>
                수정
              </button>
              <button type="button" className="danger" onClick={removeProject}>
                삭제
              </button>
            </div>
          </div>
          <p className="period">기간: {selectedProject.period}</p>

          <div className="detail-block">
            <h3>무엇을 위해 작업했는가</h3>
            <p>{selectedProject.goal}</p>
          </div>

          <div className="detail-block">
            <h3>어떻게 구현했는가</h3>
            <p>{selectedProject.implementation}</p>
          </div>

          <div className="detail-block">
            <h3>성과는 어느 정도인가</h3>
            <ul>
              {selectedProject.metrics.map((metric) => (
                <li key={metric.label}>
                  <strong>{metric.label}:</strong> {metric.value}
                </li>
              ))}
            </ul>
          </div>

          <div className="links">
            {selectedProject.liveUrl ? (
              <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer">
                서비스 이용하기
              </a>
            ) : (
              <span className="disabled-link">현재 공개 서비스 없음</span>
            )}
            <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer">
              저장소 보기
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
