import { NativeModule, requireNativeModule } from 'expo';

import { ExpoR330PrinterModuleEvents } from './ExpoR330Printer.types';

declare class ExpoR330PrinterModule extends NativeModule<ExpoR330PrinterModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoR330PrinterModule>('ExpoR330Printer');
