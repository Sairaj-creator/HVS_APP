export const COLORS = {
  // Primary Palette (Cool Blues/Teals)
  primary: '#0D47A1', // Deep Blue
  primaryLight: '#5472d3',
  primaryDark: '#002171',
  secondary: '#00796B', // Teal Accent

  // Neutrals (Softer Grays)
  white: '#FFFFFF',
  black: '#000000',
  text: '#333333', // Dark Gray for text
  gray: '#888888', // Medium Gray
  lightGray: '#E0E0E0', // Lighter Gray <<<--- ERROR IS ABOUT THIS
  background: '#F5F5F5', // Off-white background

  // Status & Alerts
  success: '#4CAF50', // Green
  warning: '#FFC107', // Amber/Yellow
  error: '#F44336', // Red
  info: '#2196F3', // Bright Blue
  blue: '#2196F3', // Added for consistency
  orange: '#FF9800', // Added for consistency
  lightRed: '#FFCDD2', // Added for consistency
  darkGreen: '#388E3C', // Added for consistency
  lightGreen: '#C8E6C9', // Added for consistency
  red: '#F44336', // Ensure red is defined if used

  // Specific UI Elements
  tabIconDefault: '#bdbdbd',
  tabIconSelected: '#0D47A1', // Match primary
  statusBar: '#002171', // Darker primary for status bar

  // Gradients (Example)
  gradientPrimaryStart: '#1E88E5',
  gradientPrimaryEnd: '#0D47A1',
};

// Optional AppColors definition (Ensure components use COLORS directly or this consistently)
export const AppColors = {
  screenBackground: COLORS.background,
  cardBackground: COLORS.white,
  buttonBackground: COLORS.primary,
  buttonText: COLORS.white,
  textPrimary: COLORS.text,
  textSecondary: COLORS.gray,
  textHeader: COLORS.primary,
};

