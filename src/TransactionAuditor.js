/**
 * The Context class that maintains a reference to an AuditStrategy
 * and delegates execution to it.
 */
export class TransactionAuditor {
  strategy;
  /**
   * Initializes the auditor with a specific concrete strategy.
   */
  constructor(strategy) {
    this.strategy = strategy;
  }
  /**
   * Allows changing the audit strategy dynamically at runtime.
   */
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  /**
   * Executes the active audit strategy.
   */
  async runAudit(transactions, customParam) {
    return this.strategy.execute(transactions, customParam);
  }
}
