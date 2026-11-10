import { days, placards, validDays } from '../index';
import { findGlossGaps } from '../gloss-gaps';
import { validateAll } from '../validate';

describe('content', () => {
  it('validates with 0 errors', () => {
    expect(validateAll()).toEqual([]);
  });
  it('has the written days in order from day 1, with no gaps', () => {
    expect(validDays.length).toBeGreaterThanOrEqual(7);
    expect(validDays).toEqual(validDays.map((_, i) => i + 1));
  });
  it('has no gloss gaps (gloss-coverage-test)', () => {
    expect(findGlossGaps()).toEqual([]);
  });
  it('has about 18–20 placards with unique ids, none marked approved', () => {
    expect(placards.length).toBeGreaterThanOrEqual(18);
    expect(new Set(placards.map((p) => p.id)).size).toBe(placards.length);
    for (const p of placards) expect(p.status).not.toBe('approved');
  });
  it('never marks content approved without a named reviewer', () => {
    for (const d of days) expect(d.status === 'approved' ? !!d.reviewer : true).toBe(true);
  });
});
