import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';
import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
import { Transaction } from '../src/models.js';

describe('AnomalyDetectionStrategy (Feature 2)', () => {
  let strategy: AnomalyDetectionStrategy;

  beforeEach(() => {
    strategy = new AnomalyDetectionStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should detect outlier transactions exceeding threshold', async () => {
  //   const mockRules = { maxTransactionAmount: 500.00, flaggedStatuses: ['flagged'] };
  //   const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -600.00, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Laptop');
  //   expect(result).toContain('Outlier');
  // });

  it(
    'should detect outlier transactions exceeding the configured max amount limit', async () =>{
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      // Sets max transaction amount to $500
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'],
    });

    const transactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -600.0, category: 'Shopping', description: 'Laptop', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);
    
    // The transaction over $500 should be reported as an outlier.
    expect(result).toContain('OUTLIER TRANSACTIONS');
    expect(result).toContain('Laptop');
    
    // The normal $100 transaction should not be reported here as an outlier.
    expect(result).not.toContain('Grocery | $-100.00');
  });

  it(
    'should identify duplicate transactions sharing identical date, amount, category, and description', async () =>{
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      // Sets the max transaction amount to $10,000
      maxTransactionAmount: 10000.0,
      flaggedStatuses: ['flagged'],
    });

    const transactions: Transaction[] = [
      // Two duplicate transactions sharing the date, amount, category, and description.
      { id: '1', date: '2026-05-01', amount: -50.0, category: 'Food', description: 'Coffee', status: 'completed' },
      { id: '2', date: '2026-05-01', amount: -50.0, category: 'Food', description: 'Coffee', status: 'completed' },
      // One unique transaction
      { id: '3', date: '2026-05-02', amount: -20.0, category: 'Food', description: 'Snack', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);

    // Expected to tell us that there are one pair duplicate sets present
    expect(result).toContain('DUPLICATE SETS');
    expect(result).toContain('Duplicate Set 1');
    expect(result).toContain('Coffee');
  });

  it(
    'should flag transactions matching standard flagged statuses in the rules', async () => {
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      // Sets the max transaction amount to $10,000
      maxTransactionAmount: 10000.0,
      flaggedStatuses: ['flagged'],
    });

    const transactions: Transaction[] = [
      // Creates one transaction that needs to be flagged as a suspicious charge.
      { id: '1', date: '2026-05-01', amount: -30.0, category: 'Misc', description: 'Suspicious charge', status: 'flagged' },
      // Creates one transaction that is valid and not a suspicious charge.
      { id: '2', date: '2026-05-02', amount: -20.0, category: 'Food', description: 'Lunch', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);

    // The suspicious charge should get flagged
    expect(result).toContain('FLAGGED STATUS TRANSACTIONS');
    // That same suspicious charge should be labeled as a Suspicious charge.
    expect(result).toContain('Suspicious charge');
    expect(result).not.toContain('Lunch |');
  });

  it(
    'should calculate correct transaction anomaly rates and total flagged valuation', async () => {
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      // Sets the max transaction amount to $500
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'],
    });

    const transactions: Transaction[] = [
      // Creates two transactions that should be flagged.
      { id: '1', date: '2026-05-01', amount: -600.0, category: 'Shopping', description: 'Laptop', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -30.0, category: 'Misc', description: 'Suspicious', status: 'flagged' },
      // Creates two transactions that should not be flagged.
      { id: '3', date: '2026-05-03', amount: -20.0, category: 'Food', description: 'Lunch', status: 'completed' },
      { id: '4', date: '2026-05-04', amount: -15.0, category: 'Food', description: 'Snack', status: 'completed' },
    ];

    const result = await strategy.execute(transactions);

    expect(result).toContain('Total Transactions: 4');
    // The two anomalous transactions should be flagged.
    expect(result).toContain('Total Anomalous Transactions: 2');
    // The anomaly rate should be calculated as 50%
    expect(result).toContain('Anomaly Rate: 50.00%');
  });

  it(
    'should output a clean, readable text audit report detailing warnings', async () => {
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue({
      // Sets the max transaction amount to $500
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'],
    });

    const result = await strategy.execute([]);

    // An output of clean and readable text should be made.
    expect(result).toContain('ANOMALY & DUPLICATE AUDIT REPORT');

    expect(result).toContain('No outliers found');
    expect(result).toContain('No duplicate transactions found');
    expect(result).toContain('No flagged transactions found');

    expect(result).toContain('Total Transactions: 0');

    expect(result).toContain('Anomaly Rate: 0.00%');
  });
});