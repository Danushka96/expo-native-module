import { NativeModule, requireNativeModule } from "expo";

import { ExpoR330PrinterModuleEvents, Theme } from "./ExpoR330Printer.types";

declare class ExpoR330PrinterModule extends NativeModule<ExpoR330PrinterModuleEvents> {
  setTheme: (theme: Theme) => void;
  getTheme: () => Theme;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoR330PrinterModule>("ExpoR330Printer");
