import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';

/// Test data constants and factory methods for Recipe Slot App testing
class TestData {
  // API Keys
  static const String validApiKey = 'test-api-key-123';
  static const String invalidApiKey = 'invalid-key';

  // Sample Ingredients
  static final Ingredient sampleIngredient1 = Ingredient(
    id: 1,
    name: 'spaghetti',
    original: '400g spaghetti',
    amount: 400.0,
    unit: 'g',
    image: 'https://example.com/spaghetti.jpg',
  );

  static final Ingredient sampleIngredient2 = Ingredient(
    id: 2,
    name: 'pancetta',
    original: '200g pancetta',
    amount: 200.0,
    unit: 'g',
    image: null,
  );

  static final Ingredient sampleIngredient3 = Ingredient(
    id: 3,
    name: 'ground beef',
    original: '1 lb ground beef',
    amount: 1.0,
    unit: 'lb',
    image: 'https://example.com/ground-beef.jpg',
  );

  // Sample Recipes
  static final Recipe sampleRecipe1 = Recipe(
    id: 1,
    title: 'Spaghetti Carbonara',
    image: 'https://example.com/carbonara.jpg',
    readyInMinutes: 25,
    servings: 4,
    summary: 'Classic Italian pasta dish with eggs, cheese, and pancetta.',
    instructions: [
      'Cook spaghetti according to package directions.',
      'Fry pancetta until crispy.',
      'Mix eggs and cheese in a bowl.',
      'Combine hot pasta with egg mixture and pancetta.',
    ],
    ingredients: [sampleIngredient1, sampleIngredient2, sampleIngredient3],
    cuisines: ['Italian'],
    dishTypes: ['main course', 'dinner'],
    diets: [],
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    spoonacularScore: 85.5,
    healthScore: 72.0,
    sourceUrl: 'https://example.com/carbonara-recipe',
    savedAt: null,
    triedAt: null,
  );

  static final Recipe sampleRecipe2 = Recipe(
    id: 2,
    title: 'Vegetarian Pasta Primavera',
    image: 'https://example.com/pasta-primavera.jpg',
    readyInMinutes: 30,
    servings: 2,
    summary: 'Fresh vegetables with pasta in a light sauce.',
    instructions: [
      'Cook pasta according to package directions.',
      'Sauté vegetables until tender.',
      'Toss pasta with vegetables and olive oil.',
    ],
    ingredients: [sampleIngredient1],
    cuisines: ['Italian'],
    dishTypes: ['main course'],
    diets: ['vegetarian'],
    vegetarian: true,
    vegan: false,
    glutenFree: false,
    dairyFree: true,
    spoonacularScore: 75.0,
    healthScore: 85.0,
    sourceUrl: 'https://example.com/recipe/2',
    savedAt: null,
    triedAt: null,
  );

  // Sample User Settings
  static final UserSettings defaultUserSettings = UserSettings(
    allergies: [],
    diets: [],
    cuisines: [],
    excludeIngredients: [],
    maxReadyTime: 60,
    darkMode: true,
    apiKey: validApiKey,
  );

  static final UserSettings userSettingsWithAllergies = UserSettings(
    allergies: ['nuts', 'dairy', 'gluten'],
    diets: ['vegetarian'],
    cuisines: ['italian'],
    excludeIngredients: ['onions'],
    maxReadyTime: 45,
    darkMode: false,
    apiKey: validApiKey,
  );

  // Factory methods for creating test data with variations
  static Recipe createTestRecipe({
    int id = 1,
    String title = 'Test Recipe',
    String? image,
    int readyInMinutes = 30,
    int servings = 4,
    String? summary,
    List<String>? instructions,
    List<Ingredient>? ingredients,
    List<String>? cuisines,
    List<String>? dishTypes,
    List<String>? diets,
    bool vegetarian = false,
    bool vegan = false,
    bool glutenFree = false,
    bool dairyFree = false,
    double? spoonacularScore,
    double? healthScore,
    String? sourceUrl,
    DateTime? savedAt,
    DateTime? triedAt,
  }) {
    return Recipe(
      id: id,
      title: title,
      image: image,
      readyInMinutes: readyInMinutes,
      servings: servings,
      summary: summary,
      instructions: instructions ?? ['Step 1'],
      ingredients: ingredients ?? [sampleIngredient1],
      cuisines: cuisines ?? ['Italian'],
      dishTypes: dishTypes ?? ['main course'],
      diets: diets ?? [],
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
      dairyFree: dairyFree,
      spoonacularScore: spoonacularScore,
      healthScore: healthScore,
      sourceUrl: sourceUrl,
      savedAt: savedAt,
      triedAt: triedAt,
    );
  }

  static Ingredient createTestIngredient({
    int id = 1,
    String name = 'test ingredient',
    String original = 'test ingredient',
    double amount = 1.0,
    String unit = 'cup',
    String? image,
  }) {
    return Ingredient(
      id: id,
      name: name,
      original: original,
      amount: amount,
      unit: unit,
      image: image,
    );
  }

  static UserSettings createTestUserSettings({
    List<String>? allergies,
    List<String>? diets,
    List<String>? cuisines,
    List<String>? excludeIngredients,
    int maxReadyTime = 60,
    bool darkMode = true,
    String apiKey = validApiKey,
  }) {
    return UserSettings(
      allergies: allergies ?? [],
      diets: diets ?? [],
      cuisines: cuisines ?? [],
      excludeIngredients: excludeIngredients ?? [],
      maxReadyTime: maxReadyTime,
      darkMode: darkMode,
      apiKey: apiKey,
    );
  }

  // JSON test data
  static Map<String, dynamic> get sampleRecipeJson => {
    'id': 1,
    'title': 'Spaghetti Carbonara',
    'image': 'https://example.com/carbonara.jpg',
    'readyInMinutes': 25,
    'servings': 4,
    'summary': 'Classic Italian pasta dish with eggs, cheese, and pancetta.',
    'instructions': [
      'Cook spaghetti according to package directions.',
      'Fry pancetta until crispy.',
      'Mix eggs and cheese in a bowl.',
      'Combine hot pasta with egg mixture and pancetta.',
    ],
    'ingredients': [
      {
        'id': 1,
        'name': 'spaghetti',
        'original': '400g spaghetti',
        'amount': 400.0,
        'unit': 'g',
        'image': 'https://example.com/spaghetti.jpg',
      },
      {
        'id': 2,
        'name': 'pancetta',
        'original': '200g pancetta',
        'amount': 200.0,
        'unit': 'g',
        'image': null,
      },
      {
        'id': 3,
        'name': 'ground beef',
        'original': '1 lb ground beef',
        'amount': 1.0,
        'unit': 'lb',
        'image': 'https://example.com/ground-beef.jpg',
      },
    ],
    'cuisines': ['Italian'],
    'dishTypes': ['main course', 'dinner'],
    'diets': [],
    'vegetarian': false,
    'vegan': false,
    'glutenFree': false,
    'dairyFree': false,
    'spoonacularScore': 85.5,
    'healthScore': 72.0,
    'sourceUrl': 'https://example.com/carbonara-recipe',
    'savedAt': null,
    'triedAt': null,
  };

  static Map<String, dynamic> get sampleIngredientJson => {
    'id': 1,
    'name': 'test ingredient',
    'original': '1 cup test ingredient',
    'amount': 1.0,
    'unit': 'cup',
    'image': 'https://example.com/test-ingredient.jpg',
  };

  static Map<String, dynamic> get sampleUserSettingsJson => {
    'allergies': ['nuts', 'dairy', 'gluten'],
    'diets': ['vegetarian'],
    'cuisines': ['italian'],
    'excludeIngredients': ['onions'],
    'maxReadyTime': 45,
    'darkMode': false,
    'apiKey': validApiKey,
  };
}
