import * as React from 'react';

import { ExpoR330PrinterViewProps } from './ExpoR330Printer.types';

export default function ExpoR330PrinterView(props: ExpoR330PrinterViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
