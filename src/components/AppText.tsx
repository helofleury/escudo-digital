import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontSize: 32, fontWeight: '900', lineHeight: 38 },
  title: { fontSize: 24, fontWeight: '900', lineHeight: 30 },
  heading: { fontSize: 17, fontWeight: '800', lineHeight: 23 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  label: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
};

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

export function AppText({ variant = 'body', color = colors.text, style, ...rest }: Props): React.JSX.Element {
  const { fontScale } = useSettings();
  const base = VARIANTS[variant];
  const scaled: TextStyle = {
    ...base,
    fontSize: (base.fontSize ?? 15) * fontScale,
    lineHeight: (base.lineHeight ?? 21) * fontScale,
    color,
  };
  const merged: StyleProp<TextStyle> = [scaled, style];
  return <Text {...rest} style={merged} />;
}
