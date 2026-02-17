import { useMemo, useState } from 'react';
import { projects } from './data/projects';

const statusOptions = ['전체', '운영중', '완료', 'PoC'];

function App() {
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedSlug, setSelectedSlug] = useState(projects[0].slug);

  const filteredProjects = useMemo(() => {
    if (statusFilter === '전체') return projects;
    return projects.filter((project) => project.status === statusFilter);
  }, [statusFilter]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedSlug) ?? filteredProjects[0],
    [selectedSlug, filteredProjects]
  );

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

      <section className="section">
        <div className="section-head">
          <h2>프로젝트 목록</h2>
          <div className="filters" role="group" aria-label="status filter">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? 'active' : ''}
                onClick={() => {
                  setStatusFilter(status);
                  const first = (status === '전체' ? projects : projects.filter((p) => p.status === status))[0];
                  if (first) setSelectedSlug(first.slug);
                }}
              >
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
        </div>
      </section>

      {selectedProject && (
        <section className="section detail">
          <h2>프로젝트 상세: {selectedProject.title}</h2>
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
