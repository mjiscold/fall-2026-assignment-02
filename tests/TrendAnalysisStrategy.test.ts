import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrendAnalysisStrategy } from '../src/strategies/TrendAnalysisStrategy.js';
import { HistoricalDataService } from '../src/services/HistoricalDataService.js';
import { Transaction } from '../src/models.js';

describe('TrendAnalysisStrategy (Feature 3)', () => {
  let strategy: TrendAnalysisStrategy;

  beforeEach(() => {
    strategy = new TrendAnalysisStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should compute correct spending variances against historical averages', async () => {
  //   const mockAverages = { Food: 200, Rent: 1000 };
  //   const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -250.00, category: 'Food', description: 'Grocery', status: 'completed' }, // +25% change
  //     { id: '2', date: '2026-05-02', amount: -1000.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // 0% change
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('+25'); // growth detected
  //   expect(result).toContain('Food');
  // });

  it(
    'should group current expenses by category and compute accurate totals',
     async () => {

    const mockAverages = {
      Food: 200,
      Rent: 1000,
    };

    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -50,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -75,
        category: 'Food',
        description: 'Restaurant',
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-05-03',
        amount: -25,
        category: 'Food',
        description: 'Snacks',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();

    // $50 + $75 + $25 = $150
    expect(result).toContain('Food');
    expect(result).toContain('150');
  },
  );

  it(
    'should calculate variance percentage from historical averages correctly',
    async () => {

    const mockAverages = {
      Food: 200,
    };

    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -250,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();

    // Historical = $200
    // Current = $250
    // ((250 - 200) / 200) * 100 = 25%
    expect(result).toContain('Food');
    expect(result).toContain('25');
  },
  );

  it(
    'should highlight categories exceeding positive/negative 20% variance threshold',
     async () => {

    const mockAverages = {
      Food: 200,
      Entertainment: 100,
    };

    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -250,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -70,
        category: 'Entertainment',
        description: 'Movies',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();

    // Food: ((250 - 200) / 200) * 100 = +25%
    expect(result).toContain('Significant Growth Categories');
    expect(result).toContain('Food: 25.00%');

    // Entertainment: ((70 - 100) / 100) * 100 = -30%
    expect(result).toContain('Significant Savings Categories');
    expect(result).toContain('Entertainment: -30.00%');
  },
  );

  it(
    'should handle categories present in current data but missing in historical benchmarks',
    async () => {

    const mockAverages = {
      Food: 200,
    };

    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -100,
        category: 'Travel',
        description: 'Hotel',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();

    // Travel exists in current spending even though
    // there is no historical benchmark for Travel.
    expect(result).toContain('Travel');
    expect(result).toContain('100');
  },
  );

  it(
    'should format historical vs current comparisons in a readable report',
     async () => {

    const mockAverages = {
      Food: 200,
      Rent: 1000,
    };

    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -250,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -1000,
        category: 'Rent',
        description: 'Apartment',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();

    // Verify report headings
    expect(result).toContain('Category');
    expect(result).toContain('Current Spending');
    expect(result).toContain('Historical Average');
    expect(result).toContain('% Change');

    // Verify Food comparison
    expect(result).toContain('Food');
    expect(result).toContain('$250.00');
    expect(result).toContain('$200.00');
    expect(result).toContain('25.00%');

    // Verify Rent comparison
    expect(result).toContain('Rent');
    expect(result).toContain('$1000.00');

    // Verify significant-change sections
    expect(result).toContain('Significant Growth Categories');
    expect(result).toContain('Significant Savings Categories');
  },
  );
});
