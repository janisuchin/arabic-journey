/// <reference types="node" />
// npm run content:validate — zod schemas + language checks + gloss gaps. Exit 1 on any error.
import { days, scenarios, vocabulary, grammar, letters } from '../src/content';
import { validateAll } from '../src/content/validate';

const errs = validateAll();
console.log(
  `content: ${days.length} days, ${vocabulary.length} words, ${grammar.length} grammar rules, ` +
    `${letters.length} letters, ${scenarios.length} scenarios`,
);
for (const e of errs) console.log(`  ✗ ${e.where}: ${e.message}`);
console.log(`errors: ${errs.length}`);
process.exit(errs.length ? 1 : 0);
