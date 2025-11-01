import * as ExpoR330Printer from 'expo-r330-printer';
import {Button, Text, View} from 'react-native';
import {useEffect, useState} from "react";

export default function App() {
  const [theme, setTheme] = useState<string>(ExpoR330Printer.getTheme());

  useEffect(() => {
    const subscription = ExpoR330Printer.addThemeListener(({ theme: newTheme }) => {
      setTheme(newTheme);
    });

    return () => subscription.remove();
  }, [setTheme]);

  // Toggle between dark and light theme
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Theme: {ExpoR330Printer.getTheme()}</Text>
      <Button title={`Set theme to ${nextTheme}`} onPress={() => ExpoR330Printer.setTheme(nextTheme)} />
    </View>
  );
}

