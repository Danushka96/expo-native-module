import { NativeModule, requireNativeModule } from "expo";

export type PrintResult = void;

declare class ExpoR330PrinterModule extends NativeModule {
  bind: () => Promise<void>;
  unbind: () => Promise<void>;
  printText: (text: string) => Promise<void>;
  printEpsonBase64: (base64: string) => Promise<void>;
  printBitmapBase64: (base64: string) => Promise<void>;
  printBarCode: (
    data: string,
    symbology: number,
    height: number,
    width: number,
  ) => Promise<void>;
  printQRCode: (
    data: string,
    modulesize: number,
    errorlevel: number,
  ) => Promise<void>;
  setAlignment: (alignment: number) => Promise<void>;
  setTextSize: (size: number) => Promise<void>;
  nextLine: (lines: number) => Promise<void>;
  setTextBold: (bold: boolean) => Promise<void>;
  printTableText: (
    text: string[],
    weight: number[],
    alignment: number[],
  ) => Promise<void>;
}

export default requireNativeModule<ExpoR330PrinterModule>("ExpoR330Printer");
