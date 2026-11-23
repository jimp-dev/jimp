/**
 * The "Jimp ink" syntax theme used by Expressive Code: a dark indigo card with
 * candy-colored tokens. Code blocks use it in both the light and dark themes.
 */
export const jimpInkTheme = {
  name: "jimp-ink",
  type: "dark",
  colors: {
    "editor.background": "#1d1846",
    "editor.foreground": "#f2efff",
    "editor.selectionBackground": "#3a3280",
    "editorLineNumber.foreground": "#6f66b0",
    "editorGroupHeader.tabsBackground": "#2b2466",
    "tab.activeBackground": "#2b2466",
    "tab.activeForeground": "#f2efff",
    "titleBar.activeBackground": "#2b2466",
    "titleBar.activeForeground": "#cfc8ff",
    "terminal.background": "#1d1846",
    "terminal.foreground": "#f2efff",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#a59cd8", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "variable.language",
        "constant.language",
        "entity.name.tag",
      ],
      settings: { foreground: "#ff8fca" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
      settings: { foreground: "#ffe36b" },
    },
    {
      scope: ["constant.numeric", "constant.other", "support.constant"],
      settings: { foreground: "#7ff5c9" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
        "variable.function",
      ],
      settings: { foreground: "#8fd0ff" },
    },
    {
      scope: [
        "variable.other.property",
        "support.variable.property",
        "meta.object-literal.key",
        "variable.other.object.property",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "#ffb38a" },
    },
    {
      scope: ["entity.name.type", "support.type", "support.class", "entity.name.class"],
      settings: { foreground: "#7ff5c9" },
    },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator"],
      settings: { foreground: "#c9c3ff" },
    },
    {
      scope: ["variable", "variable.other"],
      settings: { foreground: "#f2efff" },
    },
  ],
};
