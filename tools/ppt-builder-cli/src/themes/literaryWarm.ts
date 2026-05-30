export interface ThemeTokens {
  fontFace: string;
  bg: string;
  paper: string;
  ink: string;
  brown: string;
  deep: string;
  muted: string;
  warm: string;
  cold: string;
  line: string;
  red: string;
  white: string;
  blue?: string;
  green?: string;
  yellow?: string;
}

export function literaryWarm(fontFace = "PingFang SC"): ThemeTokens {
  return {
    fontFace,
    bg: "F6F0E6",
    paper: "F7F0E3",
    ink: "241F1A",
    brown: "7A4C31",
    deep: "493728",
    muted: "76695C",
    warm: "EBD4AF",
    cold: "DCE4E1",
    line: "BBA78B",
    red: "9B4D3D",
    white: "FFFCF6",
  };
}

export function teachingToolkit(fontFace = "PingFang SC"): ThemeTokens {
  return {
    fontFace,
    bg: "F7FAFC",
    paper: "FFFFFF",
    ink: "172033",
    brown: "3B5CCC",
    deep: "111827",
    muted: "657083",
    warm: "EAF1FF",
    cold: "E8F7F1",
    line: "D8E0EA",
    red: "E0564A",
    white: "FFFFFF",
    blue: "2563EB",
    green: "16A36B",
    yellow: "F6B73C",
  };
}

export function aiProductSwiss(fontFace = "PingFang SC"): ThemeTokens {
  return {
    fontFace,
    bg: "F8FAFC",
    paper: "FFFFFF",
    ink: "0B1020",
    brown: "2454FF",
    deep: "050816",
    muted: "5B6577",
    warm: "E8EEFF",
    cold: "EEF7FF",
    line: "D6DEEA",
    red: "FF5A3D",
    white: "FFFFFF",
    blue: "2454FF",
    green: "00A878",
    yellow: "FFD23F",
  };
}

export function swissMinimal(fontFace = "PingFang SC"): ThemeTokens {
  return {
    fontFace,
    bg: "FAFAF8",
    paper: "FFFFFF",
    ink: "0A0A0A",
    brown: "002FA7",
    deep: "0A0A0A",
    muted: "737373",
    warm: "F0F0EE",
    cold: "F7F8FA",
    line: "D4D4D2",
    red: "D72638",
    white: "FFFFFF",
    blue: "002FA7",
    green: "008F5A",
    yellow: "FFD500",
  };
}

export function guizangSwiss(fontFace = "PingFang SC"): ThemeTokens {
  return {
    fontFace,
    bg: "FAFAF8",
    paper: "FAFAF8",
    ink: "0A0A0A",
    brown: "002FA7",
    deep: "0A0A0A",
    muted: "737373",
    warm: "F0F0EE",
    cold: "F6F6F4",
    line: "D4D4D2",
    red: "FF6B35",
    white: "FFFFFF",
    blue: "002FA7",
    green: "C5E803",
    yellow: "FFD500",
  };
}

export function automotiveDeepBlue(fontFace = "PingFang SC"): ThemeTokens {
  return {
    fontFace,
    bg: "07111F",
    paper: "0D1A2E",
    ink: "F6F8FC",
    brown: "C6A15B",
    deep: "020814",
    muted: "A8B4C8",
    warm: "142642",
    cold: "0B2038",
    line: "2A4264",
    red: "D94C3A",
    white: "FFFFFF",
    blue: "5DA8FF",
    green: "74D3AE",
    yellow: "D8B86A",
  };
}
