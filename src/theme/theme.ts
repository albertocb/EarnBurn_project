export const colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceHighlight: '#2C2C2C',
  primary: '#D4FF00', // Neon Volt
  secondary: '#00E5FF', // Electric Blue
  accent: '#00FF85', // Vibrant Green for alerts/active states
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textDim: '#52525B',
  border: '#3F3F46',
  success: '#00FF99',
  error: '#FF4444',
  warning: '#FFC107', // Amber
  warningBg: 'rgba(255, 193, 7, 0.1)',
  dim: '#3F3F46', // Muted Gray
  overlay: 'rgba(0,0,0,0.7)',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 24, fontWeight: '600' as const, color: colors.text },
  h3: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.textSecondary },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textDim },
  button: { fontSize: 16, fontWeight: '700' as const, color: colors.background, textTransform: 'uppercase' as const }, // Primary button text
};

