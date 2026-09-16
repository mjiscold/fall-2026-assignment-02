import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetLimitStrategy } from '../src/strategies/BudgetLimitStrategy.js';
import { BudgetService } from '../src/services/BudgetService.js';
import { Transaction } from '../src/models.js';

describe('BudgetLimitStrategy (Feature 1)', () => {
  let strategy: BudgetLimitStrategy;

  beforeEach(() => {
    strategy = new BudgetLimitStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should correctly identify categories that are over budget', async () => {
  //   // 1. Mock the BudgetService asynchronously
  //   const mockBudgets = { Food: 100, Rent: 1000 };
  //   const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
  //
  //   // 2. Set up test transactions
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -150.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Over budget
  //     { id: '2', date: '2026-05-02', amount: -900.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // Under budget
  //   ];
  //
  //   // 3. Execute
  //   const result = await strategy.execute(testTransactions);
  //
  //   // 4. Assert
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Food');
  //   expect(result).toContain('OVER BUDGET'); // or whatever formatting you choose
  //   expect(result).not.toContain('Rent over budget');
  // });

  it('should group expenses correctly by category and sum them', async () => {
    const mockBudgets = {
      Food: 200,
      Rent: 1000,
    };

    const spy = vi
      .spyOn(BudgetService, 'getCategoryBudgets')
      .mockResolvedValue(mockBudgets);

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
        amount: -500,
        category: 'Rent',
        description: 'Apartment',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, '');

    expect(spy).toHaveBeenCalled();

    expect(result).toContain('Spent $125.00');
    expect(result).toContain('Spent $500.00');
  });

  it('should calculate absolute overage amounts and percentage exceeded', async () => {
    const mockBudgets = {
      Food: 100,
    };

    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(
      mockBudgets,
    );

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -100,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -50,
        category: 'Food',
        description: 'Restaurant',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, '');

    expect(result).toContain('Spent $150.00');
    expect(result).toContain('OVER BUDGET by $50.00');
    expect(result).toContain('150.00%');
  });

  it(
    'should list the specific transactions contributing to categories that are over budget',
    async () => {
      const mockBudgets = {
        Food: 100,
        Rent: 1000,
      };

      vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(
        mockBudgets,
      );

      const testTransactions: Transaction[] = [
        {
          id: '1',
          date: '2026-05-01',
          amount: -75,
          category: 'Food',
          description: 'Grocery',
          status: 'completed',
        },
        {
          id: '2',
          date: '2026-05-02',
          amount: -50,
          category: 'Food',
          description: 'Restaurant',
          status: 'completed',
        },
        {
          id: '3',
          date: '2026-05-03',
          amount: -900,
          category: 'Rent',
          description: 'Apartment',
          status: 'completed',
        },
      ];

      const result = await strategy.execute(testTransactions, '');

      expect(result).toContain('Grocery');
      expect(result).toContain('Restaurant');

      expect(result).not.toContain('Apartment');
    },
  );

  it('should handle scenarios where no categories are over budget', async () => {
    const mockBudgets = {
      Food: 100,
      Rent: 1000,
    };

    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(
      mockBudgets,
    );

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
        amount: -800,
        category: 'Rent',
        description: 'Apartment',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, '');

    expect(result).toContain('No categories are over budget.');
    expect(result).not.toContain('OVER BUDGET by');
  });

  it('should handle empty transaction list gracefully', async () => {
    const mockBudgets = {
      Food: 100,
      Rent: 1000,
    };

    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(
      mockBudgets,
    );

    const testTransactions: Transaction[] = [];

    const result = await strategy.execute(testTransactions, '');

    expect(result).toContain('Spent $0.00');
    expect(result).toContain('No categories are over budget.');
    expect(result).toContain('None.');
  });
});