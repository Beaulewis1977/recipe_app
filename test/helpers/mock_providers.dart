import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';
import 'package:recipe_slot_app/services/api_service.dart';

/// Mock API Service for testing
class MockApiService extends Mock implements ApiService {}

/// Mock User Settings Notifier for testing
class MockUserSettingsNotifier extends Mock implements UserSettingsNotifier {}

/// Mock Saved Recipes Notifier for testing
class MockSavedRecipesNotifier extends Mock implements SavedRecipesNotifier {}

/// Mock Tried Recipes Notifier for testing
class MockTriedRecipesNotifier extends Mock implements TriedRecipesNotifier {}

/// Provider overrides for testing with mock data
class MockProviders {
  /// Creates a mock API service with default behavior
  static MockApiService createMockApiService() {
    final mockApiService = MockApiService();
    
    // Set up default mock behavior
    when(() => mockApiService.setApiKey(any())).thenReturn(null);
    
    return mockApiService;
  }

  /// Creates mock user settings with default values
  static UserSettings createMockUserSettings({
    String apiKey = 'test-api-key',
    List<String> allergies = const [],
    List<String> dietaryRestrictions = const [],
    String preferredCuisine = 'any',
    int maxCookingTime = 60,
    String difficulty = 'any',
  }) {
    return UserSettings(
      apiKey: apiKey,
      allergies: allergies,
      dietaryRestrictions: dietaryRestrictions,
      preferredCuisine: preferredCuisine,
      maxCookingTime: maxCookingTime,
      difficulty: difficulty,
    );
  }

  /// Creates a list of mock recipes for testing
  static List<Recipe> createMockRecipes({int count = 3}) {
    return List.generate(count, (index) => createMockRecipe(id: index + 1));
  }

  /// Creates a single mock recipe
  static Recipe createMockRecipe({
    int id = 1,
    String? title,
    String? image,
    int readyInMinutes = 30,
    int servings = 4,
    List<String>? ingredients,
    String? instructions,
    List<String>? cuisines,
    List<String>? dishTypes,
  }) {
    return Recipe(
      id: id,
      title: title ?? 'Mock Recipe $id',
      image: image ?? 'https://example.com/recipe$id.jpg',
      readyInMinutes: readyInMinutes,
      servings: servings,
      ingredients: ingredients ?? ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      instructions: instructions ?? 'Mock instructions for recipe $id',
      cuisines: cuisines ?? ['Italian'],
      dishTypes: dishTypes ?? ['main course'],
    );
  }

  /// Provider overrides for successful API responses
  static List<Override> successfulApiOverrides({
    List<Recipe>? recipes,
    UserSettings? userSettings,
  }) {
    final mockApiService = createMockApiService();
    final mockRecipes = recipes ?? createMockRecipes();
    final mockSettings = userSettings ?? createMockUserSettings();

    // Mock successful API responses
    when(() => mockApiService.getRandomRecipes(
          number: any(named: 'number'),
          settings: any(named: 'settings'),
        )).thenAnswer((_) async => mockRecipes);

    when(() => mockApiService.searchRecipesByIngredients(
          ingredients: any(named: 'ingredients'),
          settings: any(named: 'settings'),
        )).thenAnswer((_) async => mockRecipes);

    return [
      apiServiceProvider.overrideWithValue(mockApiService),
      userSettingsProvider.overrideWith((ref) {
        final notifier = MockUserSettingsNotifier();
        when(() => notifier.state).thenReturn(mockSettings);
        return notifier;
      }),
      savedRecipesProvider.overrideWith((ref) {
        final notifier = MockSavedRecipesNotifier();
        when(() => notifier.state).thenReturn([]);
        return notifier;
      }),
      triedRecipesProvider.overrideWith((ref) {
        final notifier = MockTriedRecipesNotifier();
        when(() => notifier.state).thenReturn([]);
        return notifier;
      }),
    ];
  }

  /// Provider overrides for API error scenarios
  static List<Override> errorApiOverrides({
    String errorMessage = 'API Error',
    UserSettings? userSettings,
  }) {
    final mockApiService = createMockApiService();
    final mockSettings = userSettings ?? createMockUserSettings();

    // Mock API error responses
    when(() => mockApiService.getRandomRecipes(
          number: any(named: 'number'),
          settings: any(named: 'settings'),
        )).thenThrow(Exception(errorMessage));

    when(() => mockApiService.searchRecipesByIngredients(
          ingredients: any(named: 'ingredients'),
          settings: any(named: 'settings'),
        )).thenThrow(Exception(errorMessage));

    return [
      apiServiceProvider.overrideWithValue(mockApiService),
      userSettingsProvider.overrideWith((ref) {
        final notifier = MockUserSettingsNotifier();
        when(() => notifier.state).thenReturn(mockSettings);
        return notifier;
      }),
    ];
  }

  /// Provider overrides for empty API responses
  static List<Override> emptyApiOverrides({
    UserSettings? userSettings,
  }) {
    final mockApiService = createMockApiService();
    final mockSettings = userSettings ?? createMockUserSettings();

    // Mock empty API responses
    when(() => mockApiService.getRandomRecipes(
          number: any(named: 'number'),
          settings: any(named: 'settings'),
        )).thenAnswer((_) async => <Recipe>[]);

    when(() => mockApiService.searchRecipesByIngredients(
          ingredients: any(named: 'ingredients'),
          settings: any(named: 'settings'),
        )).thenAnswer((_) async => <Recipe>[]);

    return [
      apiServiceProvider.overrideWithValue(mockApiService),
      userSettingsProvider.overrideWith((ref) {
        final notifier = MockUserSettingsNotifier();
        when(() => notifier.state).thenReturn(mockSettings);
        return notifier;
      }),
    ];
  }

  /// Provider overrides for testing with saved recipes
  static List<Override> withSavedRecipesOverrides({
    List<Recipe>? savedRecipes,
    List<Recipe>? triedRecipes,
    UserSettings? userSettings,
  }) {
    final mockApiService = createMockApiService();
    final mockSettings = userSettings ?? createMockUserSettings();
    final mockSavedRecipes = savedRecipes ?? createMockRecipes(count: 2);
    final mockTriedRecipes = triedRecipes ?? createMockRecipes(count: 1);

    return [
      apiServiceProvider.overrideWithValue(mockApiService),
      userSettingsProvider.overrideWith((ref) {
        final notifier = MockUserSettingsNotifier();
        when(() => notifier.state).thenReturn(mockSettings);
        return notifier;
      }),
      savedRecipesProvider.overrideWith((ref) {
        final notifier = MockSavedRecipesNotifier();
        when(() => notifier.state).thenReturn(mockSavedRecipes);
        return notifier;
      }),
      triedRecipesProvider.overrideWith((ref) {
        final notifier = MockTriedRecipesNotifier();
        when(() => notifier.state).thenReturn(mockTriedRecipes);
        return notifier;
      }),
    ];
  }

  /// Provider overrides for testing without API key
  static List<Override> noApiKeyOverrides() {
    final mockApiService = createMockApiService();
    final mockSettings = createMockUserSettings(apiKey: '');

    return [
      apiServiceProvider.overrideWithValue(mockApiService),
      userSettingsProvider.overrideWith((ref) {
        final notifier = MockUserSettingsNotifier();
        when(() => notifier.state).thenReturn(mockSettings);
        return notifier;
      }),
    ];
  }

  /// Provider overrides for testing loading states
  static List<Override> loadingStateOverrides({
    Duration delay = const Duration(seconds: 2),
    UserSettings? userSettings,
  }) {
    final mockApiService = createMockApiService();
    final mockSettings = userSettings ?? createMockUserSettings();

    // Mock delayed API responses to test loading states
    when(() => mockApiService.getRandomRecipes(
          number: any(named: 'number'),
          settings: any(named: 'settings'),
        )).thenAnswer((_) async {
      await Future.delayed(delay);
      return createMockRecipes();
    });

    return [
      apiServiceProvider.overrideWithValue(mockApiService),
      userSettingsProvider.overrideWith((ref) {
        final notifier = MockUserSettingsNotifier();
        when(() => notifier.state).thenReturn(mockSettings);
        return notifier;
      }),
    ];
  }
}
