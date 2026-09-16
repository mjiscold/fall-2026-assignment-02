import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiCurrencyStrategy } from '../src/strategies/MultiCurrencyStrategy.js';
import { ExchangeRateService } from '../src/services/ExchangeRateService.js';
import { Transaction } from '../src/models.js';

describe('MultiCurrencyStrategy (Feature 5)', () => {
  let strategy: MultiCurrencyStrategy;

  beforeEach(() => {
    strategy = new MultiCurrencyStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should convert amounts and sum values in target currency', async () => {
  //   const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
  //   const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: 100.00, category: 'Salary', description: 'Gig', status: 'completed' },
  //     { id: '2', date: '2026-05-02', amount: -50.00, category: 'Food', description: 'Grocery', status: 'completed' },
  //   ];
  //
  //   const result = await strategy.execute(testTransactions, 'EUR');
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('90.00 EUR'); // 100 * 0.90
  //   expect(result).toContain('-45.00 EUR'); // -50 * 0.90
  //   expect(result).toContain('Balance: 45.00 EUR');
  // });

  // MOCK RATE TO BE USED:

	const mockRate = {
		base: 'USD',
		rates: {
			EUR: 0.75,
			JPY: 114.00,
		},
	};


  // 'async () =>' is used to be able to use 'await' for the program to gather information first before progressing forward	

  it('should parse exchange rates and use customParam target currency', async () => {

	const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRate);

	const testingTransactions: Transaction[] = [{ id: '1', date: '2026-04-18', amount: 150.00, category: 'deposit', description: 'paycheck', status: 'completed' } ];

	const result = await strategy.execute(testingTransactions, 'JPY');

	expect(spy).toHaveBeenCalled();
	expect(result).toContain('Target Currency: JPY');
	expect(result).toContain('Exchange Rate: 114.00');
	expect(result).toContain('Total Income: 17100.00 JPY');
  });


  it('should default to EUR conversion if currency param is missing or invalid', async () => {
	vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRate);

	const testingTransactions: Transaction[] = [
		{ id: '1', date: '2026-05-01', amount: 200.00, category: 'deposit', description: 'Sent money', status: 'completed' }];

	const result = await strategy.execute(testingTransactions);

	expect(result).toContain('Target Currency: EUR');
        expect(result).toContain('Exchange Rate: 0.75');
	expect(result).toContain('Total Income: 150.00 EUR');
 });

  it('should throw an error if the target currency does not exist in exchange rates', async () => {
	
	vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRate);
	const testingTransactions: Transaction[] = [];
	await expect(strategy.execute(testingTransactions, 'GBP')).rejects.toThrow();
  
  });

  it('should accurately convert individual transaction amounts to the target currency', async () => {

	vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRate);

	const testingTransactions: Transaction[] = [
		{ id: '1', date: '2026-06-10', amount: 250.00, category: 'Deposit', description: 'Paycheck', status: 'completed' },
		{ id: '2', date: '2026-06-13', amount: -15.00, category: 'Shopping', description: 'Personal needs', status: 'completed' } ];

	const result = await strategy.execute(testingTransactions, 'EUR');

	// Converted USD Total Income and Expenses to EUR
	expect(result).toContain('Total Income: 187.50');
	expect(result).toContain('Total Expenses: 11.25 EUR');
  });

  it('should calculate and display totals (income, expense, net balance) in both USD and target currency', async() =>  {

	vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRate);
	
	const testingTransactions: Transaction[] = [
		{ id: '1', date: '2026-09-03', amount: 50, category: 'Deposit', description: 'Recieved money', status: 'completed' },
		{ id: '2', date: '2026-09-05', amount: -4, category: 'Food', description: 'Snack from gas station', status: 'completed' } ];

	const result = await strategy.execute(testingTransactions, 'JPY');

	// USD Total Income, Expense, and Net Balance
	expect(result).toContain('Total Income: $50.00');
	expect(result).toContain('Total Expenses: $4.00');
	expect(result).toContain('Net Balance: $46.00');

	// JPY conversions of USD Total Income, Expenses, and Net Balance
	expect(result).toContain('Total Income: 5700.00 JPY');
	expect(result).toContain('Total Expenses: 456.00 JPY');
	expect(result).toContain('Net Balance: 5244.00');
 
 });
});

