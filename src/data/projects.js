export const projects = [
  {
    slug: 'smart-order-dashboard',
    title: 'Smart Order Dashboard',
    category: 'Web',
    status: '운영중',
    period: '2024.03 - 2024.08',
    summary: '수기 보고를 자동화하고 실시간 운영 모니터링을 구축한 대시보드 프로젝트.',
    goal: '보고 리드타임 단축 및 운영 의사결정 속도 향상',
    implementation:
      'Next.js 기반 UI와 Lambda + DynamoDB 백엔드를 결합해 주문 상태를 실시간 집계하고, 주간 리포트를 자동 생성하도록 구성했습니다.',
    stack: ['Next.js', 'TypeScript', 'AWS Lambda', 'DynamoDB'],
    metrics: [
      { label: '보고 생성 시간', value: '2시간 → 10분' },
      { label: '데이터 입력 오류율', value: '18% → 3%' }
    ],
    liveUrl: 'https://example.com/smart-order-dashboard',
    repoUrl: 'https://github.com/your-id/smart-order-dashboard'
  },
  {
    slug: 'ai-cs-assistant',
    title: 'AI CS Assistant',
    category: 'AI',
    status: '완료',
    period: '2024.09 - 2024.12',
    summary: '반복 문의를 자동 분류/응답하여 상담 효율을 높인 AI 응대 도우미.',
    goal: '상담사의 반복업무 감소 및 응대 품질 표준화',
    implementation:
      'RAG 파이프라인과 사내 지식베이스를 연동해 질문 유형을 분류하고, 승인 워크플로우를 통해 답변 품질을 통제했습니다.',
    stack: ['React', 'Node.js', 'OpenAI API', 'PostgreSQL'],
    metrics: [
      { label: '1차 자동응답 처리율', value: '0% → 46%' },
      { label: '평균 응답 시간', value: '8분 → 2분' }
    ],
    liveUrl: '',
    repoUrl: 'https://github.com/your-id/ai-cs-assistant'
  },
  {
    slug: 'cost-analyzer',
    title: 'Cloud Cost Analyzer',
    category: 'Data',
    status: 'PoC',
    period: '2025.01 - 진행중',
    summary: '클라우드 비용 이상 징후를 탐지해 월간 지출 최적화를 지원하는 분석 도구.',
    goal: '서비스별 비용 구조 투명화 및 낭비 구간 탐지',
    implementation:
      '비용 데이터를 주기 수집해 서비스/태그 단위로 집계하고, 기준선 대비 급증 구간을 알림으로 전달하는 프로토타입을 구축했습니다.',
    stack: ['Vue', 'Python', 'AWS Athena', 'QuickSight'],
    metrics: [
      { label: '비용 이슈 탐지 리드타임', value: '주 단위 → 일 단위' },
      { label: '파일럿 절감율', value: '약 12%' }
    ],
    liveUrl: '',
    repoUrl: 'https://github.com/your-id/cloud-cost-analyzer'
  }
];
