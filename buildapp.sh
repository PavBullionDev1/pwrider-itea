#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

apkversion="";
dotversion="";
versionNumber="";
projectName="PWRIDER-CAP";
bucketName="${BUCKET_NAME}";

echo "apk version(e.g. 088): "
read apkversion

echo "dot version(e.g. 0.0.88): "
read dotversion

echo "version number(e.g. 88): "
read versionNumber

set -eu

# s3simple is a small, simple bash s3 client with minimal dependencies.
# See http://github.com/paulhammond/s3simple for documentation and licence.
s3simple() {
  local command="$1"
  local url="$2"
  local file="${3:--}"
  local acl="x-amz-acl:public-read" 
  local endpoint="s3.amazonaws.com"
  # todo: nice error message if unsupported command?

  if [ "${url:0:5}" != "s3://" ]; then
    echo "Need an s3 url"
    return 1
  fi
  local path="${url:4}"

  if [ -z "${AWS_ACCESS_KEY_ID-}"  ]; then
    echo "Need AWS_ACCESS_KEY_ID to be set"
    return 1
  fi

  if [ -z "${AWS_SECRET_ACCESS_KEY-}" ]; then
    echo "Need AWS_SECRET_ACCESS_KEY to be set"
    return 1
  fi

  local method md5 args
  case "$command" in
  get)
    method="GET"
    md5=""
    args="-o $file"
    ;;
  put)
    method="PUT"
    if [ ! -f "$file" ]; then
      echo "file not found"
      exit 1
    fi
    md5="$(openssl md5 -binary $file | openssl base64)"    
    args="-T $file -H Content-MD5:$md5"
    ;;
  *)
    echo "Unsupported command"
    return 1
  esac

  local date="$(LC_TIME=C date -u '+%a, %d %b %Y %H:%M:%S +0000')"
  local string_to_sign
  printf -v string_to_sign "%s\n%s\n\n%s\n%s\n%s" "$method" "$md5" "$date" "$acl" "$path"
  local signature=$(echo -n "$string_to_sign" | openssl sha1 -binary -hmac "${AWS_SECRET_ACCESS_KEY}" | openssl base64)
  local authorization="AWS ${AWS_ACCESS_KEY_ID}:${signature}"

  curl $args -s -H Date:"${date}" -H "${acl}"  -H Authorization:"${authorization}" https://${endpoint}"${path}"
}

export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export GRADLE_HOME=/opt/gradle/gradle-8.7/bin
export PATH=${PATH}:/opt/gradle/gradle-8.7/bin:/Users/iteatech/Library/Android/sdk/platform-tools:/Applications/XAMPP/bin

echo "build android..."

# Delete if files exist
rm -f $PWD/build/$projectName-v$apkversion.apk 
rm -f $PWD/build/$projectName-v$apkversion.aab 
rm -f $PWD/build/$projectName-v$apkversion.zip 

capacitor-set-version -v $dotversion -b $versionNumber

ionic build

npx cap sync

cd $PWD/android/ && ./gradlew bundle && cd ../ && jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore $PWD/important_key/my-release-key.keystore -storepass ${KEYSTORE_PASSWORD} $PWD/android/app/build/outputs/bundle/release/app-release.aab ${KEYSTORE_ALIAS} && java -jar $PWD/build/bundletool-all-1.8.2.jar build-apks --mode=universal --bundle=$PWD/android/app/build/outputs/bundle/release/app-release.aab --output=$PWD/build/$projectName-v$apkversion.apks --ks=$PWD/important_key/my-release-key.keystore --ks-pass=file:$PWD/important_key/my-passfile.txt --ks-key-alias=${KEYSTORE_ALIAS} && mv $PWD/build/$projectName-v$apkversion.apks $PWD/build/$projectName-v$apkversion.zip && cd $PWD/build && unzip -o $projectName-v$apkversion.zip && cd .. && mv $PWD/build/universal.apk $PWD/build/$projectName-v$apkversion.apk && cp $PWD/android/app/build/outputs/bundle/release/app-release.aab $PWD/build/$projectName-v$apkversion.aab

echo "aab done"

echo "All build completed"

echo "apk uploading..."
s3simple put s3://${bucketName}/$projectName-v$apkversion.apk build/$projectName-v$apkversion.apk
echo "apk uploaded"
