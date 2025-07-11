# Recipe Slot App 🎰🍳

A Flutter application that gamifies recipe discovery through an interactive slot machine interface. Spin to discover random recipes, swipe through recipe cards, and build your personal recipe collection.

## Features

- **🎰 Recipe Slot Machine**: Interactive slot machine with cuisine types, meal categories, and cooking times
- **📱 Swipeable Recipe Cards**: Tinder-style card interface for exploring recipes
- **💾 Recipe Management**: Save favorite recipes and mark tried recipes
- **🔄 State Management**: Powered by Riverpod for efficient state management
- **💾 Local Storage**: Hive database for offline recipe storage
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop platforms

## Screenshots

*Screenshots will be added here*

## Getting Started

### Prerequisites

- Flutter SDK (>=3.0.0 <4.0.0)
- Dart SDK
- Android Studio / VS Code
- iOS Simulator / Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Beaulewis1977/recipe_app.git
   cd recipe_app/recipe_slot_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

## Architecture

### Project Structure

```
lib/
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

## Building for Production

### Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Flutter/Dart style guidelines
- Write tests for new features
- Ensure responsive design works across all screen sizes
- Update documentation for significant changes

## Roadmap

- [ ] Recipe search and filtering
- [ ] User accounts and cloud sync
- [ ] Recipe sharing functionality
- [ ] Meal planning features
- [ ] Shopping list generation
- [ ] Recipe rating and reviews

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flutter team for the amazing framework
- Riverpod for excellent state management
- The open-source community for various packages used

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Beaulewis1977/recipe_app/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Made with ❤️ and Flutter**
