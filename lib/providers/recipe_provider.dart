
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';
import 'package:recipe_slot_app/services/api_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final userSettingsProvider = StateNotifierProvider<UserSettingsNotifier, UserSettings>((ref) {
  return UserSettingsNotifier();
});

final randomRecipesProvider = FutureProvider.family<List<Recipe>, int>((ref, count) async {
  final apiService = ref.read(apiServiceProvider);
  final settings = ref.read(userSettingsProvider);
  
  if (settings.apiKey.isEmpty) {
    throw Exception('API key not set');
  }
  
  apiService.setApiKey(settings.apiKey);
  return apiService.getRandomRecipes(number: count, settings: settings);
});

final ingredientSearchProvider = FutureProvider.family<List<Recipe>, List<String>>((ref, ingredients) async {
  final apiService = ref.read(apiServiceProvider);
  final settings = ref.read(userSettingsProvider);
  
  if (settings.apiKey.isEmpty) {
    throw Exception('API key not set');
  }
  
  apiService.setApiKey(settings.apiKey);
  return apiService.searchRecipesByIngredients(ingredients: ingredients, settings: settings);
});

final savedRecipesProvider = StateNotifierProvider<SavedRecipesNotifier, List<Recipe>>((ref) {
  return SavedRecipesNotifier();
});

final triedRecipesProvider = StateNotifierProvider<TriedRecipesNotifier, List<Recipe>>((ref) {
  return TriedRecipesNotifier();
});

class UserSettingsNotifier extends StateNotifier<UserSettings> {
  late Box<UserSettings> _settingsBox;

  UserSettingsNotifier() : super(UserSettings.defaultSettings) {
    _init();
  }

  void _init() async {
    _settingsBox = Hive.box<UserSettings>('user_settings');
    final settings = _settingsBox.get('settings');
    if (settings != null) {
      state = settings;
    }
  }

  void updateSettings(UserSettings newSettings) {
    state = newSettings;
    _settingsBox.put('settings', newSettings);
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

class SavedRecipesNotifier extends StateNotifier<List<Recipe>> {
  late Box<Recipe> _savedBox;

  SavedRecipesNotifier() : super([]) {
    _init();
  }

  void _init() async {
    _savedBox = Hive.box<Recipe>('saved_recipes');
    state = _savedBox.values.toList();
  }

  void saveRecipe(Recipe recipe) {
    final savedRecipe = recipe.copyWith(savedAt: DateTime.now());
    _savedBox.put(recipe.id, savedRecipe);
    state = [...state, savedRecipe];
  }

  void removeRecipe(int recipeId) {
    _savedBox.delete(recipeId);
    state = state.where((recipe) => recipe.id != recipeId).toList();
  }

  bool isRecipeSaved(int recipeId) {
    return _savedBox.containsKey(recipeId);
  }
}

class TriedRecipesNotifier extends StateNotifier<List<Recipe>> {
  late Box<Recipe> _triedBox;

  TriedRecipesNotifier() : super([]) {
    _init();
  }

  void _init() async {
    _triedBox = Hive.box<Recipe>('tried_recipes');
    state = _triedBox.values.toList();
  }

  void markAsTried(Recipe recipe) {
    final triedRecipe = recipe.copyWith(triedAt: DateTime.now());
    _triedBox.put(recipe.id, triedRecipe);
    state = [...state, triedRecipe];
  }

  void removeFromTried(int recipeId) {
    _triedBox.delete(recipeId);
    state = state.where((recipe) => recipe.id != recipeId).toList();
  }

  bool isRecipeTried(int recipeId) {
    return _triedBox.containsKey(recipeId);
  }
}
