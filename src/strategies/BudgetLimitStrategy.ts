import { Transaction } from '../models.js';
import { BudgetService } from '../services/BudgetService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class BudgetLimitStrategy implements AuditStrategy {
  public readonly name = 'Budget Limit Auditor';
  public readonly description =
    'Checks category spending against monthly budget limits';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 1 - Implement this strategy.
    // 1. Call BudgetService.getCategoryBudgets() asynchronously.
    const budgets = await BudgetService.getCategoryBudgets();

    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
    const categorySpending: Record<string, number> = {};
    const categoryTransactions: Record<string, Transaction[]> = {};

    for (const transaction of transactions) {
      if (transaction.amount < 0) {
        const category = transaction.category;
        const amountSpent = Math.abs(transaction.amount);

        if (categorySpending[category] === undefined) {
        categorySpending[category] = 0;
        }

        categorySpending[category] += amountSpent;

        if (categoryTransactions[category] === undefined) {
        categoryTransactions[category] = [];
        }

      categoryTransactions[category].push(transaction);
      }
    }

    // 3. Compare spending against the fetched limits.
    let report = '=== Budget Limit Audit Report ===\n\n';

    report += 'SUMMARY\n';
    report += '-------\n';

    for (const category in budgets) {
      const budgetLimit = budgets[category];
      const actualSpending = categorySpending[category] || 0;

      report +=
        category +
        ': Budget $' +
        budgetLimit.toFixed(2) +
        ', Spent $' +
        actualSpending.toFixed(2) +
        '\n';
    }

    // 4. Identify overages (categories where spending exceeds the budget).
    report += '\nWARNINGS\n';
    report += '--------\n';

    let foundOverage = false;

    for (const category in budgets) {
      const budgetLimit = budgets[category];
      const actualSpending = categorySpending[category] || 0;

      if (actualSpending > budgetLimit) {
        foundOverage = true;

        const overageAmount = actualSpending - budgetLimit;

        let percentage = 0;

        if (budgetLimit > 0) {
          percentage = (actualSpending / budgetLimit) * 100;
        }

        report +=
          category +
          ': OVER BUDGET by $' +
          overageAmount.toFixed(2) +
          ' (' +
          percentage.toFixed(2) +
          '%)\n';
      }
    }

    if (foundOverage === false) {
      report += 'No categories are over budget.\n';
    }

    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.
    report += '\nOVER-BUDGET TRANSACTIONS\n';
    report += '------------------------\n';

    let foundTransactions = false;

    for (const category in budgets) {
      const budgetLimit = budgets[category];
      const actualSpending = categorySpending[category] || 0;

      if (actualSpending > budgetLimit) {
        foundTransactions = true;

        report += category + ':\n';

        const transactionsForCategory =
          categoryTransactions[category] || [];

        for (const transaction of transactionsForCategory) {
          report += '  - ' + JSON.stringify(transaction) + '\n';
        }
      }
    }

    if (foundTransactions === false) {
      report += 'None.\n';
    }

    return report;
  }
    
}

