/**
 * Abstract AI Provider interface.
 * Any AI provider (OpenRouter, Mock, Local, etc.) must adhere to this contract.
 */
export class AiProvider {
  /**
   * Run full ticket analysis: classification, priority, risks, KB matching, and solution draft.
   */
  async analyzeTicket({ ticket, articles = [], options = {} }) {
    throw new Error("analyzeTicket() not implemented in provider");
  }

  /**
   * Predict category from ticket attributes.
   */
  async classifyTicket({ ticket, options = {} }) {
    throw new Error("classifyTicket() not implemented in provider");
  }

  /**
   * Recommend priority based on urgency and business impact.
   */
  async recommendPriority({ ticket, options = {} }) {
    throw new Error("recommendPriority() not implemented in provider");
  }

  /**
   * Generate a grounded solution draft using ticket context and KB articles.
   */
  async generateSolution({ ticket, articles = [], options = {} }) {
    throw new Error("generateSolution() not implemented in provider");
  }
}

export default AiProvider;
