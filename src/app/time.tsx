// Time lab (Prompt B section L): a clock you can set, the time in words (five-minute steps), a practice quiz,
// today's date (Gregorian with both month-name sets, and Hijri), weekdays, months and parts of the day.
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { webLang } from '@/base/rtl';
import { RichText, TapText } from '@/components/tap';
import { AR_FONT, AppText, Button, Card, IconButton, Pill, Row, Screen, SectionTitle } from '@/components/ui';
import type { Question } from '@/content/schema';
import {
  ASK_TIME,
  MONTHS_HIJRI,
  MONTHS_LEVANT,
  MONTHS_WEST,
  PARTS_OF_DAY,
  WEEKDAYS,
  roundTo5,
  sayDate,
  sayHijri,
  sayTime,
  type MonthSet,
  type Phrase,
} from '@/core/time';
import { QuizRunner } from '@/features/lesson';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

function ClockFace({ h, m, size = 180 }: { h: number; m: number; size?: number }) {
  const c = usePalette();
  const r = size / 2;
  // a hand is a bar twice its length, centred on the dial, with only its top half coloured: rotating the bar
  // about its own centre turns the hand about the dial centre (no transform-origin needed).
  const hand = (deg: number, len: number, width: number, color: string) => (
    <View
      style={{
        position: 'absolute',
        left: r - width / 2,
        top: r - len,
        width,
        height: len * 2,
        transform: [{ rotate: `${deg}deg` }],
      }}>
      <View style={{ flex: 1, backgroundColor: color, borderRadius: width }} />
      <View style={{ flex: 1 }} />
    </View>
  );
  return (
    <View
      accessible
      accessibilityLabel={`Clock showing ${h % 12 || 12}:${String(m).padStart(2, '0')}`}
      style={{
        direction: 'ltr',
        width: size,
        height: size,
        borderRadius: r,
        borderWidth: 3,
        borderColor: c.accent,
        backgroundColor: c.card,
        alignSelf: 'center',
      }}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) / 12) * 2 * Math.PI;
        const x = r + Math.sin(a) * (r - 20) - 12;
        const y = r - Math.cos(a) * (r - 20) - 12;
        return (
          <Text
            key={i}
            style={{
              position: 'absolute',
              left: x - 3,
              top: y - 3,
              width: 24,
              textAlign: 'center',
              color: c.textMuted,
              fontSize: 14,
            }}>
            {i + 1}
          </Text>
        );
      })}
      {hand(((h % 12) + m / 60) * 30, r * 0.5, 6, c.text)}
      {hand(m * 6, r * 0.75, 4, c.accent)}
      <View
        style={{ position: 'absolute', left: r - 6, top: r - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: c.text }}
      />
    </View>
  );
}

function PhraseRow({ p, size = 22, note }: { p: Phrase; size?: number; note?: string }) {
  const settings = useSettings();
  return (
    <Row gap={10}>
      <View style={{ flex: 1 }}>
        <TapText text={p.ar} segs={p.segs} size={size} />
        <AppText size={14}>{note ?? p.en}</AppText>
      </View>
      <IconButton
        icon="volume-medium-outline"
        label={`Hear ${p.en}`}
        onPress={() => tts.speak(p.ar, { rate: settings.speechRate })}
      />
    </Row>
  );
}

/** Eight practice questions from a seed: read the Arabic and pick the clock time, or the other way round. */
function makeQuestions(seed: number): Question[] {
  let s = seed * 9301 + 49297;
  const rnd = (n: number) => {
    s = (s * 9301 + 49297) % 233280;
    return Math.floor((s / 233280) * n);
  };
  const fmt = (h: number, m: number) => `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
  const out: Question[] = [];
  for (let k = 0; k < 8; k++) {
    const h = 1 + rnd(12);
    const m = rnd(12) * 5;
    // typical confusions: the next hour, the mirror minute (20 ↔ 40, 15 ↔ 45), five minutes off
    const cands = [
      [h, m],
      [(h % 12) + 1, m],
      [h, (60 - m) % 60],
      [h, (m + 5) % 60],
      [h === 1 ? 12 : h - 1, m],
      [(h % 12) + 1, (60 - m) % 60],
    ];
    const seen = new Set<string>();
    const opts = cands.filter(([a, b]) => {
      const key = fmt(a, b);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const four = opts.slice(0, 4);
    if (k % 2 === 0)
      out.push({
        id: `time-${seed}-${k}`,
        prompt: 'What time is it?',
        ar: sayTime(h, m, false).ar,
        options: four.map(([a, b]) => fmt(a, b)),
        answer: 0,
        explain: sayTime(h, m, false).en,
      });
    else
      out.push({
        id: `time-${seed}-${k}`,
        prompt: `How do you say ${fmt(h, m)}?`,
        options: four.map(([a, b]) => sayTime(a, b, false).ar),
        answer: 0,
        explain: sayTime(h, m, false).en,
      });
  }
  return out;
}

export default function TimeLab() {
  const c = usePalette();
  const settings = useSettings();
  const now = new Date();
  const [h, setH] = useState(now.getHours());
  const [m, setM] = useState(roundTo5(now.getMinutes()) % 60);
  const [withPart, setWithPart] = useState(true);
  const [seed, setSeed] = useState(1);
  const [months, setMonths] = useState<MonthSet>('west');
  const t = sayTime(h, m, withPart);
  const questions = useMemo(() => makeQuestions(seed), [seed]);
  const date = sayDate(now, months);
  const hijri = sayHijri(now);
  const step = (dm: number) => {
    const total = (((h * 60 + m + dm) % 1440) + 1440) % 1440;
    setH(Math.floor(total / 60));
    setM(total % 60);
  };
  const setNow = () => {
    const d = new Date();
    const r = roundTo5(d.getMinutes());
    setH((d.getHours() + (r === 60 ? 1 : 0)) % 24);
    setM(r % 60);
  };

  return (
    <Screen title="Time lab" testID="time-lab">
      <Card>
        <PhraseRow p={ASK_TIME} size={26} />
      </Card>
      <Card testID="time-clock">
        <ClockFace h={h} m={m} />
        <Row gap={16} style={{ justifyContent: 'center' }}>
          <AppText size={30} weight="800" testID="time-digits">
            {t.digits}
          </AppText>
          <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: 30, color: c.accent }}>
            {t.arabicDigits}
          </Text>
        </Row>
        <Row wrap gap={6} style={{ justifyContent: 'center' }}>
          <Button kind="secondary" label="− 1 hour" onPress={() => step(-60)} testID="time-minus-hour" />
          <Button kind="secondary" label="− 5 min" onPress={() => step(-5)} testID="time-minus-5" />
          <Button kind="secondary" label="+ 5 min" onPress={() => step(5)} testID="time-plus-5" />
          <Button kind="secondary" label="+ 1 hour" onPress={() => step(60)} testID="time-plus-hour" />
          <Button kind="ghost" icon="time-outline" label="Now" onPress={setNow} testID="time-now" />
        </Row>
        <View style={{ gap: 4 }} testID="time-phrase">
          <TapText text={t.ar} segs={t.segs} size={28} />
          <Row>
            <AppText weight="700" style={{ flex: 1 }} testID="time-english">
              {t.en}
            </AppText>
            <IconButton icon="volume-high" label="Hear the time" onPress={() => tts.speak(t.ar, { rate: settings.speechRate })} />
          </Row>
        </View>
        <Row wrap gap={6}>
          <Pill label={withPart ? '✓ Part of the day' : 'Part of the day'} onPress={() => setWithPart(!withPart)} />
        </Row>
        <AppText size={13} muted>
          People say the time in five-minute steps, so the clock moves by five minutes. Timetables and digital clocks use the
          24-hour clock; in speech the 12-hour clock with the part of the day is usual.
        </AppText>
      </Card>

      <SectionTitle icon="git-compare-outline">How the minutes work</SectionTitle>
      <RichText
        text="Tap a line to set the clock. From twenty to the hour, Arabic counts back from the next hour with إِلَّا (minus); :25 and :35 are said as “half minus five” and “half and five”."
        size={14}
        muted
      />
      {Array.from({ length: 12 }, (_, i) => {
        const x = sayTime(h, i * 5, false);
        return (
          <Card key={i} style={{ paddingVertical: 8 }} onPress={() => setM(i * 5)} label={`Set the clock to ${x.digits}`}>
            <Row gap={12}>
              <AppText weight="800" style={{ width: 54 }}>
                {x.digits}
              </AppText>
              <View style={{ flex: 1 }}>
                <TapText text={x.ar} segs={x.segs} size={20} interactive={false} />
                <AppText size={13} muted>
                  {x.en}
                </AppText>
              </View>
            </Row>
          </Card>
        );
      })}

      <SectionTitle icon="help-circle-outline">Practice</SectionTitle>
      <QuizRunner
        key={seed}
        questions={questions}
        seed={seed}
        passMark={settings.passMark}
        skill="time"
        onFinish={() => undefined}
      />
      <Button kind="ghost" icon="refresh" label="New questions" onPress={() => setSeed(seed + 1)} testID="time-new-questions" />

      <SectionTitle icon="calendar-outline">Today</SectionTitle>
      <Card testID="time-today">
        <Row wrap gap={6}>
          <Pill label={months === 'west' ? '✓ Egypt & Gulf months' : 'Egypt & Gulf months'} onPress={() => setMonths('west')} />
          <Pill
            label={months === 'levant' ? '✓ Levant & Iraq months' : 'Levant & Iraq months'}
            onPress={() => setMonths('levant')}
          />
        </Row>
        <PhraseRow p={date} size={24} />
        <AppText size={14} muted>
          {date.digits} · {date.arabicDigits}
        </AppText>
        {hijri ? (
          <View style={{ gap: 4 }} testID="time-hijri">
            <AppText weight="800">Hijri date</AppText>
            <PhraseRow p={hijri} size={22} />
            <AppText size={13} muted>
              {hijri.year} · {hijri.arabicYear} AH. Computed with the Umm al-Qura calendar; where a month starts with the sighting
              of the new moon, the local date can differ by a day.
            </AppText>
          </View>
        ) : (
          <AppText size={13} muted>
            This device cannot compute the Hijri date.
          </AppText>
        )}
      </Card>

      <SectionTitle icon="today-outline">Days of the week</SectionTitle>
      <Card>
        {WEEKDAYS.map((d) => (
          <PhraseRow key={d.ar} p={d} />
        ))}
        <RichText
          text="The week starts on Sunday, الْأَحَد (“the first”). Friday, الْجُمُعَة, is the day of the main weekly prayer; in many Arab countries the weekend is Friday and Saturday, while some, such as Morocco, Tunisia and (since 2022) the UAE, rest on Saturday and Sunday."
          size={14}
          muted
        />
      </Card>

      <SectionTitle icon="calendar-number-outline">Months</SectionTitle>
      <AppText size={14} muted>
        Two sets of names for the same Gregorian months. Egypt, the Gulf and Sudan mostly use the European-style names; Syria,
        Lebanon, Jordan, Palestine and Iraq use the old Syriac names. (Algeria and Tunisia use French-style names, and Morocco has
        its own variants.)
      </AppText>
      {MONTHS_WEST.map((w, i) => (
        <Card key={w.ar} style={{ paddingVertical: 8 }}>
          <Row gap={10}>
            <AppText weight="800" style={{ width: 92 }}>
              {i + 1}. {w.en}
            </AppText>
            <View style={{ flex: 1 }}>
              <TapText text={w.ar} segs={w.segs} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <TapText text={MONTHS_LEVANT[i].ar} segs={MONTHS_LEVANT[i].segs} size={20} />
            </View>
          </Row>
        </Card>
      ))}

      <SectionTitle icon="moon-outline">Hijri months</SectionTitle>
      <AppText size={14} muted>
        The Hijri calendar is lunar: its year is about 11 days shorter than the solar year, so Ramadan comes earlier every year.
        It sets the religious dates everywhere, and Saudi Arabia uses it officially alongside the Gregorian calendar.
      </AppText>
      <Card>
        {MONTHS_HIJRI.map((p, i) => (
          <PhraseRow key={p.ar} p={p} note={`${i + 1}. ${p.en}`} />
        ))}
      </Card>

      <SectionTitle icon="partly-sunny-outline">Parts of the day</SectionTitle>
      <Card>
        {PARTS_OF_DAY.filter((p, i, a) => a.findIndex((x) => x.en === p.en) === i).map((p) => (
          <PhraseRow
            key={p.en}
            p={{ ar: p.seg.map((s) => s[0]).join(' '), en: p.en, segs: p.seg }}
            note={`${p.en} (about ${p.from}:00–${p.to}:59${p.en === 'at night' ? ', and 21:00–23:59' : ''})`}
          />
        ))}
        <AppText size={13} muted>
          A rough guide: people draw the lines a little differently.
        </AppText>
      </Card>
    </Screen>
  );
}
