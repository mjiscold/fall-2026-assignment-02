export class BudgetLimitStrategy {
  name = 'Budget Limit Auditor';
  description = 'Checks category spending against monthly budget limits';
  async execute(transactions, customParam) {
    // TODO: Feature 1 - Implement this strategy.
    // 1. Call BudgetService.getCategoryBudgets() asynchronously.
    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
    // 3. Compare spending against the fetched limits.
    // 4. Identify overages (categories where spending exceeds the budget).
    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.
    throw new Error('Method not implemented.');
  }
}
