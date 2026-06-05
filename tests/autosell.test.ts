import { describe, it, expect } from 'vitest';
import { selectBestProduct, MANIFOLD_PRODUCTS } from '../src/cli';

describe('autosell product selection', () => {
  it('should find all products in registry', () => {
    expect(MANIFOLD_PRODUCTS.length).toBe(11);
  });

  it('should select correct product based on highest ROI within budget', () => {
    // Budget 50 should afford academy (cost 15, ROI ~12.27), templates (cost 3, ROI 12.0), forge (cost 35, ROI 8.94), etc.
    // Academy has the highest ROI (12.27 > 12.0).
    const product50 = selectBestProduct(50);
    expect(product50).not.toBeNull();
    expect(product50?.id).toBe('academy');

    // Budget 100 should afford taas (cost 80, ROI ~13.85), which has the highest overall ROI.
    const product100 = selectBestProduct(100);
    expect(product100).not.toBeNull();
    expect(product100?.id).toBe('taas');

    // Budget 400 affords SDK (cost 350, ROI ~12.99) but taas (cost 80, ROI ~13.85) still has higher ROI.
    const product400 = selectBestProduct(400);
    expect(product400).not.toBeNull();
    expect(product400?.id).toBe('taas');
  });

  it('should return null when budget is too low for any product', () => {
    // Cheapest is templates (cost 3)
    const productTooLow = selectBestProduct(2);
    expect(productTooLow).toBeNull();
  });
});
