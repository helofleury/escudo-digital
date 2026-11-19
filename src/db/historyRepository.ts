import { getDb } from '@/db/database';
import type { AnalysisResult, HistoryItem } from '@/types';
import { isAnalysisSource, isContentKind, isRiskLevel, parseFindings } from '@/utils/guards';

interface HistoryRow {
  id: number;
  kind: string;
  content: string;
  label: string;
  risk_level: string;
  score: number;
  title: string;
  subtitle: string;
  summary: string;
  advice: string;
  findings_json: string;
  extracted_text: string | null;
  demo_ocr: number;
  source: string;
  created_at: string;
}

function toItem(row: HistoryRow): HistoryItem | null {
  if (!isContentKind(row.kind) || !isRiskLevel(row.risk_level) || !isAnalysisSource(row.source)) return null;
  return {
    id: row.id,
    kind: row.kind,
    content: row.content,
    label: row.label,
    riskLevel: row.risk_level,
    score: row.score,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    advice: row.advice,
    findings: parseFindings(row.findings_json),
    extractedText: row.extracted_text,
    demoOcr: row.demo_ocr === 1,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function saveAnalysis(userId: number, content: string, label: string, result: AnalysisResult): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO history (user_id, kind, content, label, risk_level, score, title, subtitle, summary, advice,
      findings_json, extracted_text, demo_ocr, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, result.kind, content, label, result.riskLevel, result.score, result.title, result.subtitle,
      result.summary, result.advice, JSON.stringify(result.findings), result.extractedText,
      result.demoOcr ? 1 : 0, result.source, new Date().toISOString(),
    ],
  );
  return res.lastInsertRowId;
}

export async function listHistory(userId: number): Promise<HistoryItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HistoryRow>('SELECT * FROM history WHERE user_id = ? ORDER BY datetime(created_at) DESC, id DESC', [userId]);
  return rows.map(toItem).filter((item): item is HistoryItem => item !== null);
}

export async function getHistoryItem(userId: number, id: number): Promise<HistoryItem | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<HistoryRow>('SELECT * FROM history WHERE user_id = ? AND id = ?', [userId, id]);
  return row === null ? null : toItem(row);
}

export async function clearHistory(userId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM history WHERE user_id = ?', [userId]);
}

export async function markRead(userId: number, itemId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO tips_read (user_id, item_id) VALUES (?, ?)', [userId, itemId]);
}

export async function countRead(userId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM tips_read WHERE user_id = ?', [userId]);
  return row === null ? 0 : row.total;
}
