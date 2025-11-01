import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoR330PrinterViewProps } from './ExpoR330Printer.types';

const NativeView: React.ComponentType<ExpoR330PrinterViewProps> =
  requireNativeView('ExpoR330Printer');

export default function ExpoR330PrinterView(props: ExpoR330PrinterViewProps) {
  return <NativeView {...props} />;
}
