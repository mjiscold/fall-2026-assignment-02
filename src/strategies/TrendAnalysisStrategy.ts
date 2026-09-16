import { Transaction } from '../models.js';
import { HistoricalDataService } from '../services/HistoricalDataService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TrendAnalysisStrategy implements AuditStrategy {
  public readonly name = 'Historical Trend Auditor';
  public readonly description =
    'Compares current monthly category spending against historical averages';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {

    // 1. Get historical averages
    const historicalAverages =
      await HistoricalDataService.getHistoricalAverages();

    // 2. Group current expenses by category
    const currentSpending: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.amount < 0) {
        const category = transaction.category;

        if (currentSpending[category] === undefined) {
          currentSpending[category] = 0;
        }

        currentSpending[category] += Math.abs(transaction.amount);
      }
    }

    // Arrays used to build the report
    const table: string[] = [];
    const growthCategories: string[] = [];
    const savingsCategories: string[] = [];

    table.push(
      'Category | Current Spending | Historical Average | % Change',
    );

    table.push(
      '-------------------------------------------------------------',
    );

    // 3. Compare current spending to historical averages
    for (const [category, historical] of Object.entries(
      historicalAverages,
    )) {
      const current = currentSpending[category] ?? 0;

      // 4. Calculate variance percentage
      const variance =
        ((current - historical) / historical) * 100;

      table.push(
        `${category} | $${current.toFixed(2)} | $${historical.toFixed(2)} | ${variance.toFixed(2)}%`,
      );

      // 5. Highlight changes greater than +/- 20%
      if (variance > 20) {
        growthCategories.push(
          `${category}: ${variance.toFixed(2)}%`,
        );
      }

      if (variance < -20) {
        savingsCategories.push(
          `${category}: ${variance.toFixed(2)}%`,
        );
      }
    }
    for (const [category, current] of Object.entries(currentSpending)) {
  if (historicalAverages[category] === undefined) {
    table.push(
      `${category} | $${current.toFixed(2)} | N/A | N/A`,
    );
  }
}

    // 6. Create the final report
    let report = table.join('\n');

    report += '\n\nSignificant Growth Categories\n';

    if (growthCategories.length > 0) {
      report += growthCategories.join('\n');
    } else {
      report += 'None';
    }

    report += '\n\nSignificant Savings Categories\n';

    if (savingsCategories.length > 0) {
      report += savingsCategories.join('\n');
    } else {
      report += 'None';
    }

    return report;
  }
}