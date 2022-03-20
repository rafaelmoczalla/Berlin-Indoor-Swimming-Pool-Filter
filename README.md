# Berlin-Indoor-Swimming-Pool-Filter
## Local Development
The `App.tsx` file is the main file of the app where the magic happens.

You can run the app locally in your web browser.
```bash
yarn web
```

When you make any changes to the `App.tsx` the changes are applied immediately and you see them in the web broswer without rebuilding.

### Android
Run the app by first starting an adb server on windows and connect in WSL. Afterwards you can deploy and run the app as usual. Make sure that the android smart phone is in developer mode and connected via usb. Make sure to set the `EXPO_ANDROID_KEYSTORE_PASSWORD`, `EXPO_ANDROID_KEY_PASSWORD`, `EXPO_USERNAME` and `EXPO_PASSWORD` environment variables. 
```bash
adb tcpip 5555
adb connect [ip device]:5555
yarn buildAPK
asb install ./out/swimmingPoolFilter.apk
```
For windows you can use this [version](https://dl.google.com/android/repository/platform-tools-latest-windows.zip) of adb that has a binary ready to execute.

### iOS
Make plugins working by adding an empty `libs.podspec` to the ios folder after `yarn prebuild` to fix a bug in the `expo-module-scripts` dependency.

## Heroku Stuff
### Setup
This project uses the node.js and static buildpacks from Heroku.
```bash
heroku buildpacks:set heroku/nodejs --app=berlin-indoor-swimming-filter
heroku buildpacks:add heroku-community/static --app=berlin-indoor-swimming-filter
```

### Show Logs
The option `--tail` sends continuous logging to the terminal. For one shot logs remove this option.
```bash
heroku logs --tail --app=berlin-indoor-swimming-backend
```

### Restart
After a new version of the server was deployed to github you need to restart the app.
```bash
heroku restart --app=berlin-indoor-swimming-filter
```