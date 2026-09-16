export class ExchangeRateService {
  /**
   * Simulates fetching latest currency conversion rates relative to USD.
   */
  static async getExchangeRates() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          base: 'USD',
          rates: {
            EUR: 0.92,
            GBP: 0.79,
            JPY: 155.4,
            CAD: 1.36,
          },
        });
      }, 50);
    });
  }
}
