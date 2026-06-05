import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import tar from 'tar';

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

program.parse();
