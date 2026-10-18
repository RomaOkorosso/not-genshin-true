/**
 * UI type roles.
 * Display/title stack is for short labels only (headlines, tabs, buttons).
 * Body stack is for any multi-line / descriptive copy — never use a pixel font there.
 */
export const UI_FONT_DISPLAY = 'Nunito, Verdana, Geneva, sans-serif';
export const UI_FONT_BODY = 'Nunito, Verdana, Geneva, sans-serif';

/** @deprecated Prefer UI_FONT_BODY or UI_FONT_DISPLAY explicitly. */
export const UI_FONT = UI_FONT_BODY;
/** @deprecated Prefer UI_FONT_DISPLAY. */
export const UI_FONT_TITLE = UI_FONT_DISPLAY;

/**
 * Almanac / wiki sizing in game pixels (design 720×1280, FIT-scaled).
 * Body ~17–20 game px ≈ readable 14–17 CSS px on ~390-wide mobile.
 */
export const ALMANAC_TYPE = {
  titlePx: 40,
  tabPx: 18,
  entryTitlePx: 24,
  bodyPx: 22,
  metaPx: 17,
  lineHeight: 1.45,
  blockGap: 28,
  titleToBodyGap: 8,
  bodyToMetaGap: 6,
  padXDesktop: 28,
  padXMobile: 20,
  maxColumnWidth: 460,
  /** ~80 game-px ≈ ≥44 CSS-px tap height when FIT-scaled to ~390-wide mobile. */
  tabMinHeight: 80,
} as const;
