package lk.klass.posterminal

import android.content.Context
import android.content.SharedPreferences
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.types.Enumerable

class ExpoR330PrinterModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoR330Printer")

    Events("onChangeTheme")

    Function("setTheme") { theme: Theme ->
      getPreferences().edit().putString("theme", theme.value).commit()
      this@ExpoR330PrinterModule.sendEvent("onChangeTheme", bundleOf("theme" to theme))
    }

    Function("getTheme") {
      return@Function getPreferences().getString("theme", Theme.SYSTEM.value)
    }
  }

  private val context
  get() = requireNotNull(appContext.reactContext)

  private fun getPreferences(): SharedPreferences {
    return context.getSharedPreferences(context.packageName + ".settings", Context.MODE_PRIVATE)
  }
}

enum class Theme(val value: String) : Enumerable {
  LIGHT("light"),
  DARK("dark"),
  SYSTEM("system")
}