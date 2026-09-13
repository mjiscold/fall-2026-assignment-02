import { Transaction } from '../models.js';
import { TaxConfigService } from '../services/TaxConfigService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TaxDeductionStrategy implements AuditStrategy {
  public readonly name = 'Tax & Deductions Auditor';
  public readonly description =
    'Identifies eligible tax-deductible expenses and estimates savings';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 4 - Implement this strategy.
    // 1. Call TaxConfigService.getTaxConfig() asynchronously.
    const taxConfig = await TaxConfigService.getTaxConfig();
    const { standardTaxRate, deductibleCategories } = taxConfig;

    let totalDeductible = 0;
    let totalNonDeductible = 0;
    const eligibleTransactions: Transaction[] = [];

    // 2. Filter expenses (amount < 0) that belong to eligible tax-deductible categories.
    for (const tx of transactions) {
      if (tx.amount < 0) {
        const expenseAmount = Math.abs(tx.amount);

        
    // 3. Sum total deductible expenses.
        if (deductibleCategories.includes(tx.category)) {
          totalDeductible += expenseAmount;
          eligibleTransactions.push(tx);
        }
        else {
          totalNonDeductible += expenseAmount;
        }
      }
    }

    // 4. Estimate tax savings based on the standard tax rate: total deductible * taxRate.
    const estimatedSavings = totalDeductible * standardTaxRate;
    
    // 5. Estimate sales tax/VAT paid on NON-deductible expenses using standard tax rate.
    const estimatedVatPaid = totalNonDeductible * standardTaxRate;
    
    // 6. Format and return a text-based audit report detailing total deductions, savings, VAT estimates, and eligible transactions.
    let report = `--- ${this.name} Report ---\n`;
    report += `Total Deductions: $${totalDeductible.toFixed(2)}\n`;
    report += `Estimated Tax Savings: $${estimatedSavings.toFixed(2)}\n`;
    report += `Estimated VAT on Non-Deductibles: $${estimatedVatPaid.toFixed(2)}\n\n`;

    report += `Eligible Transactions:\n`;
    if (eligibleTransactions.length === 0) {
      report += ` None found.\n`;
    }
    else {
      eligibleTransactions.forEach(tx => {report += ` - ${tx.date} | ${tx.description} | ${tx.category} | $${Math.abs(tx.amount).toFixed(2)}\n`});
    }

    return report;
  }
}
