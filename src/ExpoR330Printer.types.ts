export type Theme = "light" | "dark" | "system";

export type ThemeChangeEvent = {
  theme: Theme;
};

export type ExpoR330PrinterModuleEvents = {
  onChangeTheme: (params: ThemeChangeEvent) => void;
};
