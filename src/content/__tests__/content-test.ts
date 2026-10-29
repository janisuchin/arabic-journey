import { days, validDays } from '../index';
import { findGlossGaps } from '../gloss-gaps';
import { validateAll } from '../validate';

describe('content', () => {
  it('validates with 0 errors', () => {
    expect(validateAll()).toEqual([]);
  });
  it('has the first week written', () => {
    expect(validDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('has no gloss gaps (gloss-coverage-test)', () => {
    expect(findGlossGaps()).toEqual([]);
  });
  it('never marks content approved without a named reviewer', () => {
    for (const d of days) expect(d.status === 'approved' ? !!d.reviewer : true).toBe(true);
  });
});
