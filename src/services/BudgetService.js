export class BudgetService {
  /**
   * Simulates fetching budget limits per category from a remote database/API.
   */
  static async getCategoryBudgets() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          Rent: 1200.0,
          Food: 150.0,
          Utilities: 150.0,
          Entertainment: 100.0,
          Transport: 50.0,
          Shopping: 500.0,
        });
      }, 50);
    });
  }
}
