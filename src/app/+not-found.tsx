import { router } from 'expo-router';

import { AppText, Button, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen title="Not found">
      <AppText>This page does not exist.</AppText>
      <Button label="Back to Today" onPress={() => router.replace('/')} />
    </Screen>
  );
}
