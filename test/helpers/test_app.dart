import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:network_image_mock/network_image_mock.dart';
import 'package:recipe_slot_app/theme/app_theme.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';

/// Creates mock recipe data for testing
List<Recipe> createMockRecipes(int count) {
  return List.generate(count, (index) => Recipe(
    id: index,
    title: 'Mock Recipe $index',
    image: 'https://example.com/image$index.jpg',
    readyInMinutes: 30,
    servings: 4,
    summary: 'A delicious mock recipe for testing purposes.',
    instructions: ['Mock cooking instructions.'],
    ingredients: [
      Ingredient(
        id: index * 10,
        name: 'Mock Ingredient $index',
        original: 'Mock Ingredient $index',
        amount: 1.0,
        unit: 'cup',
      ),
    ],
    cuisines: ['Mock Cuisine'],
    dishTypes: ['Mock Dish'],
    diets: [],
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    healthScore: 80,
    sourceUrl: 'https://example.com',
    savedAt: null,
    triedAt: null,
  ));
}

/// Mock notifier for saved recipes that doesn't use Hive
class MockSavedRecipesNotifier extends StateNotifier<List<Recipe>> {
  MockSavedRecipesNotifier() : super([]);

  void saveRecipe(Recipe recipe) {
    final savedRecipe = recipe.copyWith(savedAt: DateTime.now());
    state = [...state, savedRecipe];
  }

  void removeRecipe(int recipeId) {
    state = state.where((recipe) => recipe.id != recipeId).toList();
  }

  bool isRecipeSaved(int recipeId) {
    return state.any((recipe) => recipe.id == recipeId);
  }
}

/// Mock notifier for tried recipes that doesn't use Hive
class MockTriedRecipesNotifier extends StateNotifier<List<Recipe>> {
  MockTriedRecipesNotifier() : super([]);

  void markAsTried(Recipe recipe) {
    final triedRecipe = recipe.copyWith(triedAt: DateTime.now());
    state = [...state, triedRecipe];
  }

  void removeFromTried(int recipeId) {
    state = state.where((recipe) => recipe.id != recipeId).toList();
  }

  bool isRecipeTried(int recipeId) {
    return state.any((recipe) => recipe.id == recipeId);
  }
}

/// Mock notifier for user settings that doesn't use Hive
class MockUserSettingsNotifier extends StateNotifier<UserSettings> {
  MockUserSettingsNotifier() : super(UserSettings.defaultSettings);

  void updateSettings(UserSettings newSettings) {
    state = newSettings;
  }

  void updateApiKey(String apiKey) {
    final newSettings = state.copyWith(apiKey: apiKey);
    updateSettings(newSettings);
  }

  void updateAllergies(List<String> allergies) {
    final newSettings = state.copyWith(allergies: allergies);
    updateSettings(newSettings);
  }

  void updateDiets(List<String> diets) {
    final newSettings = state.copyWith(diets: diets);
    updateSettings(newSettings);
  }

  void updateCuisines(List<String> cuisines) {
    final newSettings = state.copyWith(cuisines: cuisines);
    updateSettings(newSettings);
  }

  void updateExcludeIngredients(List<String> ingredients) {
    final newSettings = state.copyWith(excludeIngredients: ingredients);
    updateSettings(newSettings);
  }

  void updateMaxReadyTime(int maxTime) {
    final newSettings = state.copyWith(maxReadyTime: maxTime);
    updateSettings(newSettings);
  }
}

/// Creates provider overrides for testing following Riverpod best practices
List<Override> createTestProviderOverrides() {
  return [
    // Override random recipes provider with mock data
    randomRecipesProvider.overrideWith((ref, count) async {
      // Return mock recipes for testing
      return createMockRecipes(count);
    }),

    // Override ingredient search provider with mock data
    ingredientSearchProvider.overrideWith((ref, ingredients) async {
      // Return mock recipes for testing
      return createMockRecipes(3);
    }),
  ];
}

/// Test app wrapper that provides a complete testing environment
/// for widgets with Riverpod state management, theming, and network mocking.
class TestApp extends StatelessWidget {
  const TestApp({
    super.key,
    required this.child,
    this.overrides = const [],
    this.theme,
    this.locale = const Locale('en', 'US'),
  });

  final Widget child;
  final List<Override> overrides;
  final ThemeData? theme;
  final Locale locale;

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        title: 'Recipe Slot App Test',
        theme: theme ?? AppTheme.darkTheme,
        locale: locale,
        home: Scaffold(
          body: child,
        ),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

/// Pumps a widget wrapped in TestApp with proper setup for testing
Future<void> pumpTestApp(
  WidgetTester tester,
  Widget child, {
  List<Override> overrides = const [],
  ThemeData? theme,
  Locale locale = const Locale('en', 'US'),
  Size? screenSize,
}) async {
  // Set screen size if provided
  if (screenSize != null) {
    tester.view.physicalSize = screenSize;
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
    });
  }

  // Pump the widget with provider overrides
  await tester.pumpWidget(
    TestApp(
      overrides: overrides,
      theme: theme,
      locale: locale,
      child: child,
    ),
  );
}

/// Pumps a widget with responsive testing setup
Future<void> pumpResponsiveTestApp(
  WidgetTester tester,
  Widget child, {
  List<Override> overrides = const [],
  required Size screenSize,
  ThemeData? theme,
}) async {
  await pumpTestApp(
    tester,
    child,
    overrides: overrides,
    theme: theme,
    screenSize: screenSize,
  );
}

/// Common screen sizes for responsive testing
class TestScreenSizes {
  static const Size mobile = Size(375, 667); // iPhone SE
  static const Size mobileLarge = Size(414, 896); // iPhone 11 Pro Max
  static const Size tablet = Size(768, 1024); // iPad
  static const Size tabletLarge = Size(1024, 1366); // iPad Pro
  static const Size desktop = Size(1440, 900); // MacBook Air
  static const Size desktopLarge = Size(1920, 1080); // Full HD
}

/// Test utilities for common testing patterns
class TestUtils {
  /// Waits for all animations and async operations to complete
  static Future<void> pumpAndSettleWithTimeout(
    WidgetTester tester, [
    Duration timeout = const Duration(seconds: 10),
  ]) async {
    await tester.pumpAndSettle(timeout);
  }

  /// Finds a widget by its key
  static Finder findByKey(String key) => find.byKey(Key(key));

  /// Finds a widget by its type
  static Finder findByType<T extends Widget>() => find.byType(T);

  /// Finds text widget
  static Finder findText(String text) => find.text(text);

  /// Verifies that a widget exists exactly once
  static void expectSingleWidget(Finder finder) {
    expect(finder, findsOneWidget);
  }

  /// Verifies that a widget doesn't exist
  static void expectNoWidget(Finder finder) {
    expect(finder, findsNothing);
  }

  /// Verifies that multiple widgets exist
  static void expectMultipleWidgets(Finder finder, int count) {
    expect(finder, findsNWidgets(count));
  }

  /// Taps a widget and waits for animations
  static Future<void> tapAndSettle(
    WidgetTester tester,
    Finder finder,
  ) async {
    await tester.tap(finder);
    await pumpAndSettleWithTimeout(tester);
  }

  /// Enters text into a text field and waits for animations
  static Future<void> enterTextAndSettle(
    WidgetTester tester,
    Finder finder,
    String text,
  ) async {
    await tester.enterText(finder, text);
    await pumpAndSettleWithTimeout(tester);
  }

  /// Drags a widget and waits for animations
  static Future<void> dragAndSettle(
    WidgetTester tester,
    Finder finder,
    Offset offset,
  ) async {
    await tester.drag(finder, offset);
    await pumpAndSettleWithTimeout(tester);
  }

  /// Scrolls a scrollable widget
  static Future<void> scrollAndSettle(
    WidgetTester tester,
    Finder finder,
    Offset offset,
  ) async {
    await tester.drag(finder, offset);
    await pumpAndSettleWithTimeout(tester);
  }
}

/// Extension methods for WidgetTester to add convenience methods
extension WidgetTesterExtensions on WidgetTester {
  /// Gets the ProviderContainer from the current widget tree
  ProviderContainer container() {
    final element = this.element(find.byType(ProviderScope));
    final scope = element.widget as ProviderScope;
    return ProviderScope.containerOf(element);
  }

  /// Pumps the widget tree and waits for animations with timeout
  Future<void> pumpAndSettleWithTimeout([
    Duration timeout = const Duration(seconds: 10),
  ]) async {
    await pumpAndSettle(timeout);
  }

  /// Sets up responsive testing environment
  void setUpResponsiveTest(Size screenSize) {
    view.physicalSize = screenSize;
    view.devicePixelRatio = 1.0;
    addTearDown(() {
      view.resetPhysicalSize();
    });
  }
}

/// Matcher for testing responsive layouts
Matcher isResponsiveLayout(String expectedLayout) {
  return predicate<Widget>(
    (widget) {
      // Add logic to verify responsive layout
      return true; // Placeholder
    },
    'is responsive layout: $expectedLayout',
  );
}

/// Custom matchers for Recipe Slot App specific testing
class RecipeSlotMatchers {
  /// Matcher for slot machine state
  static Matcher isSlotMachineState(String state) {
    return predicate<Widget>(
      (widget) => true, // Implement specific logic
      'is slot machine in state: $state',
    );
  }

  /// Matcher for recipe card state
  static Matcher isRecipeCardState(String state) {
    return predicate<Widget>(
      (widget) => true, // Implement specific logic
      'is recipe card in state: $state',
    );
  }

  /// Matcher for navigation state
  static Matcher isNavigationState(String state) {
    return predicate<Widget>(
      (widget) => true, // Implement specific logic
      'is navigation in state: $state',
    );
  }
}
