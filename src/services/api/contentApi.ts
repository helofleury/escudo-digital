import { ARTICLES } from '@/data/articles';
import { QUICK_TIPS, type QuickTip } from '@/data/tips';
import { QUIZ } from '@/data/quiz';
import { wait } from '@/services/api/delay';
import type { Article, QuizQuestion } from '@/types';

/**
 * API de conteúdo (MOCK). Simula uma chamada de rede com latência para que as telas
 * tratem carregamento do mesmo jeito que tratariam uma API real.
 */
export async function fetchArticles(): Promise<Article[]> {
  await wait(350);
  return [...ARTICLES];
}

export async function fetchArticle(id: string): Promise<Article | null> {
  await wait(150);
  return ARTICLES.find((a) => a.id === id) ?? null;
}

export async function fetchTips(): Promise<QuickTip[]> {
  await wait(200);
  return [...QUICK_TIPS];
}

export async function fetchQuiz(): Promise<QuizQuestion[]> {
  await wait(300);
  return [...QUIZ];
}
