import ExpoR330PrinterModule from "./ExpoR330PrinterModule";
import {Theme, ThemeChangeEvent} from "./ExpoR330Printer.types";
import { EventSubscription } from 'expo-modules-core';

export function addThemeListener(listener: (event: ThemeChangeEvent) => void): EventSubscription {
  return ExpoR330PrinterModule.addListener('onChangeTheme', listener);
}

export function getTheme(): Theme {
  return ExpoR330PrinterModule.getTheme();
}

export function setTheme(theme: Theme): void {
  return ExpoR330PrinterModule.setTheme(theme);
}