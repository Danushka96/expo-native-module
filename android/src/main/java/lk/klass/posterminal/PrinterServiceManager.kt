package lk.klass.posterminal

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.IBinder
import android.util.Base64
import android.util.Log
import recieptservice.com.recieptservice.PrinterInterface
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class PrinterServiceManager(private val context: Context) {
  private val executor: ExecutorService = Executors.newSingleThreadExecutor()
  @Volatile private var printer: PrinterInterface? = null
  private var bound = false

  private val svcConn = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
      printer = PrinterInterface.Stub.asInterface(service)
      bound = true
      Log.i(TAG, "PrinterService connected")
    }

    override fun onServiceDisconnected(name: ComponentName?) {
      printer = null
      bound = false
      Log.i(TAG, "PrinterService disconnected")
    }
  }

  fun bindService() {
    if (bound) return
    val intent = Intent().apply {
      setClassName(
        "recieptservice.com.recieptservice",
        "recieptservice.com.recieptservice.service.PrinterService"
      )
    }
    context.bindService(intent, svcConn, Context.BIND_AUTO_CREATE)
  }

  fun unbindService() {
    if (!bound) return
    try {
      context.unbindService(svcConn)
    } catch (e: Exception) {
      Log.w(TAG, "unbindService failed: ${e.message}")
    } finally {
      bound = false
      printer = null
    }
  }

  private fun requirePrinter(): PrinterInterface {
    return printer ?: throw IllegalStateException("Printer not connected")
  }

  fun printText(text: String, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().printText(text)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun printEpsonFromBase64(base64: String, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        val bytes = Base64.decode(base64, Base64.DEFAULT)
        requirePrinter().printEpson(bytes)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun printBitmapFromBase64(base64Image: String, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        // If value is a data URI (data:image/png;base64,....), strip prefix.
        val cleaned = base64Image.substringAfter("base64,", base64Image).trim()

        if (cleaned.isEmpty()) {
          cb(IllegalArgumentException("Empty base64 image data"))
          return@execute
        }

        // Try decode with a few flags in case the incoming base64 has line breaks or URL-safe encoding.
        val candidateBytesList = mutableListOf<ByteArray>()
        try {
          candidateBytesList.add(Base64.decode(cleaned, Base64.DEFAULT))
        } catch (_: IllegalArgumentException) { /* try others below */ }
        if (candidateBytesList.isEmpty()) {
          try { candidateBytesList.add(Base64.decode(cleaned, Base64.NO_WRAP)) } catch (_: Exception) { }
        }
        if (candidateBytesList.isEmpty()) {
          try { candidateBytesList.add(Base64.decode(cleaned, Base64.URL_SAFE)) } catch (_: Exception) { }
        }

        if (candidateBytesList.isEmpty()) {
          cb(IllegalArgumentException("Failed to Base64-decode image data"))
          return@execute
        }

        var bmp: Bitmap? = null
        var lastErr: Throwable? = null

        for (bytes in candidateBytesList) {
          try {
            // First pass to get image dimensions
            val boundsOptions = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, boundsOptions)
            val width = boundsOptions.outWidth
            val height = boundsOptions.outHeight

            // if bounds invalid, try direct decode
            if (width <= 0 || height <= 0) {
              // Attempt direct decode
              bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
              if (bmp != null) break
              else throw IllegalArgumentException("Decoded bytes not recognized as an image (invalid dimensions)")
            }

            // compute inSampleSize to limit decoded image size to ~1080px max dimension (adjust as needed)
            val maxDim = 1080
            var inSampleSize = 1
            val maxSide = maxOf(width, height)
            if (maxSide > maxDim) {
              inSampleSize = 1
              while (maxSide / inSampleSize > maxDim) {
                inSampleSize *= 2
              }
            }

            val decodeOptions = BitmapFactory.Options().apply {
              inSampleSize = inSampleSize
              inPreferredConfig = Bitmap.Config.ARGB_8888
            }

            bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, decodeOptions)
            if (bmp != null) break
          } catch (t: Throwable) {
            lastErr = t
            // try next candidate
          }
        }

        if (bmp == null) {
          val cause = lastErr ?: IllegalArgumentException("Could not decode bitmap")
          cb(IllegalArgumentException("Could not decode bitmap: ${cause.message}", cause))
          return@execute
        }

        requirePrinter().printBitmap(bmp)
        cb(null)
      } catch (t: Throwable) {
        cb(t)
      }
    }
  }


  fun printBarCode(data: String, symbology: Int, height: Int, width: Int, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().printBarCode(data, symbology, height, width)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun printQRCode(data: String, modulesize: Int, errorlevel: Int, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().printQRCode(data, modulesize, errorlevel)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun setAlignment(alignment: Int, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().setAlignment(alignment)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun setTextSize(size: Float, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().setTextSize(size)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun nextLine(lines: Int, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().nextLine(lines)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun setTextBold(bold: Boolean, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().setTextBold(bold)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  fun printTableText(text: Array<String>, weight: IntArray, alignment: IntArray, cb: (Throwable?) -> Unit) {
    executor.execute {
      try {
        requirePrinter().printTableText(text, weight, alignment)
        cb(null)
      } catch (t: Throwable) { cb(t) }
    }
  }

  companion object {
    private const val TAG = "PrinterServiceManager"
  }
}
