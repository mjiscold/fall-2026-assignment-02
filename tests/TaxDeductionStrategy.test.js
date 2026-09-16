import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxDeductionStrategy } from '../src/strategies/TaxDeductionStrategy.js';
import { TaxConfigService } from '../src/services/TaxConfigService.js';
describe('TaxDeductionStrategy (Feature 4)', () => {
  let strategy;
  beforeEach(() => {
    strategy = new TaxDeductionStrategy();
    vi.restoreAllMocks();
  });
  // Example of how to write and mock in your tests:
  //
  // it('should compute tax savings correctly based on rate and deductible categories', async () => {
  //   const mockConfig = { standardTaxRate: 0.10, deductibleCategories: ['Medical', 'Charity'] };
  //   const spy = vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -200.00, category: 'Charity', description: 'Donation', status: 'completed' }, // Deductible
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Non-deductible
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Deductions: $200.00'); // Sum of Charity
  //   expect(result).toContain('Savings: $20.00'); // $200 * 0.10
  // });
  it('should filter only the categories specified as deductible in the config', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue({
      standardTaxRate: 0.1,
      deductibleCategories: ['Charity'],
    });
    const testTransactions = [
      {
        id: '1',
        date: '2026-01-31',
        amount: -200.0,
        category: 'Charity',
        description: 'Red Cross',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-01-30',
        amount: -100.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      },
    ];
    const result = await strategy.execute(testTransactions);
    expect(result).toContain('Red Cross');
    expect(result).not.toContain('Grocery');
  });
  it('should sum total eligible tax deductions correctly', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue({
      standardTaxRate: 0.1,
      deductibleCategories: ['Medical', 'Charity'],
    });
    const testTransactions = [
      {
        id: '1',
        date: '2026-01-31',
        amount: -150.0,
        category: 'Charity',
        description: 'Donation',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-01-30',
        amount: -50.0,
        category: 'Medical',
        description: 'Copay',
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-01-29',
        amount: -100.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      },
    ];
    const result = await strategy.execute(testTransactions);
    expect(result).toContain('Total Deductions: $200.00');
  });
  it('should calculate estimated tax savings using standardTaxRate', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue({
      standardTaxRate: 0.2,
      deductibleCategories: ['Business'],
    });
    const testTransactions = [
      {
        id: '1',
        date: '2026-01-31',
        amount: -400.0,
        category: 'Business',
        description: 'Software',
        status: 'completed',
      },
    ];
    const result = await strategy.execute(testTransactions);
    expect(result).toContain('Estimated Tax Savings: $80.00');
  });
  it('should calculate estimated VAT/sales tax paid on non-deductible expense transactions', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue({
      standardTaxRate: 0.05,
      deductibleCategories: ['Charity'],
    });
    const testTransactions = [
      {
        id: '1',
        date: '2026-01-31',
        amount: -200.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-01-30',
        amount: -100.0,
        category: 'Entertainment',
        description: 'Movies',
        status: 'completed',
      },
    ];
    const result = await strategy.execute(testTransactions);
    expect(result).toContain('Estimated VAT on Non-Deductibles: $15.00');
  });
  it('should structure report to show both aggregates and itemized deductible transactions', async () => {
    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue({
      standardTaxRate: 0.1,
      deductibleCategories: ['Charity'],
    });
    const testTransactions = [
      {
        id: '1',
        date: '2026-01-31',
        amount: -100.0,
        category: 'Charity',
        description: 'Donation',
        status: 'completed',
      },
    ];
    const result = await strategy.execute(testTransactions);
    expect(result).toContain('Total Deductions: $100.00');
    expect(result).toContain('Eligible Transactions:\n');
    expect(result).toContain('- 2026-01-31 | Donation | Charity | $100.00');
  });
});
