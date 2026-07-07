import type { PassportSectionKey } from '@/types/passport';

export type AiAssistanceFindingSeverity = 'info' | 'review' | 'warning';

export type AiAssistanceFinding = {
  id: string;
  severity: AiAssistanceFindingSeverity;
  title: string;
  description: string;
  sectionKey?: PassportSectionKey;
};

export type ReviewerAssistanceSummary = {
  summary: string;
  outstandingItems: string[];
  potentialInconsistencies: AiAssistanceFinding[];
  recommendedChecklistItems: string[];
  followUpQuestions: string[];
};

export type LandlordAssistanceSummary = {
  summary: string;
  facts: string[];
  limitations: string[];
};

export type SecurityControlStatus = 'implemented' | 'configured' | 'documented' | 'future_review_required';

export type SecurityControl = {
  key: string;
  label: string;
  status: SecurityControlStatus;
  notes: string;
};

export type MonitoringSignal = {
  key: string;
  label: string;
  source: 'application' | 'api' | 'auth' | 'database' | 'webhook' | 'background_job';
  status: 'implemented' | 'documented' | 'future';
};

export type LaunchReadinessStatus = 'ready_for_controlled_mvp' | 'blocked' | 'needs_manual_review';
