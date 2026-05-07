export type RoadmapStatus = 'done' | 'in-progress' | 'planned';

export type RoadmapItem = {
  id: string;
  title: string;
  status: RoadmapStatus;
  owner: string;
  target: string;
  doneCriteria: string[];
};

export const roadmapItems: RoadmapItem[] = [
  {
    id: 'docs-versioning',
    title: 'Versioned docs channels and snapshots',
    status: 'done',
    owner: 'Docs Platform',
    target: 'Q2 2026',
    doneCriteria: [
      'Release tags publish immutable docs snapshots under /versions/<tag>/',
      'Moving aliases exist for develop/latest/beta/alpha channels',
      'Version metadata file powers selector and fallback routing',
    ],
  },
  {
    id: 'docs-governance',
    title: 'Roadmap governance in docs',
    status: 'in-progress',
    owner: 'Core Maintainers',
    target: 'Q2 2026',
    doneCriteria: [
      'Roadmap source of truth is maintained inside docs UI content',
      'Every roadmap item includes explicit done criteria',
      'Links to issues/milestones are documented for traceability',
    ],
  },
  {
    id: 'docs-retention',
    title: 'Retention and rollback operations',
    status: 'done',
    owner: 'Release Engineering',
    target: 'Q2 2026',
    doneCriteria: [
      'Automated retention removes older prerelease snapshots while preserving stable history',
      'Manual rollback command can repoint a channel to a previous version snapshot',
      'Retention policy is applied consistently in release and develop channel workflows',
    ],
  },
  {
    id: 'docs-link-check',
    title: 'Docs quality gates',
    status: 'planned',
    owner: 'Docs Platform',
    target: 'Q3 2026',
    doneCriteria: [
      'External link checker runs in CI with actionable failure output',
      'Broken internal routes fail the docs build before publishing',
    ],
  },
];