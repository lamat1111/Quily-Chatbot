import { readFile } from 'fs/promises';
import { resolve } from 'path';
import chalk from 'chalk';
import type { SyncDiff } from './types.js';

/**
 * Audit log entry for an official doc
 */
interface AuditFileEntry {
  status: string;
  last_analyzed: string;
  score: string;
  composite_pct: number;
  issues: string[];
  notes: string;
  custom_doc: string | null;
}

/**
 * Structure of the gap-audit-log.json
 */
interface GapAuditLog {
  last_full_scan: string;
  files: Record<string, AuditFileEntry>;
  custom_docs_created: Array<{
    path: string;
    created: string;
    covers_entities: string[];
    covers_topics: string[];
  }>;
}

/**
 * Impact severity for a companion doc
 */
type ImpactSeverity = 'stale' | 'orphaned' | 'partially_orphaned';

/**
 * Result of impact analysis for one companion doc
 */
interface CompanionImpact {
  companionPath: string;
  severity: ImpactSeverity;
  modifiedSources: string[];
  deletedSources: string[];
  totalSources: number;
  remainingSources: number;
}

/**
 * Full impact analysis result
 */
export interface CompanionImpactReport {
  affected: CompanionImpact[];
  unaffected: number;
  totalCompanionDocs: number;
}

const AUDIT_LOG_PATH = '.claude/skills/doc-gap-analysis/gap-audit-log.json';

/**
 * Analyze how sync changes affect companion docs.
 *
 * Builds a reverse map from companion docs → official source docs,
 * then checks which companion docs are impacted by modified/deleted sources.
 */
export async function analyzeCompanionImpact(
  diff: SyncDiff,
  projectRoot: string
): Promise<CompanionImpactReport | null> {
  // Load the audit log
  let auditLog: GapAuditLog;
  try {
    const logPath = resolve(projectRoot, AUDIT_LOG_PATH);
    const raw = await readFile(logPath, 'utf-8');
    auditLog = JSON.parse(raw);
  } catch {
    // No audit log means gap-analysis hasn't been run yet — nothing to check
    return null;
  }

  // Build reverse map: companion doc path → set of official doc paths that feed into it
  const reverseMap = new Map<string, Set<string>>();

  for (const [officialPath, entry] of Object.entries(auditLog.files)) {
    if (entry.custom_doc) {
      if (!reverseMap.has(entry.custom_doc)) {
        reverseMap.set(entry.custom_doc, new Set());
      }
      reverseMap.get(entry.custom_doc)!.add(officialPath);
    }
  }

  const totalCompanionDocs = reverseMap.size;
  if (totalCompanionDocs === 0) {
    return { affected: [], unaffected: 0, totalCompanionDocs: 0 };
  }

  // Collect changed official doc paths (modified + deleted)
  const modifiedPaths = new Set(diff.modified.map((f) => f.path));
  const deletedPaths = new Set(diff.deleted);

  // Check each companion doc for impact
  const affected: CompanionImpact[] = [];

  for (const [companionPath, sources] of reverseMap) {
    const modifiedSources: string[] = [];
    const deletedSources: string[] = [];

    for (const source of sources) {
      if (deletedPaths.has(source)) {
        deletedSources.push(source);
      } else if (modifiedPaths.has(source)) {
        modifiedSources.push(source);
      }
    }

    if (modifiedSources.length > 0 || deletedSources.length > 0) {
      const remainingSources = sources.size - deletedSources.length;
      let severity: ImpactSeverity;

      if (remainingSources === 0) {
        severity = 'orphaned';
      } else if (deletedSources.length > 0) {
        severity = 'partially_orphaned';
      } else {
        severity = 'stale';
      }

      affected.push({
        companionPath,
        severity,
        modifiedSources,
        deletedSources,
        totalSources: sources.size,
        remainingSources,
      });
    }
  }

  // Sort by severity: orphaned first, then partially_orphaned, then stale
  const severityOrder: Record<ImpactSeverity, number> = {
    orphaned: 0,
    partially_orphaned: 1,
    stale: 2,
  };
  affected.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    affected,
    unaffected: totalCompanionDocs - affected.length,
    totalCompanionDocs,
  };
}

/**
 * Format the impact report for terminal display.
 */
export function formatCompanionImpactReport(report: CompanionImpactReport): string {
  const lines: string[] = [];

  if (report.affected.length === 0) {
    lines.push(
      chalk.green(`  ✓ All ${report.totalCompanionDocs} companion doc(s) unaffected`)
    );
    return lines.join('\n');
  }

  const severityIcon: Record<ImpactSeverity, string> = {
    orphaned: '🔴',
    partially_orphaned: '🟡',
    stale: '🟠',
  };

  const severityLabel: Record<ImpactSeverity, string> = {
    orphaned: 'ORPHANED — all source docs deleted',
    partially_orphaned: 'PARTIAL — some source docs deleted',
    stale: 'STALE — source docs modified',
  };

  lines.push(
    `  ${chalk.yellow('⚠️')}  ${report.affected.length} companion doc(s) affected by upstream changes:\n`
  );

  for (const impact of report.affected) {
    const icon = severityIcon[impact.severity];
    const label = severityLabel[impact.severity];

    lines.push(`  ${icon} ${chalk.bold(impact.companionPath)}`);
    lines.push(chalk.gray(`     ${label}`));

    if (impact.modifiedSources.length > 0) {
      lines.push(chalk.gray(`     Modified: ${impact.modifiedSources.join(', ')}`));
    }
    if (impact.deletedSources.length > 0) {
      lines.push(chalk.red(`     Deleted:  ${impact.deletedSources.join(', ')}`));
    }
    lines.push(
      chalk.gray(
        `     Sources:  ${impact.remainingSources}/${impact.totalSources} remaining`
      )
    );
    lines.push('');
  }

  if (report.unaffected > 0) {
    lines.push(chalk.green(`  ✓ ${report.unaffected} companion doc(s) unaffected`));
  }

  return lines.join('\n');
}
