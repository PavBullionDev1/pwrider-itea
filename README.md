# PW Rider Capacitor Version

Version 0.0.170
## PWA
https://pwgroup-rider-app.web.app/login

## Android:
https://s3.amazonaws.com/pwgroup/PWRIDER-CAP-v177.apk

## IOS:
https://apps.apple.com/my/app/pwrider/id6446391597

## Created with Capacitor Create App

This app was created using [`@capacitor/create-app`](https://github.com/ionic-team/create-capacitor-app),
and comes with a very minimal shell for building an app.

### Running this example

To run the provided example, you can use `npm start` command.

```bash
npm start
```

# configuration
# Create resources folder and put in icon.ong(1024x1024) and splash.png(3000x3000)
ionic capacitor add android
npm install capacitor-resources -g
npm i capacitor-set-version -g
capacitor-resources
npx @capacitor/assets generate


# Everytime deployment
```
capacitor-set-version -v 0.0.177 -b 177
ionic build
npx cap sync
```