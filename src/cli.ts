import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import * as tar from 'tar';

const program = new Command();

program
  .name('prompt-asset-pack')
  .description('Package prompt-asset toolchain for distribution')
  .version('0.1.0');

const REPOS = [
  'prompt-asset-writer',
  'prompt-asset-drawer',
  'prompt-asset-sound',
  'prompt-asset-conductor',
  'prompt-asset-demo-pipeline',
  'node24-ci-guard-complete'
];

export interface ManifoldProduct {
  id: string;
  name: string;
  category: string;
  resalePrice: number;
  productionCost: number;
  description: string;
}

export const MANIFOLD_PRODUCTS: ManifoldProduct[] = [
  {
    id: 'sdk',
    name: 'MANIFOLD SDK',
    category: 'Developer Tools',
    resalePrice: 4899,
    productionCost: 350,
    description: 'Complete software development kit for integrating field computation into game engines.',
  },
  {
    id: 'forge',
    name: 'Tensor Forge',
    category: 'SaaS',
    resalePrice: 348,
    productionCost: 35,
    description: 'Cloud-based SaaS for creating and editing 6-channel material tensors.',
  },
  {
    id: 'engine',
    name: 'Field Engine Pro',
    category: 'Enterprise',
    resalePrice: 2999,
    productionCost: 450,
    description: 'Enterprise-grade simulation engine for physics, engineering, and scientific computing.',
  },
  {
    id: 'academy',
    name: 'MANIFOLD Academy',
    category: 'Education',
    resalePrice: 199,
    productionCost: 15,
    description: 'Online learning platform with courses on field computation and WebGPU.',
  },
  {
    id: 'taas',
    name: 'Terrain as a Service',
    category: 'API',
    resalePrice: 1188,
    productionCost: 80,
    description: 'REST API for generating terrain, materials, and environments on-demand.',
  },
  {
    id: 'toolkit',
    name: 'Vinculum Toolkit',
    category: 'Plugin',
    resalePrice: 79,
    productionCost: 8,
    description: 'Blender add-on for creating vinculum constraints and field-driven animations.',
  },
  {
    id: 'music',
    name: 'MANIFOLD Music Pack',
    category: 'Asset',
    resalePrice: 49,
    productionCost: 4,
    description: 'Royalty-free music collection from guinea-pig-trench-portal, optimized for games.',
  },
  {
    id: 'inspector',
    name: 'Field Inspector',
    category: 'Tool',
    resalePrice: 199,
    productionCost: 20,
    description: 'Browser extension for debugging and visualizing field computation in real-time.',
  },
  {
    id: 'cloud',
    name: 'MANIFOLD Cloud',
    category: 'Infrastructure',
    resalePrice: 1188,
    productionCost: 180,
    description: 'Cloud platform for running MANIFOLD simulations at scale.',
  },
  {
    id: 'templates',
    name: 'Tensor Templates',
    category: 'Asset',
    resalePrice: 39,
    productionCost: 3,
    description: 'Pre-built tensor templates for common use cases and industries.',
  },
  {
    id: 'art',
    name: 'Physical Tensor Art',
    category: 'Merch',
    resalePrice: 149,
    productionCost: 45,
    description: '3D-printed art pieces visualizing 6-channel material tensors.',
  }
];

export function selectBestProduct(budget: number): ManifoldProduct | null {
  let bestProduct: ManifoldProduct | null = null;
  let highestROI = -1;

  for (const product of MANIFOLD_PRODUCTS) {
    if (product.productionCost <= budget) {
      const roi = (product.resalePrice - product.productionCost) / product.productionCost;
      if (roi > highestROI) {
        highestROI = roi;
        bestProduct = product;
      }
    }
  }

  return bestProduct;
}

program
  .command('build')
  .option('--out <dir>', 'Output directory', './dist')
  .option('--version <str>', 'Version tag', 'latest')
  .action(async (opts) => {
    const outDir = path.resolve(opts.out);
    await fs.ensureDir(outDir);
    const pkgDir = path.join(outDir, `prompt-asset-toolchain-${opts.version}`);
    await fs.ensureDir(pkgDir);
    
    for (const repo of REPOS) {
      const src = path.join('..', '..', repo);
      const dest = path.join(pkgDir, repo);
      if (await fs.pathExists(src)) {
        await fs.copy(src, dest, { filter: f => !f.includes('node_modules') && !f.includes('.git') });
        console.log(`Copied ${repo}`);
      } else {
        console.warn(`Missing: ${repo}`);
      }
    }
    
    const tgz = path.join(outDir, `prompt-asset-toolchain-${opts.version}.tgz`);
    await tar.c({ gzip: true, file: tgz, cwd: pkgDir }, ['.']);
    console.log(`Packaged: ${tgz}`);
  });

program
  .command('autosell')
  .description('Autonomously select, generate and package a product based on highest ROI')
  .option('--budget <number>', 'Available budget in USD', '100')
  .option('--out <dir>', 'Output directory', './dist')
  .action(async (opts) => {
    const budget = parseFloat(opts.budget);
    const product = selectBestProduct(budget);
    
    if (!product) {
      console.error(`No products found within the budget of $${budget}`);
      process.exit(1);
    }
    
    const roi = (product.resalePrice - product.productionCost) / product.productionCost;
    console.log(`\n=== Autonomous Product Selection ===`);
    console.log(`Selected Product: ${product.name}`);
    console.log(`Category:         ${product.category}`);
    console.log(`Production Cost:  $${product.productionCost}`);
    console.log(`Resale Value:     $${product.resalePrice}`);
    console.log(`Estimated ROI:    ${(roi * 100).toFixed(1)}%`);
    
    const outDir = path.resolve(opts.out);
    await fs.ensureDir(outDir);
    
    const pkgDir = path.join(outDir, `autonomous-product-${product.id}`);
    await fs.ensureDir(pkgDir);
    
    // Write product manifest
    const manifest = {
      product_id: product.id,
      name: product.name,
      category: product.category,
      resale_value: product.resalePrice,
      production_cost: product.productionCost,
      estimated_roi: roi,
      description: product.description,
      license: 'Guinea Pig Trench LLC Reseller Agreement Exhibit A compliant',
      timestamp: new Date().toISOString()
    };
    
    await fs.writeJson(path.join(pkgDir, 'manifest.json'), manifest, { spaces: 2 });
    
    // Simulate prompt asset packaging
    await fs.writeFile(
      path.join(pkgDir, 'README.md'),
      `# ${product.name}\n\n${product.description}\n\nPackage autonomously generated by prompt-asset-marketplace.`
    );
    
    const tgz = path.join(outDir, `autonomous-product-${product.id}.tgz`);
    await tar.c({ gzip: true, file: tgz, cwd: pkgDir }, ['.']);
    console.log(`\nSuccessfully generated and packaged product: ${tgz}`);
  });

if (!process.env.VITEST) {
  program.parse();
}
