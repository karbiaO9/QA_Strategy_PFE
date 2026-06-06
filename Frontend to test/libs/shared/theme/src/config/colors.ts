// CSS variables for colors that can be used across the application
const baseColors = {
  black: {
    DEFAULT: 'hsl(0, 0%, 0%)', // #000000
    900: 'hsl(0, 0%, 0%)', // #000000
  },
  white: {
    DEFAULT: 'hsl(0, 0%, 100%)', // #FFFFFF
    900: 'hsl(0, 0%, 100%)', // #FFFFFF
  },
  gray: {
    100: 'hsl(0, 0%, 99%)', // #FCFCFC
    150: 'hsl(0, 0%, 97%)', // #F7F7F7
    200: 'hsl(0, 0%, 96%)', // #F5F5F5
    250: 'hsl(0, 0%, 95%)', // #F2F2F2
    300: 'hsl(0, 0%, 93%)', // #ECECEC
    350: 'hsl(0, 0%, 87%)', // #DDDDDD
    400: 'hsl(0, 0%, 80%)', // #CBCBCB
    450: 'hsl(0, 0%, 70%)', // #B3B3B3
    500: 'hsl(0, 0%, 67%)', // #ABABAB
    550: 'hsl(0, 0%, 42%)', // #6B6B6B
    600: 'hsl(0, 0%, 38%)', // #626262
    700: 'hsl(0, 0%, 33%)', // #535353
    750: 'hsl(0, 0%, 32%)', // #515151
    800: 'hsl(0, 0%, 30%)', // #4C4C4C
    850: 'hsl(0, 0%, 29%)', // #4B4B4B
    900: 'hsl(0, 0%, 27%)', // #444444
    950: 'hsl(0, 0%, 20%)', // #333333
  },
  neutral: {
    50: 'hsl(220, 9%, 87%)',  // #DADCE0
    100: 'hsl(168, 8%, 87%)', // #DCE1E0
    150: 'hsl(210, 5%, 85%)', // #D8DADC
    200: 'hsl(140, 3%, 77%)', // #C4C7C5
    250: 'hsl(213, 18%, 69%)',// #A1AEBE
    300: 'hsl(242, 12%, 67%)',// #A1A0B4
    400: 'hsl(228, 7%, 62%)', // #989AA5
    450: 'hsl(210, 1%, 62%)', // #9D9E9F
    500: 'hsl(227, 15%, 59%)',// #868DA6
    550: 'hsl(210, 4%, 52%)', // #80858A
    600: 'hsl(211, 18%, 48%)',// #64798F
    650: 'hsl(228, 16%, 44%)',// #5D6481
    700: 'hsl(212, 20%, 34%)',// #465668
    750: 'hsl(228, 4%, 26%)', // #414246
    800: 'hsl(213, 10%, 18%)',// #292D32
    850: 'hsl(211, 23%, 18%)',// #242E39
    900: 'hsl(227, 42%, 17%)',// #19213D
    950: 'hsl(180, 26%, 4%)', // #070C0C
  },
  primary: {
    DEFAULT: 'hsl(179, 100%, 37%)',// #00BEBB
    50: 'hsl(180, 47%, 97%)', // #F4FBFB
    100: 'hsl(175, 30%, 93%)',// #E7F2F1
    200: 'hsl(177, 56%, 92%)',// #DFF6F5
    300: 'hsl(179, 56%, 82%)',// #B9EBEA
    500: 'hsl(179, 82%, 44%)',// #14CBC8
    700: 'hsl(179, 88%, 38%)',// #0BB5B3
    900: 'hsl(179, 100%, 37%)',// #00BEBB
  },
  secondary: {
    DEFAULT: 'hsl(246, 64%, 56%)', // #5446D6
    50: 'hsl(251, 100%, 98%)', // #F6F4FF
    100: 'hsl(248, 64%, 91%)', // #DEDAF7
    200: 'hsl(245, 66%, 83%)', // #BBB6F0
    300: 'hsl(255, 100%, 76%)', // #A384FF
    400: 'hsl(247, 61%, 73%)', // #9A91E4
    500: 'hsl(247, 63%, 69%)', // #8A7EE2
    600: 'hsl(246, 60%, 64%)', // #786DDB
    700: 'hsl(266, 90%, 59%)', // #8A38F5
    800: 'hsl(246, 64%, 56%)', // #5446D6
    850: 'hsl(256, 73%, 55%)', // #6438E0
    900: 'hsl(256, 79%, 37%)', // #3A14A8
    950: 'hsl(256, 61%, 29%)', // #341D76
  },
  success: {
    50: 'hsl(150, 20%, 98%)',  // #F9FBFA
    100: 'hsl(148, 100%, 96%)',// #EDFFF5
    200: 'hsl(152, 55%, 94%)', // #E7F8F0
    300: 'hsl(147, 52%, 71%)', // #8FDCB2
    400: 'hsl(156, 45%, 53%)', // #53BD92
    600: 'hsl(136, 53%, 43%)', // #34A853
    700: 'hsl(151, 76%, 37%)', // #16A560
    900: 'hsl(147, 34%, 26%)', // #2C5A41
  },
  error: {
    DEFAULT: 'hsl(359, 100%, 61%)',// #FF383C
    50: 'hsl(0, 85%, 95%)',  // #FDE7E7
    100: 'hsl(0, 94%, 86%)', // #FDB7B7
    400: 'hsl(359, 100%, 61%)',// #FF383C
    500: 'hsl(5, 82%, 56%)', // #EB4335
    600: 'hsl(0, 100%, 50%)',// #FF0000
    700: 'hsl(0, 76%, 42%)', // #BE1A1A
    800: 'hsl(351, 63%, 41%)',// #AA273A
    900: 'hsl(358, 99%, 33%)',// #A60106
    950: 'hsl(0, 65%, 27%)', // #721818
  },
  info: {
    50: 'hsl(220, 100%, 99%)', // #F9FBFF
    100: 'hsl(195, 67%, 99%)', // #FAFDFE
    150: 'hsl(212, 100%, 98%)',// #F5FAFF
    200: 'hsl(220, 50%, 98%)', // #F6F8FC
    250: 'hsl(216, 63%, 97%)', // #F2F6FC
    300: 'hsl(210, 100%, 96%)',// #EDF6FF
    400: 'hsl(218, 38%, 94%)', // #EBEFF6
    500: 'hsl(217, 89%, 61%)', // #4285F4
    600: 'hsl(234, 73%, 55%)', // #3849E0
    700: 'hsl(227, 100%, 52%)',// #0C41FF
    750: 'hsl(204, 64%, 48%)', // #2D8BCA
    800: 'hsl(211, 100%, 43%)',// #006ADC
    850: 'hsl(205, 81%, 35%)', // #1165A1
    900: 'hsl(234, 71%, 25%)', // #131C6D
  },
  gold: {
    100: 'hsl(43, 73%, 64%)', // #E7C160
    300: 'hsl(50, 85%, 51%)', // #ECC91A
    500: 'hsl(45, 97%, 50%)', // #FBBC05
    700: 'hsl(47, 65%, 46%)', // #C3A229
    900: 'hsl(43, 85%, 22%)', // #684D08
  }
} as const;

// 2. Define Semantic shortcuts mapping to base colors
const semanticColors = {
  background: {
    DEFAULT: baseColors.white[900], // Maps to bg-background
    alt: baseColors.primary[100],    // Maps to bg-background-alt
  },
  foreground: {
    DEFAULT: baseColors.neutral[750], // Maps to text-foreground
    bold: baseColors.black[900], // Maps to text-foreground-bold
    muted: baseColors.gray[450], // Maps to text-foreground-muted
  },
  border: {
    DEFAULT: baseColors.neutral[100], // Maps to border (no suffix needed)
    subtle: baseColors.gray[150],   // Maps to border-subtle
  },
  divider: {
    DEFAULT: baseColors.gray[300], // Maps to divider (no suffix needed)
    subtle: baseColors.neutral[50],   // Maps to divider-subtle
  },
  input: {
    DEFAULT: baseColors.neutral[100], // Maps to input (no suffix needed)
    foreground: baseColors.gray[450],   // Maps to input-foreground
  },
  ring: {
    DEFAULT: baseColors.primary[900], // Maps to ring (no suffix needed)
  },
  popover: {
    DEFAULT: baseColors.white[900], // Maps to popover (no suffix needed)
    foreground: baseColors.neutral[750],   // Maps to popover-foreground
  },
  muted: {
    DEFAULT: baseColors.info[300], // Maps to text-muted
    foreground: baseColors.neutral[600], // Maps to text-muted-foreground
  },
  accent: {
    DEFAULT: baseColors.primary[900], // Maps to text-accent
    foreground: baseColors.white[900], // Maps to text-accent-foreground
  },
  destructive: {
    DEFAULT: baseColors.error[800], // Maps to text-destructive
    subtle: baseColors.error[50], // Maps to text-destructive-subtle
    accent: baseColors.error[500], // Maps to text-destructive-accent
  },
} as const;

// 3. Export them combined so Tailwind gets everything
export const colors = {
  ...baseColors,
  ...semanticColors,
} as const;

export const gradients = {
  1: 'linear-gradient(to right, hsl(156, 45%, 53%), hsl(183, 45%, 46%), hsl(204, 64%, 48%))',
  2: 'linear-gradient(to right, hsl(179, 100%, 37%), hsl(179, 88%, 38%))',
  3: 'linear-gradient(to right, hsl(179, 100%, 37%), hsl(246, 64%, 56%))',
  4: 'linear-gradient(to right, hsl(0, 0%, 100%), hsla(179, 100%, 37%, 0.43))', 
} as const;