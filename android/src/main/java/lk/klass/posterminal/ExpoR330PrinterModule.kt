package lk.klass.posterminal

import android.content.Context
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

// Note: runBlocking is used here for compatibility with various expo-modules-core versions.
// If you prefer non-blocking exports, add kotlinx-coroutines dependency and expose suspend functions directly.

class ExpoR330PrinterModule : Module() {

  // lazy init; not created until first use
  private lateinit var manager: PrinterServiceManager

  private fun ensureManager() {
    if (!::manager.isInitialized) {
      // reactContext may be null in some rare host setups; using !! to fail early if null
      manager = PrinterServiceManager(appContext.reactContext!!)
    }
  }

  // helper that wraps PrinterServiceManager callback-style methods into a blocking call
  private fun awaitAction(block: (cb: (Throwable?) -> Unit) -> Unit) {
    runBlocking {
      suspendCancellableCoroutine<Unit> { cont ->
        try {
          block { err: Throwable? ->
            if (err == null) cont.resume(Unit)
            else cont.resumeWithException(err)
          }
        } catch (t: Throwable) {
          cont.resumeWithException(t)
        }
      }
    }
  }

  // convenience wrappers mapping manager functions
  private fun PrinterServiceManager.awaitPrintText(text: String) =
    awaitAction { cb -> this.printText(text, cb) }

  private fun PrinterServiceManager.awaitPrintEpsonFromBase64(base64: String) =
    awaitAction { cb -> this.printEpsonFromBase64(base64, cb) }

  private fun PrinterServiceManager.awaitPrintBitmapFromBase64(base64: String) =
    awaitAction { cb -> this.printBitmapFromBase64(base64, cb) }

  private fun PrinterServiceManager.awaitPrintBarCode(data: String, symbology: Int, height: Int, width: Int) =
    awaitAction { cb -> this.printBarCode(data, symbology, height, width, cb) }

  private fun PrinterServiceManager.awaitPrintQRCode(data: String, modulesize: Int, errorlevel: Int) =
    awaitAction { cb -> this.printQRCode(data, modulesize, errorlevel, cb) }

  private fun PrinterServiceManager.awaitSetAlignment(alignment: Int) =
    awaitAction { cb -> this.setAlignment(alignment, cb) }

  private fun PrinterServiceManager.awaitSetTextSize(size: Float) =
    awaitAction { cb -> this.setTextSize(size, cb) }

  private fun PrinterServiceManager.awaitNextLine(lines: Int) =
    awaitAction { cb -> this.nextLine(lines, cb) }

  private fun PrinterServiceManager.awaitSetTextBold(bold: Boolean) =
    awaitAction { cb -> this.setTextBold(bold, cb) }

  private fun PrinterServiceManager.awaitPrintTableText(text: Array<String>, weight: IntArray, alignment: IntArray) =
    awaitAction { cb -> this.printTableText(text, weight, alignment, cb) }

  override fun definition() = ModuleDefinition {
    Name("ExpoR330Printer")

    // bind / unbind are synchronous here (fast)
    Function("bind") {
      ensureManager()
      manager.bindService()
      null
    }

    Function("unbind") {
      if (::manager.isInitialized) manager.unbindService()
      null
    }

    // printing and other operations are exposed without Promise parameter.
    // Exceptions thrown here will be converted to rejected Promises on JS side.
    Function("printText") { text: String ->
      ensureManager()
      manager.awaitPrintText(text)
      null
    }

    Function("printEpsonBase64") { base64: String ->
      ensureManager()
      manager.awaitPrintEpsonFromBase64(base64)
      null
    }

    Function("printBitmapBase64") { base64: String ->
      ensureManager()
      manager.awaitPrintBitmapFromBase64(base64)
      null
    }

    Function("printBarCode") { data: String, symbology: Int, height: Int, width: Int ->
      ensureManager()
      manager.awaitPrintBarCode(data, symbology, height, width)
      null
    }

    Function("printQRCode") { data: String, modulesize: Int, errorlevel: Int ->
      ensureManager()
      manager.awaitPrintQRCode(data, modulesize, errorlevel)
      null
    }

    Function("setAlignment") { alignment: Int ->
      ensureManager()
      manager.awaitSetAlignment(alignment)
      null
    }

    Function("setTextSize") { size: Double -> // JS numbers come as Double
      ensureManager()
      manager.awaitSetTextSize(size.toFloat())
      null
    }

    Function("nextLine") { lines: Int ->
      ensureManager()
      manager.awaitNextLine(lines)
      null
    }

    Function("setTextBold") { bold: Boolean ->
      ensureManager()
      manager.awaitSetTextBold(bold)
      null
    }

    Function("printTableText") { text: Array<String>, weight: IntArray, alignment: IntArray ->
      ensureManager()
      manager.awaitPrintTableText(text, weight, alignment)
      null
    }
  }

  companion object {
    private const val TAG = "ExpoR330PrinterModule"
  }
}
