#!/bin/bash

echo "🚀 Setting up Recipe Slot App Flutter Project"
echo "=============================================="

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed or not in PATH"
    echo "Please install Flutter from https://flutter.dev/docs/get-started/install"
    exit 1
fi

echo "✅ Flutter found"

# Check Flutter version
flutter --version

echo ""
echo "📦 Installing dependencies..."
flutter pub get

echo ""
echo "🔧 Generating code files..."
flutter packages pub run build_runner build --delete-conflicting-outputs

echo ""
echo "🔍 Running analysis..."
flutter analyze

echo ""
echo "🧪 Running tests..."
flutter test

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 To run the app:"
echo "   flutter run"
echo ""
echo "🔧 To build for release:"
echo "   Android: flutter build apk --release"
echo "   iOS: flutter build ios --release"
echo ""
echo "⚙️  Don't forget to:"
echo "   1. Get a Spoonacular API key from https://spoonacular.com/food-api"
echo "   2. Enter the API key in the app settings"
echo "   3. Configure your dietary preferences"
echo ""
echo "🎉 Happy cooking!"
