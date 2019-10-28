package com.ccs.foodorder;

import android.app.Application;

import com.facebook.react.ReactApplication;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.solinor.bluetoothstatus.RNBluetoothManagerPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.rusel.RCTBluetoothSerial.*;
import io.sentry.RNSentryPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import cn.jystudio.bluetooth.RNBluetoothEscposPrinterPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.ccs.foodorder.generated.BasePackageList;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), Arrays.<SingletonModule>asList());

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNViewShotPackage(),
            new ReactNativePushNotificationPackage(),
            new RNBluetoothManagerPackage(),
          new ModuleRegistryAdapter(mModuleRegistryProvider),
            new NetInfoPackage(),
            new RCTBluetoothSerialPackage(),
            new RNSentryPackage(),
            new AsyncStoragePackage(),
            new RNCWebViewPackage(),
            new RNBluetoothEscposPrinterPackage(),
            new SplashScreenReactPackage(),
            new RNGestureHandlerPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
