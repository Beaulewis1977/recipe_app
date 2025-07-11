
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';

class ApiService {
  static const String baseUrl = 'https://api.spoonacular.com';
  late final Dio _dio;
  late final Logger _logger;
  String? _apiKey;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));
    _logger = Logger();
  }

  void setApiKey(String apiKey) {
    _apiKey = apiKey;
  }

  Future<List<Recipe>> getRandomRecipes({
    int number = 10,
    UserSettings? settings,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'apiKey': _apiKey,
        'number': number,
        'addRecipeInformation': true,
        'fillIngredients': true,
      };

      if (settings != null) {
        if (settings.diets.isNotEmpty) {
          queryParams['diet'] = settings.diets.join(',');
        }
        if (settings.excludeIngredients.isNotEmpty) {
          queryParams['excludeIngredients'] = settings.excludeIngredients.join(',');
        }
        if (settings.maxReadyTime > 0) {
          queryParams['maxReadyTime'] = settings.maxReadyTime;
        }
      }

      final response = await _dio.get('/recipes/random', queryParameters: queryParams);
      
      if (response.statusCode == 200) {
        final data = response.data;
        final recipes = (data['recipes'] as List)
            .map((json) => _parseRecipeFromApi(json))
            .toList();
        return recipes;
      } else {
        throw Exception('Failed to fetch random recipes');
      }
    } catch (e) {
      _logger.e('Error fetching random recipes: $e');
      rethrow;
    }
  }

  Future<List<Recipe>> searchRecipesByIngredients({
    required List<String> ingredients,
    int number = 10,
    UserSettings? settings,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'apiKey': _apiKey,
        'ingredients': ingredients.join(','),
        'number': number,
        'addRecipeInformation': true,
        'fillIngredients': true,
      };

      if (settings != null) {
        if (settings.diets.isNotEmpty) {
          queryParams['diet'] = settings.diets.join(',');
        }
        if (settings.excludeIngredients.isNotEmpty) {
          queryParams['excludeIngredients'] = settings.excludeIngredients.join(',');
        }
        if (settings.maxReadyTime > 0) {
          queryParams['maxReadyTime'] = settings.maxReadyTime;
        }
      }

      final response = await _dio.get('/recipes/findByIngredients', queryParameters: queryParams);
      
      if (response.statusCode == 200) {
        final data = response.data as List;
        final recipes = <Recipe>[];
        
        for (final item in data) {
          final detailedRecipe = await getRecipeDetails(item['id']);
          if (detailedRecipe != null) {
            recipes.add(detailedRecipe);
          }
        }
        
        return recipes;
      } else {
        throw Exception('Failed to search recipes by ingredients');
      }
    } catch (e) {
      _logger.e('Error searching recipes by ingredients: $e');
      rethrow;
    }
  }

  Future<Recipe?> getRecipeDetails(int recipeId) async {
    try {
      final response = await _dio.get(
        '/recipes/$recipeId/information',
        queryParameters: {
          'apiKey': _apiKey,
          'includeNutrition': false,
        },
      );
      
      if (response.statusCode == 200) {
        return _parseRecipeFromApi(response.data);
      } else {
        throw Exception('Failed to fetch recipe details');
      }
    } catch (e) {
      _logger.e('Error fetching recipe details: $e');
      return null;
    }
  }

  Recipe _parseRecipeFromApi(Map<String, dynamic> json) {
    return Recipe(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      image: json['image'],
      readyInMinutes: json['readyInMinutes'] ?? 0,
      servings: json['servings'] ?? 1,
      summary: json['summary'],
      instructions: _parseInstructions(json['analyzedInstructions']),
      ingredients: _parseIngredients(json['extendedIngredients']),
      cuisines: List<String>.from(json['cuisines'] ?? []),
      dishTypes: List<String>.from(json['dishTypes'] ?? []),
      diets: List<String>.from(json['diets'] ?? []),
      vegetarian: json['vegetarian'] ?? false,
      vegan: json['vegan'] ?? false,
      glutenFree: json['glutenFree'] ?? false,
      dairyFree: json['dairyFree'] ?? false,
      spoonacularScore: json['spoonacularScore']?.toDouble(),
      healthScore: json['healthScore']?.toDouble(),
      sourceUrl: json['sourceUrl'],
    );
  }

  List<String> _parseInstructions(dynamic analyzedInstructions) {
    if (analyzedInstructions == null) return [];
    
    final instructions = <String>[];
    for (final instruction in analyzedInstructions) {
      if (instruction['steps'] != null) {
        for (final step in instruction['steps']) {
          if (step['step'] != null) {
            instructions.add(step['step']);
          }
        }
      }
    }
    return instructions;
  }

  List<Ingredient> _parseIngredients(dynamic extendedIngredients) {
    if (extendedIngredients == null) return [];
    
    return (extendedIngredients as List).map((json) => Ingredient(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      original: json['original'] ?? '',
      amount: json['amount']?.toDouble() ?? 0.0,
      unit: json['unit'] ?? '',
      image: json['image'],
    )).toList();
  }
}
