import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { colors, radius } from '@/constants/theme';
import type { ContentKind } from '@/types';

const TABS = [
  { value: 'mensagem', label: 'Mensagem' },
  { value: 'link', label: 'Link' },
  { value: 'imagem', label: 'Imagem' },
] as const;

const PLACEHOLDER: Record<ContentKind, string> = {
  mensagem: 'Cole aqui para analisarmos…',
  link: 'Cole aqui o link suspeito…',
  imagem: '',
};

const BUTTON_LABEL: Record<ContentKind, string> = {
  mensagem: 'Analisar mensagem',
  link: 'Analisar link',
  imagem: 'Analisar imagem',
};

interface PickedImage {
  uri: string;
  name: string;
}

export default function NewCheckScreen(): React.JSX.Element {
  const router = useRouter();
  const [kind, setKind] = useState<ContentKind>('mensagem');
  const [text, setText] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset === undefined) return;
    setImage({ uri: asset.uri, name: asset.fileName ?? 'imagem.jpg' });
    setKind('imagem');
  };

  const submit = (): void => {
    if (kind === 'imagem') {
      if (image === null) return Alert.alert('Escolha uma imagem', 'Selecione uma imagem da galeria para analisar.');
      router.push({ pathname: '/analisando', params: { kind, content: image.uri, label: image.name } });
      return;
    }
    const content = text.trim();
    if (content.length < 3) return Alert.alert('Nada para analisar', kind === 'link' ? 'Cole o link que você recebeu.' : 'Cole a mensagem que você recebeu.');
    router.push({ pathname: '/analisando', params: { kind, content, label: content } });
  };

  return (
    <Screen
      footer={
        <>
          <Button title={BUTTON_LABEL[kind]} rightIcon="arrow-forward" onPress={submit} />
          <View style={styles.secure}>
            <Ionicons name="lock-closed-outline" size={12} color={colors.muted} />
            <AppText variant="caption" color={colors.muted} style={styles.secureText}>Seus dados estão seguros conosco</AppText>
          </View>
        </>
      }
    >
      <ScreenHeader title="Nova verificação" />
      <SegmentedTabs options={TABS} value={kind} onChange={setKind} />

      <View style={styles.box}>
        {kind === 'imagem' ? (
          image === null ? (
            <Pressable accessibilityRole="button" onPress={pickImage} style={styles.center}>
              <Ionicons name="image-outline" size={34} color={colors.primary} />
              <AppText variant="caption" color={colors.muted}>Toque para escolher uma imagem</AppText>
            </Pressable>
          ) : (
            <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" accessibilityLabel="Imagem escolhida" />
          )
        ) : (
          <>
            {text.length === 0 && (
              <View pointerEvents="none" style={styles.hint}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              </View>
            )}
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder={PLACEHOLDER[kind]}
              placeholderTextColor={colors.muted}
              textAlign={text.length === 0 ? 'center' : 'left'}
              textAlignVertical={text.length === 0 ? 'center' : 'top'}
              autoCapitalize="none"
              keyboardType={kind === 'link' ? 'url' : 'default'}
              accessibilityLabel={kind === 'link' ? 'Link para analisar' : 'Mensagem para analisar'}
              style={styles.input}
            />
          </>
        )}
      </View>

      <Button title="Ou envie um arquivo da galeria" variant="outline" leftIcon="attach" onPress={pickImage} style={styles.gallery} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.white, borderRadius: radius.lg, minHeight: 280, marginTop: 14, overflow: 'hidden' },
  input: { flex: 1, fontSize: 15, color: colors.text, padding: 18, minHeight: 280 },
  hint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 60, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 8 },
  preview: { width: '100%', height: 280 },
  gallery: { marginTop: 14, minHeight: 44 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: { fontSize: 11 },
});
