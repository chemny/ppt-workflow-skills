export interface ThemeTokenSet {
  themeId: string;
  font: {
    body: string;
    latin?: string;
    mono?: string;
  };
  color: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    line: string;
    accent: string;
    accentOn: string;
    success?: string;
    warning?: string;
    danger?: string;
  };
  typography: {
    coverTitle: TextToken;
    sectionTitle: TextToken;
    slideTitle: TextToken;
    subtitle: TextToken;
    body: TextToken;
    cardTitle: TextToken;
    cardBody: TextToken;
    caption: TextToken;
    number: TextToken;
    badge: TextToken;
  };
  spacing: {
    pageX: number;
    pageTop: number;
    titleToSubtitle: number;
    subtitleToContent: number;
    blockGap: number;
    cardGap: number;
    sectionGap: number;
  };
  shape: {
    radius: number;
    lineWidth: number;
    hairlineWidth: number;
  };
  image: {
    defaultFit: "cover" | "contain";
    neverStretch: boolean;
    captionRequired: boolean;
  };
  motion: {
    manualAdvance: boolean;
    defaultTransition: "none" | "fade" | "push" | "wipe";
  };
}

export interface TextToken {
  size: number;
  weight: number;
  lineHeight: number;
}
