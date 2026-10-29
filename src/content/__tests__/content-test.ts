import { days, validDays } from '../index';
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
  it('never marks content approved without a named reviewer', () => {
    for (const d of days) expect(d.status === 'approved' ? !!d.reviewer : true).toBe(true);
  });
});
