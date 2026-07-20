/**
 * Common capability shared by all kingdom services.
 *
 * The Abstract Factory pattern defines separate product families (`Castle`, `King` and `Army`).
 * Since each exposes the same behaviour, this interface captures their shared contract.
 */
export interface Describable {
  /**
   * Common behaviour shared by all abstract products.
   *
   * The Abstract Factory pattern groups products into families.
   * Every product in this example exposes a human-readable description through the same interface.
   */
  describe(): string;
}
