import { registerWebModule, NativeModule } from 'expo';

import { ExpoR330PrinterModuleEvents } from './ExpoR330Printer.types';

class ExpoR330PrinterModule extends NativeModule<ExpoR330PrinterModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoR330PrinterModule, 'ExpoR330PrinterModule');
