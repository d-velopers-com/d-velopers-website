/**
 * UI Constants for consistent styling across the application
 */

// Spacing system
export const spacing = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

// Transitions
export const transitions = {
  base: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
} as const;

// Shadow system
export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  // Hover shadows
  hoverMd: "hover:shadow-md",
  hoverLg: "hover:shadow-lg",
  hoverXl: "hover:shadow-xl",
  // Card shadows (default)
  card: "shadow-md",
  cardHover: "hover:shadow-lg",
  // Avatar shadows
  avatar: "shadow-xl",
  avatarSmall: "shadow-sm",
  // Button shadows
  button: "shadow-md",
  buttonHover: "hover:shadow-lg",
} as const;

// Blur effects
export const blur = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  // Navbar blur
  navbar: "backdrop-blur-md",
} as const;

// Unified color system
export const colors = {
  // Text colors
  text: {
    primary: "text-foreground",
    secondary: "text-default-600",
    tertiary: "text-default-500",
    muted: "text-default-400",
    disabled: "text-default-400 opacity-50",
  },
  // Background colors
  bg: {
    primary: "bg-background",
    secondary: "bg-default-50",
    tertiary: "bg-default-100",
    muted: "bg-default-50/30 dark:bg-default-100/10",
  },
  // Border colors
  border: {
    default: "border-default-200 dark:border-default-100",
    light: "border-default-200/50",
    muted: "border-default-200/30",
  },
} as const;

// Color opacity system (consistent opacity values)
export const colorOpacity = {
  // Background opacities
  bg10: "/10",
  bg20: "/20",
  bg30: "/30",
  bg50: "/50",
  bg70: "/70",
  bg80: "/80",
  bg90: "/90",
  // Text opacities
  text40: "text-default-400",
  text500: "text-default-500",
  text600: "text-default-600",
  text700: "text-default-700",
  // Foreground opacities
  fg70: "text-foreground/70",
  fg80: "text-foreground/80",
  fg90: "text-foreground/90",
  // Border opacities
  border50: "border-default-200/50",
  border100: "border-default-200",
} as const;

// Border radius system with inner radius calculation
// Formula: inner radius = outer radius - outer thickness/2
// Tailwind radius values: sm=2px, md=6px, lg=8px, xl=12px, 2xl=16px, 3xl=24px
export const borderRadius = {
  // Outer radius (for elements without borders or for the border itself)
  outer: {
    none: "rounded-none",
    sm: "rounded-sm", // 2px
    md: "rounded-md", // 6px
    lg: "rounded-lg", // 8px
    xl: "rounded-xl", // 12px
    "2xl": "rounded-2xl", // 16px
    "3xl": "rounded-3xl", // 24px
    full: "rounded-full",
  },
  // Inner radius (for content inside elements with borders)
  // border-1 (1px): inner = outer - 0.5px
  innerBorder1: {
    sm: "rounded-[1.5px]", // 2 - 0.5 = 1.5px
    md: "rounded-[5.5px]", // 6 - 0.5 = 5.5px
    lg: "rounded-[7.5px]", // 8 - 0.5 = 7.5px
    xl: "rounded-[11.5px]", // 12 - 0.5 = 11.5px
    "2xl": "rounded-[15.5px]", // 16 - 0.5 = 15.5px
    "3xl": "rounded-[23.5px]", // 24 - 0.5 = 23.5px
  },
  // border-2 (2px): inner = outer - 1px
  innerBorder2: {
    sm: "rounded-[1px]", // 2 - 1 = 1px
    md: "rounded-[5px]", // 6 - 1 = 5px
    lg: "rounded-[7px]", // 8 - 1 = 7px
    xl: "rounded-[11px]", // 12 - 1 = 11px
    "2xl": "rounded-[15px]", // 16 - 1 = 15px
    "3xl": "rounded-[23px]", // 24 - 1 = 23px
  },
  // border-4 (4px): inner = outer - 2px
  innerBorder4: {
    sm: "rounded-none", // 2 - 2 = 0px
    md: "rounded-[4px]", // 6 - 2 = 4px
    lg: "rounded-[6px]", // 8 - 2 = 6px
    xl: "rounded-[10px]", // 12 - 2 = 10px
    "2xl": "rounded-[14px]", // 16 - 2 = 14px
    "3xl": "rounded-[22px]", // 24 - 2 = 22px
  },
} as const;

// Helper function to get inner radius based on outer radius and border width
// Usage: getInnerRadius(outerRadius, borderWidth)
export const getInnerRadius = (
  outer: keyof typeof borderRadius.outer,
  borderWidth: 1 | 2 | 4,
): string => {
  if (borderWidth === 1) {
    return (
      borderRadius.innerBorder1[
        outer as keyof typeof borderRadius.innerBorder1
      ] || borderRadius.outer[outer]
    );
  }
  if (borderWidth === 2) {
    return (
      borderRadius.innerBorder2[
        outer as keyof typeof borderRadius.innerBorder2
      ] || borderRadius.outer[outer]
    );
  }
  if (borderWidth === 4) {
    return (
      borderRadius.innerBorder4[
        outer as keyof typeof borderRadius.innerBorder4
      ] || borderRadius.outer[outer]
    );
  }
  return borderRadius.outer[outer];
};

// Card styles
// Cards use border-1, so inner content should use innerBorder1
export const cardStyles = {
  base: `${shadows.card} ${shadows.cardHover} ${transitions.base} ${colors.border.default} ${borderRadius.outer.lg} border`,
  hover: `${transitions.base} hover:scale-[1.02] ${shadows.hoverMd}`,
  elevated: `${shadows.lg} ${shadows.hoverXl} ${transitions.base} ${colors.border.default} ${borderRadius.outer.lg} border`,
  // Inner content radius for cards with border-1
  inner: borderRadius.innerBorder1.lg, // rounded-[7.5px] for content inside cards
} as const;

// Typography system
export const typography = {
  // Headings
  h1: "text-3xl sm:text-4xl font-bold",
  h2: "text-2xl sm:text-3xl font-bold",
  h3: "text-xl sm:text-2xl font-semibold",
  h4: "text-lg sm:text-xl font-semibold",
  // Body text
  body: "text-sm text-default-600",
  bodyLarge: "text-base text-default-600",
  bodyXl: "text-lg text-default-600",
  // Labels and form elements
  label: "text-sm font-semibold",
  labelSmall: "text-xs font-semibold",
  // Captions and helper text
  caption: "text-xs text-default-500",
  captionMuted: "text-xs text-default-400",
  // Button text
  button: "text-base font-semibold",
  buttonSm: "text-sm font-medium",
  buttonLg: "text-lg font-bold",
  // Input text
  input: "text-sm",
  inputSmall: "text-xs",
} as const;

// Icon sizes
export const iconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
} as const;

// State colors
// State colors use border (1px), so inner content should use innerBorder1
export const stateColors = {
  success: {
    bg: "bg-success/10",
    border: "border-success/20",
    text: "text-success",
    full: `bg-success/10 border border-success/20 text-success ${borderRadius.outer.lg}`,
    inner: borderRadius.innerBorder1.lg, // For content inside state color boxes
  },
  danger: {
    bg: "bg-danger/10",
    border: "border-danger/20",
    text: "text-danger",
    full: `bg-danger/10 border border-danger/20 text-danger ${borderRadius.outer.lg}`,
    inner: borderRadius.innerBorder1.lg,
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    text: "text-warning",
    full: `bg-warning/10 border border-warning/20 text-warning ${borderRadius.outer.lg}`,
    inner: borderRadius.innerBorder1.lg,
  },
  info: {
    bg: "bg-info/10",
    border: "border-info/20",
    text: "text-info",
    full: `bg-info/10 border border-info/20 text-info ${borderRadius.outer.lg}`,
    inner: borderRadius.innerBorder1.lg,
  },
} as const;

// Chip styles
// HeroUI chips use rounded-full by default for all variants
// For chips with borders (variant="bordered" or "solid" with border),
// we need to apply the inner radius rule if they have content inside
// HeroUI chips typically use border-1 (1px) when they have borders
// Since rounded-full is effectively infinite (9999px), inner radius = outer radius
// But if we override to use rounded-md (6px), then inner = 6 - 0.5 = 5.5px
export const chipStyles = {
  base: "text-xs",
  // Default classNames (for flat variant primarily)
  classNames: {
    base: "bg-primary-100 dark:!bg-[#111111]",
    content: "text-primary-800 dark:!text-[#00C8FF] font-semibold",
  },
  // For chips with borders that use rounded-md instead of rounded-full
  // If a chip has border-1 and rounded-md (6px), inner content should use rounded-[5.5px]
  bordered: {
    classNames: {
      base: `${borderRadius.outer.md} border`, // Outer radius for chip container
      content: borderRadius.innerBorder1.md, // Inner radius for content (border-1)
    },
  },
} as const;

// Focus states
export const focusStates = {
  base: "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
  button:
    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
} as const;

// Avatar styles
export const avatarStyles = {
  ring: "ring-2 ring-primary/20",
  ringLarge: "ring-4 ring-primary/10",
  shadow: shadows.avatar,
  shadowSmall: shadows.avatarSmall,
} as const;

// Gradients
export const gradients = {
  primary: "bg-gradient-to-r from-primary-500 to-info-500",
  background:
    "bg-gradient-to-b from-background to-default-50/30 dark:to-default-100/10",
} as const;
