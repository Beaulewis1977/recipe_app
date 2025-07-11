# Recipe Slot App 🎰🍳

<div align="center">

[![Flutter](https://img.shields.io/badge/Flutter-3.0+-02569B.svg?style=flat&logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.0+-0175C2.svg?style=flat&logo=dart)](https://dart.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%7C%20Tablet%20%7C%20Desktop-blue)](https://github.com/Beaulewis1977/recipe_app)

*A gamified recipe discovery app with slot machine mechanics and swipeable cards*

[Features](#features) •
[Demo](#demo) •
[Installation](#installation) •
[Usage](#usage) •
[Architecture](#architecture) •
[Contributing](#contributing) •
[License](#license)

</div>

---

## 🎯 Overview

**Recipe Slot App** transforms recipe discovery into an engaging, game-like experience. Spin the slot machine to get random recipe combinations, then swipe through beautifully designed recipe cards to find your next favorite meal. Built with Flutter for seamless cross-platform performance.

### ✨ Key Highlights

- 🎰 **Interactive Slot Machine** - Gamified recipe discovery with spinning reels
- 📱 **Intuitive Card Interface** - Tinder-style swipe gestures for recipe exploration
- 🔄 **Smart State Management** - Powered by Riverpod for optimal performance
- 💾 **Offline-First Design** - Hive database for reliable local storage
- 📐 **Fully Responsive** - Adaptive UI across mobile, tablet, and desktop
- 🎨 **Modern Material Design** - Clean, accessible, and beautiful interface

## 🚀 Features

### Core Features
- **🎰 Recipe Slot Machine**: Interactive spinning interface with cuisine types, meal categories, and cooking times
- **📱 Swipeable Recipe Cards**: Fluid card-based interface for browsing recipes
- **💾 Recipe Management**: Save favorites, mark as tried, and organize your collection
- **🔍 Smart Discovery**: Algorithm-driven recipe suggestions based on preferences
- **📱 Cross-Platform**: Native performance on iOS, Android, and Web

### Responsive Design Features
- **📱 Mobile-First**: Optimized vertical layouts for phones
- **📟 Tablet-Ready**: Adaptive side-by-side layouts for larger screens
- **🖥️ Desktop-Enhanced**: Full-width layouts with hover states and keyboard navigation
- **🔄 Adaptive Navigation**: Bottom nav → Navigation rail → Drawer based on screen size
- **📏 Semantic Breakpoints**: Intelligent layout switching at meaningful screen sizes

## 📱 Demo

### Screenshots
*Coming Soon - Screenshots and GIFs showcasing the app in action*

### Live Demo
*Web demo link will be added here*

## 🛠️ Installation

### Prerequisites

Ensure you have the following installed:

- **Flutter SDK**: `>=3.0.0 <4.0.0` ([Install Flutter](https://docs.flutter.dev/get-started/install))
- **Dart SDK**: Included with Flutter
- **IDE**: [VS Code](https://code.visualstudio.com/) or [Android Studio](https://developer.android.com/studio)
- **Device**: iOS Simulator, Android Emulator, or physical device

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Beaulewis1977/recipe_app.git
   cd recipe_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Verify installation**
   ```bash
   flutter doctor
   ```

4. **Run the app**
   ```bash
   # For development
   flutter run
   
   # For web
   flutter run -d chrome
   
   # For specific device
   flutter devices
   flutter run -d <device_id>
   ```

### Build for Production

```bash
# Android APK
flutter build apk --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

## 📖 Usage

### Basic Usage

1. **Launch the App**: Open Recipe Slot App on your device
2. **Spin to Discover**: Tap the spin button to generate random recipe combinations
3. **Swipe to Explore**: Use swipe gestures on recipe cards:
   - ➡️ **Swipe Right**: Save to favorites
   - ⬅️ **Swipe Left**: Pass on recipe
   - ⬆️ **Swipe Up**: Mark as tried
4. **Build Your Collection**: Access saved and tried recipes from the navigation

### Advanced Features

- **Recipe Details**: Tap any recipe card to view full details
- **Search & Filter**: Use the search functionality to find specific recipes
- **Offline Access**: All saved recipes work without internet connection
- **Responsive Experience**: Enjoy optimized layouts on any screen size

## 🏗️ Architecture

### Project Structure

```
├── core/
│   ├── navigation/          # Adaptive navigation components
│   └── responsive/          # Responsive design utilities
├── models/                  # Data models (Recipe, etc.)
├── providers/               # Riverpod state providers
├── screens/                 # App screens
│   ├── main_screen.dart
│   ├── spin_mode_screen.dart
│   ├── ingredient_mode_screen.dart
│   ├── saved_recipes_screen.dart
│   └── settings_screen.dart
├── widgets/                 # Reusable UI components
│   ├── slot_machine_widget.dart
│   └── recipe_card_stack.dart
└── main.dart               # App entry point
```

### State Management

The app uses **Riverpod** for state management with the following providers:

- `randomRecipesProvider`: Manages random recipe generation
- `savedRecipesProvider`: Handles saved recipe persistence
- `triedRecipesProvider`: Tracks tried recipes
- `recipeFiltersProvider`: Manages recipe filtering options

### Responsive Design

The app implements adaptive design patterns:

- **Mobile (< 600px)**: Bottom navigation, vertical slot layout
- **Tablet (600-1200px)**: Navigation rail, horizontal slot layout
- **Desktop (> 1200px)**: Navigation drawer, optimized for large screens

## Dependencies

### Core Dependencies
- `flutter_riverpod`: State management
- `hive` & `hive_flutter`: Local database
- `slot_machine_roller`: Slot machine animations
- `flutter_card_swiper`: Swipeable card interface

### Development Dependencies
- `flutter_test`: Testing framework
- `flutter_lints`: Code analysis
- `build_runner`: Code generation
- `hive_generator`: Hive model generation

## Development

### Running Tests

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run specific test file
flutter test test/widgets/slot_machine_widget_test.dart
```

### Code Generation

```bash
# Generate Hive adapters
flutter packages pub run build_runner build
```

### Linting

```bash
# Analyze code
flutter analyze

# Format code
flutter format .
```

## Code Quality

```bash
# Run static analysis
flutter analyze

# Format code
flutter format .

# Check for dependency updates
flutter pub outdated
```

## Building for Production

```bash
# Android APK
flutter build apk --release

# Android Bundle (recommended for Play Store)
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

## 🧪 Testing

### Test Coverage

The project includes comprehensive test coverage:

- **Unit Tests**: Core business logic and providers
- **Widget Tests**: UI components and responsive behavior
- **Integration Tests**: End-to-end user flows

```bash
# Run all tests
flutter test

# Run tests with coverage report
flutter test --coverage
```

### Test Architecture

- **Responsive Tests**: Validate adaptive layouts across screen sizes
- **State Management Tests**: Ensure Riverpod providers work correctly
- **Navigation Tests**: Verify adaptive navigation behavior
- **Widget Tests**: Test individual components in isolation

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before getting started.

#### Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/awesome-feature`
3. **Commit** your changes: `git commit -m 'feat: add awesome feature'`
4. **Push** to the branch: `git push origin feature/awesome-feature`
5. **Submit** a Pull Request

#### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

#### Code Standards

- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart) guidelines
- Maintain 90%+ test coverage for new features
- Use descriptive commit messages
- Add documentation for public APIs
- Ensure responsive design principles

## 🗺️ Roadmap

### Phase 1: Core Enhancement
- [x] Responsive design implementation
- [x] Adaptive navigation patterns
- [x] Cross-platform optimization
- [ ] Performance optimization
- [ ] Accessibility improvements

### Phase 2: Advanced Features
- [ ] Enhanced recipe filtering and search
- [ ] Recipe recommendations based on preferences
- [ ] Offline synchronization
- [ ] Recipe creation and editing tools
- [ ] Social features (sharing, ratings)

### Phase 3: Platform Integration
- [ ] Integration with nutrition APIs
- [ ] Voice navigation support
- [ ] Smart watch compatibility
- [ ] Social media sharing
- [ ] Cloud synchronization

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Recipes load on-demand
- **Efficient State Management**: Riverpod optimizations
- **Responsive Images**: Adaptive image sizing
- **Local Caching**: Hive database optimization
- **Memory Management**: Proper disposal patterns

### Metrics
- App startup time: < 2 seconds
- Memory usage: < 100MB average
- Battery efficient animations
- 60 FPS smooth scrolling

## 🛡️ Security & Privacy

- **Local Storage**: All data stored locally using Hive
- **No User Tracking**: Privacy-first approach
- **Secure Dependencies**: Regular security audits
- **Data Encryption**: Local data encryption support

## 🌐 Browser Support

### Web Platform Compatibility
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Optimized responsive experience

## 📊 Analytics & Monitoring

- **Performance Monitoring**: Built-in performance tracking
- **Error Reporting**: Comprehensive error handling
- **Usage Analytics**: Privacy-compliant usage insights

## 🎯 Browser Testing

The web version is tested across:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Tablet browsers with responsive layouts

## 📚 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [Material Design Guidelines](https://material.io/design)
- [Responsive Design Principles](https://web.dev/responsive-web-design-basics/)

## 📞 Support

Need help? Here's how to get support:

- 📖 [Documentation](https://github.com/Beaulewis1977/recipe_app/wiki)
- 🐛 [Bug Reports](https://github.com/Beaulewis1977/recipe_app/issues/new?template=bug_report.md)
- 💡 [Feature Requests](https://github.com/Beaulewis1977/recipe_app/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/Beaulewis1977/recipe_app/discussions)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flutter Team** - For the incredible cross-platform framework
- **Riverpod Community** - For excellent state management patterns
- **Open Source Contributors** - For making this project better
- **Design Inspiration** - Material Design and modern UI principles

## ⭐ Show Your Support

If you found this project helpful:

- ⭐ **Star** this repository
- 🔀 **Fork** it for your own projects
- 🐛 **Report** issues you encounter
- 💡 **Suggest** new features
- 📢 **Share** it with others
- ☕ **Sponsor** the development

---

<div align="center">

### 🚀 **Built with Flutter & ❤️**

[![Made with Flutter](https://img.shields.io/badge/Made%20with-Flutter-blue?logo=flutter&logoColor=white)](https://flutter.dev)
[![Powered by Dart](https://img.shields.io/badge/Powered%20by-Dart-0175C2?logo=dart&logoColor=white)](https://dart.dev)

**[⬆ Back to Top](#recipe-slot-app-)**

*Last updated: January 2025*

</div>
