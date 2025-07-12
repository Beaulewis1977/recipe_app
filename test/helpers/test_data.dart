import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';

/// Test data constants and factory methods for consistent testing
class TestData {
  // Test API Keys
  static const String validApiKey = 'test-valid-api-key-12345';
  static const String invalidApiKey = 'invalid-key';
  static const String emptyApiKey = '';

  // Test User Settings
  static UserSettings get defaultUserSettings => UserSettings(
        apiKey: validApiKey,
        allergies: [],
        dietaryRestrictions: [],
        preferredCuisine: 'any',
        maxCookingTime: 60,
        difficulty: 'any',
      );

  static UserSettings get userSettingsWithAllergies => UserSettings(
        apiKey: validApiKey,
        allergies: ['nuts', 'dairy', 'gluten'],
        dietaryRestrictions: ['vegetarian'],
        preferredCuisine: 'italian',
        maxCookingTime: 45,
        difficulty: 'easy',
      );

  static UserSettings get userSettingsWithoutApiKey => UserSettings(
        apiKey: emptyApiKey,
        allergies: [],
        dietaryRestrictions: [],
        preferredCuisine: 'any',
        maxCookingTime: 60,
        difficulty: 'any',
      );

  // Test Recipes
  static Recipe get sampleRecipe1 => Recipe(
        id: 1,
        title: 'Spaghetti Carbonara',
        image: 'https://example.com/carbonara.jpg',
        readyInMinutes: 25,
        servings: 4,
        ingredients: [
          '400g spaghetti',
          '200g pancetta',
          '4 large eggs',
          '100g Pecorino Romano cheese',
          'Black pepper',
          'Salt',
        ],
        instructions: '''
1. Cook spaghetti in salted boiling water until al dente.
2. Fry pancetta until crispy.
3. Whisk eggs with grated cheese and black pepper.
4. Combine hot pasta with pancetta, then add egg mixture.
5. Toss quickly to create creamy sauce.
6. Serve immediately with extra cheese.
        ''',
        cuisines: ['Italian'],
        dishTypes: ['main course', 'dinner'],
      );

  static Recipe get sampleRecipe2 => Recipe(
        id: 2,
        title: 'Chicken Tikka Masala',
        image: 'https://example.com/tikka-masala.jpg',
        readyInMinutes: 45,
        servings: 6,
        ingredients: [
          '1kg chicken breast',
          '400ml coconut milk',
          '400g canned tomatoes',
          '2 onions',
          'Ginger and garlic',
          'Garam masala',
          'Turmeric',
          'Cumin',
          'Coriander',
        ],
        instructions: '''
1. Marinate chicken in yogurt and spices.
2. Grill chicken until cooked through.
3. Sauté onions, ginger, and garlic.
4. Add tomatoes and spices, cook until thick.
5. Add coconut milk and grilled chicken.
6. Simmer for 15 minutes.
7. Serve with rice and naan.
        ''',
        cuisines: ['Indian'],
        dishTypes: ['main course', 'dinner'],
      );

  static Recipe get sampleRecipe3 => Recipe(
        id: 3,
        title: 'Caesar Salad',
        image: 'https://example.com/caesar-salad.jpg',
        readyInMinutes: 15,
        servings: 2,
        ingredients: [
          'Romaine lettuce',
          'Parmesan cheese',
          'Croutons',
          'Caesar dressing',
          'Anchovies (optional)',
          'Lemon juice',
        ],
        instructions: '''
1. Wash and chop romaine lettuce.
2. Make croutons from day-old bread.
3. Prepare Caesar dressing with anchovies.
4. Toss lettuce with dressing.
5. Add croutons and grated Parmesan.
6. Serve immediately.
        ''',
        cuisines: ['American'],
        dishTypes: ['salad', 'side dish', 'lunch'],
      );

  static Recipe get quickRecipe => Recipe(
        id: 4,
        title: 'Avocado Toast',
        image: 'https://example.com/avocado-toast.jpg',
        readyInMinutes: 5,
        servings: 1,
        ingredients: [
          '2 slices bread',
          '1 ripe avocado',
          'Salt',
          'Pepper',
          'Lemon juice',
          'Red pepper flakes (optional)',
        ],
        instructions: '''
1. Toast bread slices until golden.
2. Mash avocado with salt, pepper, and lemon juice.
3. Spread avocado mixture on toast.
4. Sprinkle with red pepper flakes if desired.
5. Serve immediately.
        ''',
        cuisines: ['American'],
        dishTypes: ['breakfast', 'snack'],
      );

  static Recipe get complexRecipe => Recipe(
        id: 5,
        title: 'Beef Wellington',
        image: 'https://example.com/beef-wellington.jpg',
        readyInMinutes: 180,
        servings: 8,
        ingredients: [
          '2kg beef tenderloin',
          '500g puff pastry',
          '300g mushroom duxelles',
          'Prosciutto slices',
          'Dijon mustard',
          'Egg wash',
          'Fresh herbs',
        ],
        instructions: '''
1. Sear beef tenderloin on all sides.
2. Brush with Dijon mustard and cool.
3. Prepare mushroom duxelles and cool.
4. Wrap beef in prosciutto and mushrooms.
5. Encase in puff pastry with egg wash.
6. Bake at 200°C for 25-30 minutes.
7. Rest for 10 minutes before slicing.
        ''',
        cuisines: ['British'],
        dishTypes: ['main course', 'dinner'],
      );

  // Recipe Lists
  static List<Recipe> get sampleRecipeList => [
        sampleRecipe1,
        sampleRecipe2,
        sampleRecipe3,
      ];

  static List<Recipe> get mixedDifficultyRecipes => [
        quickRecipe,
        sampleRecipe1,
        complexRecipe,
      ];

  static List<Recipe> get vegetarianRecipes => [
        sampleRecipe3,
        quickRecipe,
      ];

  static List<Recipe> get emptyRecipeList => <Recipe>[];

  // Test Ingredients
  static const List<String> commonIngredients = [
    'chicken',
    'beef',
    'pasta',
    'tomatoes',
    'onions',
    'garlic',
    'cheese',
    'eggs',
    'milk',
    'flour',
  ];

  static const List<String> vegetarianIngredients = [
    'tofu',
    'vegetables',
    'quinoa',
    'beans',
    'lentils',
    'nuts',
    'seeds',
    'fruits',
  ];

  static const List<String> allergenIngredients = [
    'nuts',
    'dairy',
    'eggs',
    'gluten',
    'shellfish',
    'soy',
  ];

  // Test Cuisines
  static const List<String> popularCuisines = [
    'Italian',
    'Chinese',
    'Mexican',
    'Indian',
    'French',
    'Japanese',
    'Thai',
    'Greek',
  ];

  // Test Dish Types
  static const List<String> dishTypes = [
    'main course',
    'side dish',
    'dessert',
    'appetizer',
    'salad',
    'soup',
    'beverage',
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  // Test Error Messages
  static const String apiKeyMissingError = 'API key not set';
  static const String networkError = 'Network error occurred';
  static const String serverError = 'Server error occurred';
  static const String noRecipesFoundError = 'No recipes found';

  // Factory Methods
  static Recipe createRecipeWithId(int id) => Recipe(
        id: id,
        title: 'Test Recipe $id',
        image: 'https://example.com/recipe$id.jpg',
        readyInMinutes: 30,
        servings: 4,
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        instructions: 'Test instructions for recipe $id',
        cuisines: ['Test Cuisine'],
        dishTypes: ['main course'],
      );

  static List<Recipe> createRecipeList(int count) =>
      List.generate(count, (index) => createRecipeWithId(index + 1));

  static UserSettings createUserSettingsWithApiKey(String apiKey) =>
      UserSettings(
        apiKey: apiKey,
        allergies: [],
        dietaryRestrictions: [],
        preferredCuisine: 'any',
        maxCookingTime: 60,
        difficulty: 'any',
      );
}
