
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'recipe.g.dart';

@HiveType(typeId: 0)
@JsonSerializable()
class Recipe extends HiveObject {
  @HiveField(0)
  final int id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String? image;

  @HiveField(3)
  final int readyInMinutes;

  @HiveField(4)
  final int servings;

  @HiveField(5)
  final String? summary;

  @HiveField(6)
  final List<String> instructions;

  @HiveField(7)
  final List<Ingredient> ingredients;

  @HiveField(8)
  final List<String> cuisines;

  @HiveField(9)
  final List<String> dishTypes;

  @HiveField(10)
  final List<String> diets;

  @HiveField(11)
  final bool vegetarian;

  @HiveField(12)
  final bool vegan;

  @HiveField(13)
  final bool glutenFree;

  @HiveField(14)
  final bool dairyFree;

  @HiveField(15)
  final double? spoonacularScore;

  @HiveField(16)
  final double? healthScore;

  @HiveField(17)
  final String? sourceUrl;

  @HiveField(18)
  final DateTime? savedAt;

  @HiveField(19)
  final DateTime? triedAt;

  Recipe({
    required this.id,
    required this.title,
    this.image,
    required this.readyInMinutes,
    required this.servings,
    this.summary,
    required this.instructions,
    required this.ingredients,
    required this.cuisines,
    required this.dishTypes,
    required this.diets,
    required this.vegetarian,
    required this.vegan,
    required this.glutenFree,
    required this.dairyFree,
    this.spoonacularScore,
    this.healthScore,
    this.sourceUrl,
    this.savedAt,
    this.triedAt,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) => _$RecipeFromJson(json);
  Map<String, dynamic> toJson() => _$RecipeToJson(this);

  Recipe copyWith({
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
      instructions: instructions,
      ingredients: ingredients,
      cuisines: cuisines,
      dishTypes: dishTypes,
      diets: diets,
      vegetarian: vegetarian,
      vegan: vegan,
      glutenFree: glutenFree,
      dairyFree: dairyFree,
      spoonacularScore: spoonacularScore,
      healthScore: healthScore,
      sourceUrl: sourceUrl,
      savedAt: savedAt ?? this.savedAt,
      triedAt: triedAt ?? this.triedAt,
    );
  }
}

@HiveType(typeId: 1)
@JsonSerializable()
class Ingredient extends HiveObject {
  @HiveField(0)
  final int id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String original;

  @HiveField(3)
  final double amount;

  @HiveField(4)
  final String unit;

  @HiveField(5)
  final String? image;

  Ingredient({
    required this.id,
    required this.name,
    required this.original,
    required this.amount,
    required this.unit,
    this.image,
  });

  factory Ingredient.fromJson(Map<String, dynamic> json) => _$IngredientFromJson(json);
  Map<String, dynamic> toJson() => _$IngredientToJson(this);
}
