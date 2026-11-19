import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type KnowledgeLevel = 'basico' | 'intermediario' | 'avancado';
export type ContentKind = 'mensagem' | 'link' | 'imagem';
export type RiskLevel = 'seguro' | 'atencao' | 'medio' | 'alto';
export type AnalysisSource = 'api' | 'local';

export interface User {
  id: number;
  name: string;
  email: string;
  level: KnowledgeLevel;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  weight: number;
}

export interface AnalysisRequest {
  kind: ContentKind;
  content: string;
  label: string;
  level: KnowledgeLevel;
}

export interface AnalysisResult {
  kind: ContentKind;
  riskLevel: RiskLevel;
  score: number;
  title: string;
  subtitle: string;
  summary: string;
  findings: Finding[];
  advice: string;
  extractedText: string | null;
  demoOcr: boolean;
  source: AnalysisSource;
}

export interface HistoryItem extends AnalysisResult {
  id: number;
  content: string;
  label: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  minutes: number;
  audience: string;
  category: 'golpes' | 'dicas';
  icon: IconName;
  tone: 'danger' | 'info' | 'success';
  intro: string;
  sections: { heading: string; body: string }[];
}

export interface QuizQuestion {
  id: string;
  channel: string;
  sender: string;
  body: string;
  link: string | null;
  time: string;
  isScam: boolean;
  explanation: string;
}

export interface AppSettings {
  largeText: boolean;
  notifications: boolean;
  saveHistory: boolean;
}
