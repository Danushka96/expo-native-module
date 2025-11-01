// App.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
} from "react-native";
import ExpoR330Printer from "expo-r330-printer"; // requireNativeModule default export

// small transparent 1x1 PNG base64 (placeholder). Replace with your real base64 image or use an image picker.
const SAMPLE_PNG_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [textToPrint, setTextToPrint] = useState("Hello from Expo!");
  const [barcodeData, setBarcodeData] = useState("1234567890");
  const [qrData, setQrData] = useState("https://example.com");
  const [alignment, setAlignment] = useState<number>(0); // 0 left,1 center,2 right
  const [textSize, setTextSize] = useState<number>(24);
  const [bold, setBold] = useState<boolean>(false);
  const [tableJson, setTableJson] = useState<string>(
    JSON.stringify(
      [
        ["Item A", "1", "10.00"],
        ["Item B", "2", "20.00"],
      ],
      null,
      2
    )
  );

  useEffect(() => {
    // optional: auto-bind on mount
    appendLog("App mounted — not bound to service");
    return () => {
      // best-effort unbind
      try {
        // @ts-ignore
        ExpoR330Printer.unbind?.();
        appendLog("unbind called on unmount");
      } catch (e) {
        console.error(e);
        // ignore
      }
    };
  }, []);

  const appendLog = (m: string) => {
    setLog((prev) => [new Date().toLocaleTimeString() + " " + m, ...prev].slice(0, 200));
  };

  const safeCall = async (fn: () => Promise<any> | any, successMsg?: string) => {
    try {
      const res = await fn();
      if (successMsg) appendLog(successMsg);
      return res;
    } catch (e: any) {
      const msg = (e && e.message) || String(e);
      appendLog("ERROR: " + msg);
      console.error(msg);
      Alert.alert("Error", msg);
      throw e;
    }
  };

  const handleBind = async () => {
    await safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.bind();
      setConnected(true);
    }, "bind(): success");
  };

  const handleUnbind = async () => {
    await safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.unbind();
      setConnected(false);
    }, "unbind(): success");
  };

  const handlePrintText = async () =>
    safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.printText(textToPrint + "\n");
    }, `printText: "${textToPrint}"`);

  const handlePrintEpson = async () =>
    safeCall(async () => {
      // vendor takes raw bytes; here we send base64 (module expects base64 in our wrapper)
      const base64 = SAMPLE_PNG_BASE64.split(",")[1];
      // @ts-ignore
      await ExpoR330Printer.printEpsonBase64(base64);
    }, "printEpsonBase64 called");

  const handlePrintBitmap = async () =>
    safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.printBitmapBase64(SAMPLE_PNG_BASE64);
    }, "printBitmapBase64 called");

  const handlePrintBarcode = async () =>
    safeCall(async () => {
      // symbology/sample values depend on vendor; using 6, height 162, width 2 as in example
      // @ts-ignore
      await ExpoR330Printer.printBarCode(barcodeData, 6, 162, 2);
    }, `printBarCode: ${barcodeData}`);

  const handlePrintQR = async () =>
    safeCall(async () => {
      // modulesize, errorlevel (example values)
      // @ts-ignore
      await ExpoR330Printer.printQRCode(qrData, 4, 3);
    }, `printQRCode: ${qrData}`);

  const handleSetAlignment = async (a: number) =>
    safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.setAlignment(a);
      setAlignment(a);
    }, `setAlignment: ${a}`);

  const handleSetTextSize = async (size: number) =>
    safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.setTextSize(size);
      setTextSize(size);
    }, `setTextSize: ${size}`);

  const handleNextLine = async (n = 1) =>
    safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.nextLine(n);
    }, `nextLine(${n})`);

  const handleSetBold = async (b: boolean) =>
    safeCall(async () => {
      // @ts-ignore
      await ExpoR330Printer.setTextBold(b);
      setBold(b);
    }, `setTextBold: ${b}`);

  const handlePrintTable = async () =>
    safeCall(async () => {
      // parse table JSON (very simple). Convert rows to text[], weight[], alignment[].
      let parsed: string[][] = [];
      try {
        parsed = JSON.parse(tableJson);
        if (!Array.isArray(parsed)) throw new Error("Table must be an array of rows");
      } catch (e) {
        throw new Error("Invalid table JSON: " + String(e));
      }
      const cols = parsed[0]?.length ?? 0;
      // flatten each row into a string array for the native call; we call printTableText row-by-row
      for (const row of parsed) {
        const textArr = row.map(String);
        const weight = new Array(textArr.length).fill(1);
        const align = new Array(textArr.length).fill(1);
        // @ts-ignore
        await ExpoR330Printer.printTableText(textArr, weight, align);
      }
    }, `printTableText called (${new Date().toLocaleTimeString()})`);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Expo R330 Printer Test</Text>

        <View style={styles.row}>
          <Button title="Bind Service" onPress={handleBind} />
          <View style={styles.spacer} />
          <Button title="Unbind" onPress={handleUnbind} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Connected: {connected ? "yes" : "no"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Print Text</Text>
          <TextInput
            style={styles.input}
            value={textToPrint}
            onChangeText={setTextToPrint}
            multiline
          />
          <Button title="Print Text" onPress={handlePrintText} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Print Bitmap (sample)</Text>
          <Button title="Print Sample Bitmap (base64)" onPress={handlePrintBitmap} />
          <View style={{ height: 8 }} />
          <Button title="Print Raw Epson (sample)" onPress={handlePrintEpson} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Barcode</Text>
          <TextInput style={styles.input} value={barcodeData} onChangeText={setBarcodeData} />
          <Button title="Print Barcode" onPress={handlePrintBarcode} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>QR</Text>
          <TextInput style={styles.input} value={qrData} onChangeText={setQrData} />
          <Button title="Print QR" onPress={handlePrintQR} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Alignment</Text>
          <View style={styles.row}>
            <Button title="Left" onPress={() => handleSetAlignment(0)} />
            <View style={styles.spacer} />
            <Button title="Center" onPress={() => handleSetAlignment(1)} />
            <View style={styles.spacer} />
            <Button title="Right" onPress={() => handleSetAlignment(2)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Text Size: {textSize}</Text>
          <View style={styles.row}>
            <Button title="Smaller" onPress={() => handleSetTextSize(Math.max(8, textSize - 2))} />
            <View style={styles.spacer} />
            <Button title="Bigger" onPress={() => handleSetTextSize(textSize + 2)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bold</Text>
          <View style={styles.row}>
            <Text>Bold</Text>
            <Switch value={bold} onValueChange={(v) => handleSetBold(v)} />
            <View style={styles.spacer} />
            <Button title="Next Line" onPress={() => handleNextLine(1)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Print Table (JSON rows)</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={tableJson}
            onChangeText={setTableJson}
            multiline
          />
          <Button title="Print Table" onPress={handlePrintTable} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Logs</Text>
          <View style={styles.logBox}>
            {log.length === 0 && <Text style={{ color: "#666" }}>no logs yet</Text>}
            {log.map((l, i) => (
              <Text key={i} style={styles.logText}>
                {l}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  spacer: { width: 12 },
  section: { marginTop: 12, paddingVertical: 8 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  logBox: {
    minHeight: 80,
    maxHeight: 240,
    padding: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#11111105",
  },
  logText: { fontSize: 12, color: "#222", marginBottom: 6 },
});
