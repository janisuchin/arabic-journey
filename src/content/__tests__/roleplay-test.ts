import { roleplays, scenarios } from '../index';
import type { Roleplay } from '../schema';
import { checkRoleplay, type ValidationError } from '../validate';

const line = (id: string, sp = 'waiter') => ({ id, sp, ar: 'مَرْحَبًا', en: 'Hello', segs: [['مَرْحَبًا', 'hello']] as [string, string][] });
const reply = (ok: boolean, next: string | null) => ({
  ar: ok ? `شُكْرًا ${next ?? ''}`.trim() : 'لَا',
  en: ok ? 'Thanks' : 'No',
  segs: ok ? ([['شُكْرًا', 'thank you']] as [string, string][]) : ([['لَا', 'no']] as [string, string][]),
  ok,
  feedback: 'why',
  next,
});
const rp = (nodes: Roleplay['nodes']): Roleplay => ({ scenario: 't', status: 'needs-review', start: 'a', nodes });
const problems = (r: Roleplay) => {
  const errs: ValidationError[] = [];
  checkRoleplay(r, ['waiter', 'daniel'], errs);
  return errs.map((e) => e.message).join(' | ');
};

describe('role-play graph rules', () => {
  it('every scenario has exactly one role-play, never approved without a reviewer', () => {
    for (const sc of scenarios) expect(roleplays.filter((r) => r.scenario === sc.id)).toHaveLength(1);
    for (const r of roleplays) expect(r.status).not.toBe('approved');
  });
  it('asks for a branch, a wrong reply per node, a way to finish and no loop', () => {
    // segs that do not join to the text are reported too, so use matching one-word replies
    const ok = (next: string | null) => ({ ...reply(true, next), ar: 'شُكْرًا', segs: [['شُكْرًا', 'thank you']] as [string, string][] });
    const ok2 = (next: string | null) => ({ ...reply(true, next), ar: 'نَعَم', en: 'Yes', segs: [['نَعَم', 'yes']] as [string, string][] });
    const wrong = reply(false, null);
    const good = rp([
      { id: 'a', npc: line('1'), choices: [ok('b'), ok2('c'), wrong] },
      { id: 'b', npc: line('2'), choices: [ok(null), wrong] },
      { id: 'c', npc: line('3'), choices: [ok(null), wrong] },
    ]);
    expect(problems(good)).toBe('');
    const noBranch = rp([
      { id: 'a', npc: line('1'), choices: [ok('b'), wrong] },
      { id: 'b', npc: line('2'), choices: [ok('c'), wrong] },
      { id: 'c', npc: line('3'), choices: [ok(null), wrong] },
    ]);
    expect(problems(noBranch)).toMatch(/no branch/);
    const loop = rp([
      { id: 'a', npc: line('1'), choices: [ok('b'), ok2('c'), wrong] },
      { id: 'b', npc: line('2'), choices: [ok('a'), wrong] },
      { id: 'c', npc: line('3'), choices: [ok(null), wrong] },
    ]);
    expect(problems(loop)).toMatch(/loop/);
    const noWrong = rp([
      { id: 'a', npc: line('1'), choices: [ok('b'), ok2('c')] },
      { id: 'b', npc: line('2'), choices: [ok(null), wrong] },
      { id: 'c', npc: line('3'), choices: [ok(null), wrong] },
    ]);
    expect(problems(noWrong)).toMatch(/no wrong reply/);
    const learnerSpeaks = rp([
      { id: 'a', npc: line('1', 'daniel'), choices: [ok('b'), ok2('c'), wrong] },
      { id: 'b', npc: line('2'), choices: [ok(null), wrong] },
      { id: 'c', npc: line('3'), choices: [ok(null), wrong] },
    ]);
    expect(problems(learnerSpeaks)).toMatch(/not the learner/);
    const wrongMovesOn = rp([
      { id: 'a', npc: line('1'), choices: [ok('b'), ok2('c'), { ...wrong, next: 'b' }] },
      { id: 'b', npc: line('2'), choices: [ok(null), wrong] },
      { id: 'c', npc: line('3'), choices: [ok(null), wrong] },
    ]);
    expect(problems(wrongMovesOn)).toMatch(/does not move on/);
  });
});
