import { Transaction, AnomalyRules } from '../models.js';
import { AnomalyRulesService } from '../services/AnomalyRulesService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class AnomalyDetectionStrategy implements AuditStrategy {
  public readonly name = 'Anomaly & Duplicate Auditor';
  public readonly description =
    'Detects transactions exceeding thresholds and duplicate records';

  //test addition
  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 2 - Implement this strategy.
    // 1. Call AnomalyRulesService.getRules() asynchronously.
    // Fetching the rules here
    const rules: AnomalyRules = await AnomalyRulesService.getRules();

    // 2. Scan transactions to find outliers (expenses exceeding rules.maxTransactionAmount).
    // Walks every transaction. It is meant to keep only the ones where
    // the call back returns true.
    const outliers = transactions.filter(
      (t) => t.amount < 0 && Math.abs(t.amount) > rules.maxTransactionAmount,
    );

    // 3. Scan to identify duplicates (transactions sharing the exact same date, category, description, and amount).
    const duplicateGroups = this.findDuplicateGroups(transactions);

    // 4. Identify transactions having a status that matches any in rules.flaggedStatuses.
    // Checks if this transaction's status is in that list.
    const flagged = transactions.filter((t) =>
      rules.flaggedStatuses.includes(t.status),
    );

    // 5. Calculate total flagged value and anomaly rates.
    // Each transaction's id is only counted once no matter how many
    // categories it falls into. Duplicates in the set are automatically ignored.
    const anomalousIds = new Set<string>();
    outliers.forEach((t) => anomalousIds.add(t.id));
    duplicateGroups.forEach((group) =>
      group.forEach((t) => anomalousIds.add(t.id)),
    );
    flagged.forEach((t) => anomalousIds.add(t.id));

    const totalCount = transactions.length;
    const anomalousCount = anomalousIds.size;
    const anomalyPercentage =
      totalCount > 0 ? (anomalousCount / totalCount) * 100 : 0;

    // 6. Format and return a text-based audit report of anomalies, duplicate sets, and totals.
    // Builds an array of strings, combining them into one big string.
    return this.formatReport(
      outliers,
      duplicateGroups,
      flagged,
      anomalousCount,
      totalCount,
      anomalyPercentage,
    );
  }

  // Builds a string key made from the four fields (date, category, description, amount).
  // Each unique key points at an array of transactions. However, if the key has not
  // been seen yet, start a fresh array.
  // Then, after processing, it throws away any group with only one transaction.
  // Only keeping the real duplicate sets.

  private findDuplicateGroups(transactions: Transaction[]): Transaction[][] {
    const groups = new Map<string, Transaction[]>();

    for (const t of transactions) {
      const key = `${t.date}|${t.category}|${t.description}|${t.amount}`;
      const existing = groups.get(key) ?? [];
      existing.push(t);
      groups.set(key, existing);
    }

    return Array.from(groups.values()).filter((group) => group.length > 1);
  }

  private formatReport(
    outliers: Transaction[],

    duplicateGroups: Transaction[][],

    flagged: Transaction[],

    anomalousCount: number,

    totalCount: number,

    anomalyPercentage: number,
  ): string {
    const lines: string[] = [];

    lines.push('ANOMALY & DUPLICATE AUDIT REPORT');
    lines.push('');

    lines.push(`OUTLIER TRANSACTIONS (${outliers.length}):`);
    if (outliers.length === 0) {
      lines.push('  No outliers found — all transactions within limits.');
    } else {
      for (const t of outliers) {
        lines.push(
          `  [Outlier] ${t.date} | ${t.category} | ${t.description} | $${t.amount.toFixed(2)} (id: ${t.id})`,
        );
      }
    }

    lines.push('');
    lines.push(`DUPLICATE SETS (${duplicateGroups.length}):`);
    if (duplicateGroups.length === 0) {
      lines.push('  No duplicate transactions found.');
    } else {
      duplicateGroups.forEach((group, index) => {
        lines.push(`  Duplicate Set ${index + 1}:`);
        group.forEach((t) => {
          lines.push(
            `    ${t.date} | ${t.category} | ${t.description} | $${t.amount.toFixed(2)} (id: ${t.id})`,
          );
        });
      });
    }

    lines.push('');
    lines.push(`FLAGGED STATUS TRANSACTIONS (${flagged.length}):`);
    if (flagged.length === 0) {
      lines.push('  No flagged transactions found.');
    } else {
      for (const t of flagged) {
        lines.push(
          `  [${t.status.toUpperCase()}] ${t.date} | ${t.category} | ${t.description} | $${t.amount.toFixed(2)} (id: ${t.id})`,
        );
      }
    }

    lines.push('');
    lines.push('SUMMARY:');
    lines.push(`  Total Transactions: ${totalCount}`);
    lines.push(`  Total Anomalous Transactions: ${anomalousCount}`);
    lines.push(`  Anomaly Rate: ${anomalyPercentage.toFixed(2)}%`);

    return lines.join('\n');
  }
}
