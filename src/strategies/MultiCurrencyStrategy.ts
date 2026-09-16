import { Transaction } from '../models.js';
import { ExchangeRateService } from '../services/ExchangeRateService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class MultiCurrencyStrategy implements AuditStrategy {
  public readonly name = 'Multi-Currency Auditor';
  public readonly description =
    'Converts and aggregates transactions in a foreign currency';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 5 - Implement this strategy.
    // 1. Call ExchangeRateService.getExchangeRates() asynchronously.

      const ExchangeRates = await ExchangeRateService.getExchangeRates();

    // 2. Identify the target currency from `customParam` (default to 'EUR' if invalid/not provided).

      let targetCurrency = "EUR";

   // Make sure "eur" or " eUr " for example, are cleaned up to be "EUR" to satisfy case-sensitivity.
	 if (customParam) {
		let cleanedParameter = customParam.trim().toUpperCase();
		if (cleanedParameter != "") {
			targetCurrency = cleanedParameter;
		}
   // Look inside exchangeRates, inside the properties of "rates", clean it up, check to see if its undefined.
	if (ExchangeRates.rates[cleanedParameter] != undefined) {
		targetCurrency = cleanedParameter;
	    }
	}

    // 3. Look up the exchange rate for the target currency (throw an error if not found in rates).

	let rate = undefined;
	if (ExchangeRates && ExchangeRates.rates) {
		rate = ExchangeRates.rates[targetCurrency];
	}
	if (rate == undefined) {
		throw new Error("CURRENCY: " + targetCurrency + " NOT FOUND IN RATES.");
	}

    // 4. Convert all transaction amounts to the target currency.

	let totalIncomeUSD = 0;
	let totalExpensesUSD = 0;
	let incomeCounts= 0;
	let expenseCounts = 0;
	
   for (const transaction of transactions) {

	if (transaction.amount > 0) {
		totalIncomeUSD = totalIncomeUSD + transaction.amount;
		incomeCounts = incomeCounts + 1;
	} else if (transaction.amount < 0) {
		totalExpensesUSD += Math.abs(transaction.amount);
		expenseCounts += 1;
	  }
	}

	const totalIncomeTarget = totalIncomeUSD * rate;
	const totalExpensesTarget = totalExpensesUSD * rate;

	const netBalanceUSD = totalIncomeUSD - totalExpensesUSD
	const netBalanceTarget = totalIncomeTarget - totalExpensesTarget;

	let avgIncomeUSD = 0;
	if (incomeCounts > 0) {
		avgIncomeUSD = totalIncomeUSD / incomeCounts;
	}

	let avgExpenseUSD = 0;
	if (expenseCounts > 0) {
		avgExpenseUSD = totalExpensesUSD / expenseCounts;
	}

	const avgIncomeTarget = avgIncomeUSD * rate;
	const avgExpenseTarget = avgExpenseUSD * rate;

    // 5. Calculate total income, total expenses, and net balance in BOTH USD and target currency.

	// The code below pulls in data from formattedUSD values and rounds the decimals to the hundredth place.

	const formattedRate = rate.toFixed(2);
	const formattedIncomeUSD = totalIncomeUSD.toFixed(2);
	const formattedExpenseUSD = totalExpensesUSD.toFixed(2);
	const formattedNetUSD = netBalanceUSD.toFixed(2);
	const formattedAvgIncomeUSD = avgIncomeUSD.toFixed(2);
	const formattedAvgExpenseUSD = avgExpenseUSD.toFixed(2);

	// The code below pulls data from formatted targets and rounds the decimals to the hundredth place.
	const formattedIncomeTarget = totalIncomeTarget.toFixed(2);
	const formattedExpenseTarget = totalExpensesTarget.toFixed(2);
	const formattedNetTarget = netBalanceTarget.toFixed(2);
	const formattedAvgIncomeTarget = avgIncomeTarget.toFixed(2);
	const formattedAvgExpenseTarget = avgExpenseTarget.toFixed(2);

    // 6. Format and return a text-based audit report detailing conversion metrics, conversion rate used, and transaction summaries in both currencies.

	// Below is the financial report for every target and actual currency seperately.
	// The whole code is on seperate lines for better viewability.

	const finalFinancialReport =
		"Financial Report:\n" +
		"Target Currency: " + targetCurrency +
		"\nExchange Rate: " + formattedRate +
		"\nUSD Totals:\n" +
		"Total Income: $" + formattedIncomeUSD +
		"\nTotal Expenses: $" + formattedExpenseUSD +
		"\nNet Balance: $" + formattedNetUSD +
		"\nAvg Income: $" + formattedAvgIncomeUSD +
		"\nAvg Expense: $" + formattedAvgExpenseUSD +

	// Below is the organized income, expenses, and balance for both actual and targetted currency.
		"\nTotal Income: " + formattedIncomeTarget + " " + targetCurrency +
		"\nTotal Expenses: " + formattedExpenseTarget + " " + targetCurrency +
		"\nNet Balance: " + formattedNetTarget + " " + targetCurrency +
		"\nAvg Income: " +  formattedAvgIncomeTarget + " " + targetCurrency +
		"\nAvg Expense: " + formattedAvgExpenseTarget + " " + targetCurrency;
		
		return finalFinancialReport;

    throw new Error('Method not implemented.');
  }
}
