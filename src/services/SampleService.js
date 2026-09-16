export class SampleService {
  /**
   * Simulates fetching system configuration asynchronously.
   */
  static async getConfig() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ serviceFeeRate: 0.02 });
      }, 50);
    });
  }
}
