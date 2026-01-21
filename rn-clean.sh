#!/bin/bash

echo "🧹 Starting React Native cleanup..."

# Hỏi người dùng có xoá node_modules hay không
read -p "❓ Do you want to remove node_modules and reinstall? (Y/N): " choice

if [[ "$choice" == "Y" || "$choice" == "y" ]]; then
  # Xóa node_modules
  if [ -d "node_modules" ]; then
    echo "🔹 Removing node_modules..."
    rm -rf node_modules
  fi

  # Xóa lock files
  if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
  fi
  if [ -f "yarn.lock" ]; then
    rm -f yarn.lock
  fi

  echo "🔹 Running yarn install..."
  yarn install

  if [ -d "ios" ]; then
    echo "🔹 Installing iOS pods..."
    cd ios && pod install && cd ..
  fi
else
  echo "⏭️ Skipping node_modules removal. Only cleaning cache..."
fi

# Yarn & npm cache
echo "🔹 Cleaning Yarn & NPM cache..."
yarn cache clean --all >/dev/null 2>&1
npm cache clean --force >/dev/null 2>&1

# iOS build
if [ -d "ios" ]; then
  echo "🔹 Cleaning iOS build..."
  cd ios && xcodebuild clean >/dev/null 2>&1 && cd ..
  rm -rf ios/build
fi

# Android build
if [ -d "android" ]; then
  echo "🔹 Cleaning Android build..."
  cd android && ./gradlew clean >/dev/null 2>&1 && cd ..
  rm -rf android/.gradle
  rm -rf android/build
fi

# Xcode DerivedData
echo "🔹 Removing Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# iOS Simulator
echo "🔹 Resetting iOS simulators..."
xcrun simctl erase all >/dev/null 2>&1

# Metro / Watchman cache
echo "🔹 Cleaning Metro & Watchman cache..."
watchman watch-del-all >/dev/null 2>&1
rm -rf $TMPDIR/metro-* $TMPDIR/react-*

# CocoaPods cache
echo "🔹 Cleaning CocoaPods cache..."
pod cache clean --all >/dev/null 2>&1

echo "✅ React Native cleanup completed!"

# run: ./rn-clean.sh