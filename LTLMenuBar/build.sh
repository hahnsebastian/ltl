#!/bin/bash

# Exit on error
set -e

APP_NAME="LTLMenuBar"
BUILD_DIR="build"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"
MACOS_DIR="$APP_BUNDLE/Contents/MacOS"
RESOURCES_DIR="$APP_BUNDLE/Contents/Resources"

echo "🔨 Building $APP_NAME..."

# 1. Clean and create structure
rm -rf "$BUILD_DIR"
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# 2. Compile Swift files
echo "📝 Compiling sources..."
SWIFT_FILES=$(find . -name "*.swift" -not -path "./build/*")
swiftc -o "$MACOS_DIR/$APP_NAME" \
    -sdk $(xcrun --show-sdk-path --sdk macosx) \
    -target arm64-apple-macosx13.0 \
    -O \
    $SWIFT_FILES

# 3. Copy Assets
cp Info.plist "$APP_BUNDLE/Contents/Info.plist"
cp ../ltl.svg "$RESOURCES_DIR/ltl.svg"

echo "✅ App bundle created at $APP_BUNDLE"

# 4. Package as DMG
echo "📦 Packaging as DMG..."
DMG_NAME="$APP_NAME.dmg"
rm -f "$DMG_NAME"

# Create a temporary folder for DMG contents
DMG_TEMP="dmg_temp"
rm -rf "$DMG_TEMP"
mkdir -p "$DMG_TEMP"
cp -R "$APP_BUNDLE" "$DMG_TEMP/"
ln -s /Applications "$DMG_TEMP/Applications"

hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_TEMP" -ov -format UDZO "$DMG_NAME"

rm -rf "$DMG_TEMP"

echo "🎉 DMG created: $DMG_NAME"
