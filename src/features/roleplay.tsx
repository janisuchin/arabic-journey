// Branching role-play (Prompt B L): the other person speaks, the learner picks a reply. A right reply moves the
// conversation on (two right replies can lead to different places); a wrong one shows why and lets the learner try
// again. Mirrors the German Journey role-play.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { MistakeScope, RichText, TapText } from '../components/tap';
import { AppText, ArText, Button, Card, IconButton, Row } from '../components/ui';
import type { Roleplay } from '../content/schema';
import { tts } from '../services/tts';
import { usePalette, useSettings } from '../state/hooks';

type Step = { npc: string; you: string };

export function RoleplayRunner({
  roleplay,
  speakers,
}: {
  roleplay: Roleplay;
  speakers: { key: string; name: string; nameAr: string }[];
}) {
  const c = usePalette();
  const settings = useSettings();
  const nodes = useMemo(() => new Map(roleplay.nodes.map((n) => [n.id, n])), [roleplay]);
  const [nodeId, setNodeId] = useState<string | null>(roleplay.start);
  const [picked, setPicked] = useState<number | null>(null);
  const [slips, setSlips] = useState(0);
  const [history, setHistory] = useState<Step[]>([]);
  useEffect(() => () => tts.stop(), []);
  const say = (ar: string) => {
    try {
      tts.speak(ar, { rate: settings.speechRate });
    } catch {
      // no voice: the text is still there
    }
  };
  const restart = () => {
    setNodeId(roleplay.start);
    setPicked(null);
    setSlips(0);
    setHistory([]);
  };
  const node = nodeId ? nodes.get(nodeId) : undefined;

  if (!node)
    return (
      <Card testID="roleplay-done">
        <AppText weight="800" color={c.good}>
          🎭 Role-play complete!
        </AppText>
        <AppText size={14}>
          {slips
            ? `You recovered from ${slips} wrong ${slips === 1 ? 'reply' : 'replies'}: that is how real conversations go.`
            : 'A smooth conversation, no wrong replies. Try again and take the other path.'}
        </AppText>
        {history.map((h, i) => (
          <View key={i} style={{ gap: 2, marginTop: 6 }}>
            <ArText size={17} color={c.textMuted}>
              {h.npc}
            </ArText>
            <ArText size={17} color={c.good}>
              {h.you}
            </ArText>
          </View>
        ))}
        <Button kind="secondary" icon="refresh" label="Play again" onPress={restart} testID="roleplay-again" />
      </Card>
    );

  const sp = speakers.find((s) => s.key === node.npc.sp);
  const choice = picked !== null ? node.choices[picked] : null;
  return (
    <View style={{ gap: 10 }} testID="roleplay">
      <Card>
        <Row gap={6}>
          <AppText size={12} weight="800" color={c.accent}>
            {sp?.name}
          </AppText>
          {sp && (
            <ArText size={13} color={c.textMuted}>
              {sp.nameAr}
            </ArText>
          )}
          <View style={{ flex: 1 }} />
          <IconButton icon="volume-medium-outline" size={18} label="Play this line" onPress={() => say(node.npc.ar)} />
        </Row>
        <TapText text={node.npc.ar} segs={node.npc.segs} size={22} floating />
        {settings.showTranslations && <AppText size={14}>{node.npc.en}</AppText>}
      </Card>
      <AppText weight="800">Your reply:</AppText>
      {node.choices.map((ch, i) => {
        const chosen = picked === i;
        const border = chosen ? (ch.ok ? c.good : c.bad) : c.border;
        return (
          <Pressable
            key={`${node.id}-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`Reply ${i + 1}`}
            testID={`roleplay-choice-${i}`}
            disabled={!!choice?.ok}
            onPress={() => {
              setPicked(i);
              say(ch.ar);
              if (!ch.ok) setSlips((n) => n + 1);
            }}
            style={{
              borderRadius: 14,
              borderWidth: chosen ? 2 : 1,
              borderColor: border,
              backgroundColor: c.card,
              padding: 12,
              gap: 2,
            }}>
            {/* a wrong reply may hold a wrong form: its words get the exercise glosses, as in a mistake card */}
            {ch.ok ? (
              <TapText text={ch.ar} segs={ch.segs} size={20} interactive={false} />
            ) : (
              <MistakeScope>
                <TapText text={ch.ar} segs={ch.segs} size={20} interactive={false} />
              </MistakeScope>
            )}
            {settings.showTranslations && (
              <AppText size={14} color={c.textMuted}>
                {ch.en}
              </AppText>
            )}
          </Pressable>
        );
      })}
      {choice && (
        <View style={{ gap: 6 }}>
          <AppText weight="800" color={choice.ok ? c.good : c.bad} testID="roleplay-feedback">
            {choice.ok ? '✓ Good reply.' : '✗ Not quite. Try another reply.'}
          </AppText>
          <RichText text={choice.feedback} size={14} />
          {choice.ok && (
            <Button
              label={choice.next ? 'Continue' : 'Finish the role-play'}
              iconAfter="arrow-forward"
              testID="roleplay-next"
              onPress={() => {
                setHistory((h) => [...h, { npc: node.npc.ar, you: choice.ar }]);
                setPicked(null);
                setNodeId(choice.next);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
