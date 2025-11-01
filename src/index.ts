// Reexport the native module. On web, it will be resolved to ExpoR330PrinterModule.web.ts
// and on native platforms to ExpoR330PrinterModule.ts
export { default } from './ExpoR330PrinterModule';
export { default as ExpoR330PrinterView } from './ExpoR330PrinterView';
export * from  './ExpoR330Printer.types';
