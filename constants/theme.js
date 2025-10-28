import { Dimensions } from 'react-native';
// Re-import COLORS here to re-export it alongside others
import { COLORS } from './colors';

const { width, height } = Dimensions.get('window');

// SIZES remains the same
export const SIZES = {
  base: 8,
  font: 14,
  radius: 8,
  padding: 16,
  paddingLarge: 24,
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 14,
  body1: 28,
  body2: 22,
  body3: 16,
  body4: 14,
  small: 12,
  width,
  height,
};

// FONTS remains the same (using default fontWeight)
export const FONTS = {
  h1: { fontSize: SIZES.h1, lineHeight: 36, fontWeight: 'bold' },
  h2: { fontSize: SIZES.h2, lineHeight: 30, fontWeight: 'bold' },
  h3: { fontSize: SIZES.h3, lineHeight: 24, fontWeight: '600' },
  h4: { fontSize: SIZES.h4, lineHeight: 22, fontWeight: '600' },
  body1: { fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontSize: SIZES.body3, lineHeight: 24 },
  body4: { fontSize: SIZES.body4, lineHeight: 22 },
  small: { fontSize: SIZES.small, lineHeight: 18 },
};

// SHADOWS remains the same
export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
};

// Re-export COLORS alongside SIZES, FONTS, SHADOWS
// This allows importing all from './theme'
export { COLORS };

// REMOVE the bundled appTheme export
// const appTheme = { COLORS, SIZES, FONTS, SHADOWS };
// export default appTheme;

