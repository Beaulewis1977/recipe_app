import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import '../../helpers/test_data.dart';

void main() {
  group('Recipe Model', () {
    group('Constructor', () {
      test('should create Recipe with required fields', () {
        // Arrange & Act
        final recipe = Recipe(
          id: 1,
          title: 'Test Recipe',
          readyInMinutes: 30,
          servings: 4,
          instructions: ['Step 1', 'Step 2'],
          ingredients: [TestData.sampleIngredient1],
          cuisines: ['Italian'],
          dishTypes: ['main course'],
          diets: [],
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
        );

        // Assert
        expect(recipe.id, 1);
        expect(recipe.title, 'Test Recipe');
        expect(recipe.readyInMinutes, 30);
        expect(recipe.servings, 4);
        expect(recipe.instructions, ['Step 1', 'Step 2']);
        expect(recipe.ingredients, [TestData.sampleIngredient1]);
        expect(recipe.cuisines, ['Italian']);
        expect(recipe.dishTypes, ['main course']);
        expect(recipe.diets, isEmpty);
        expect(recipe.vegetarian, false);
        expect(recipe.vegan, false);
        expect(recipe.glutenFree, false);
        expect(recipe.dairyFree, false);
      });

      test('should create Recipe with optional fields', () {
        // Arrange & Act
        final recipe = Recipe(
          id: 1,
          title: 'Test Recipe',
          image: 'https://example.com/image.jpg',
          readyInMinutes: 30,
          servings: 4,
          summary: 'Test summary',
          instructions: ['Step 1'],
          ingredients: [TestData.sampleIngredient1],
          cuisines: ['Italian'],
          dishTypes: ['main course'],
          diets: ['vegetarian'],
          vegetarian: true,
          vegan: false,
          glutenFree: true,
          dairyFree: false,
          spoonacularScore: 85.5,
          healthScore: 72.0,
          sourceUrl: 'https://example.com/recipe',
          savedAt: DateTime(2024, 1, 1),
          triedAt: DateTime(2024, 1, 2),
        );

        // Assert
        expect(recipe.image, 'https://example.com/image.jpg');
        expect(recipe.summary, 'Test summary');
        expect(recipe.diets, ['vegetarian']);
        expect(recipe.vegetarian, true);
        expect(recipe.glutenFree, true);
        expect(recipe.spoonacularScore, 85.5);
        expect(recipe.healthScore, 72.0);
        expect(recipe.sourceUrl, 'https://example.com/recipe');
        expect(recipe.savedAt, DateTime(2024, 1, 1));
        expect(recipe.triedAt, DateTime(2024, 1, 2));
      });
    });

    group('JSON Serialization', () {
      test('should serialize to JSON correctly', () {
        // Arrange
        final recipe = TestData.sampleRecipe1;

        // Act
        final json = recipe.toJson();

        // Assert
        expect(json['id'], 1);
        expect(json['title'], 'Spaghetti Carbonara');
        expect(json['image'], 'https://example.com/carbonara.jpg');
        expect(json['readyInMinutes'], 25);
        expect(json['servings'], 4);
        expect(json['summary'], 'Classic Italian pasta dish with eggs, cheese, and pancetta.');
        expect(json['instructions'], isA<List<String>>());
        expect(json['ingredients'], isA<List>());
        expect(json['cuisines'], ['Italian']);
        expect(json['dishTypes'], ['main course', 'dinner']);
        expect(json['vegetarian'], false);
        expect(json['vegan'], false);
        expect(json['glutenFree'], false);
        expect(json['dairyFree'], false);
        expect(json['spoonacularScore'], 85.5);
        expect(json['healthScore'], 72.0);
        expect(json['sourceUrl'], 'https://example.com/carbonara-recipe');
      });

      test('should deserialize from JSON correctly', () {
        // Arrange
        final json = {
          'id': 1,
          'title': 'Test Recipe',
          'image': 'https://example.com/image.jpg',
          'readyInMinutes': 30,
          'servings': 4,
          'summary': 'Test summary',
          'instructions': ['Step 1', 'Step 2'],
          'ingredients': [
            {
              'id': 1,
              'name': 'test ingredient',
              'original': '1 cup test ingredient',
              'amount': 1.0,
              'unit': 'cup',
              'image': null,
            }
          ],
          'cuisines': ['Italian'],
          'dishTypes': ['main course'],
          'diets': ['vegetarian'],
          'vegetarian': true,
          'vegan': false,
          'glutenFree': true,
          'dairyFree': false,
          'spoonacularScore': 85.5,
          'healthScore': 72.0,
          'sourceUrl': 'https://example.com/recipe',
          'savedAt': null,
          'triedAt': null,
        };

        // Act
        final recipe = Recipe.fromJson(json);

        // Assert
        expect(recipe.id, 1);
        expect(recipe.title, 'Test Recipe');
        expect(recipe.image, 'https://example.com/image.jpg');
        expect(recipe.readyInMinutes, 30);
        expect(recipe.servings, 4);
        expect(recipe.summary, 'Test summary');
        expect(recipe.instructions, ['Step 1', 'Step 2']);
        expect(recipe.ingredients, hasLength(1));
        expect(recipe.ingredients.first.name, 'test ingredient');
        expect(recipe.cuisines, ['Italian']);
        expect(recipe.dishTypes, ['main course']);
        expect(recipe.diets, ['vegetarian']);
        expect(recipe.vegetarian, true);
        expect(recipe.vegan, false);
        expect(recipe.glutenFree, true);
        expect(recipe.dairyFree, false);
        expect(recipe.spoonacularScore, 85.5);
        expect(recipe.healthScore, 72.0);
        expect(recipe.sourceUrl, 'https://example.com/recipe');
        expect(recipe.savedAt, isNull);
        expect(recipe.triedAt, isNull);
      });

      test('should handle round-trip JSON serialization', () {
        // Arrange
        final originalRecipe = TestData.sampleRecipe1;

        // Act
        final json = originalRecipe.toJson();
        final deserializedRecipe = Recipe.fromJson(json);

        // Assert
        expect(deserializedRecipe.id, originalRecipe.id);
        expect(deserializedRecipe.title, originalRecipe.title);
        expect(deserializedRecipe.image, originalRecipe.image);
        expect(deserializedRecipe.readyInMinutes, originalRecipe.readyInMinutes);
        expect(deserializedRecipe.servings, originalRecipe.servings);
        expect(deserializedRecipe.summary, originalRecipe.summary);
        expect(deserializedRecipe.instructions, originalRecipe.instructions);
        expect(deserializedRecipe.ingredients.length, originalRecipe.ingredients.length);
        expect(deserializedRecipe.cuisines, originalRecipe.cuisines);
        expect(deserializedRecipe.dishTypes, originalRecipe.dishTypes);
        expect(deserializedRecipe.diets, originalRecipe.diets);
        expect(deserializedRecipe.vegetarian, originalRecipe.vegetarian);
        expect(deserializedRecipe.vegan, originalRecipe.vegan);
        expect(deserializedRecipe.glutenFree, originalRecipe.glutenFree);
        expect(deserializedRecipe.dairyFree, originalRecipe.dairyFree);
        expect(deserializedRecipe.spoonacularScore, originalRecipe.spoonacularScore);
        expect(deserializedRecipe.healthScore, originalRecipe.healthScore);
        expect(deserializedRecipe.sourceUrl, originalRecipe.sourceUrl);
      });
    });

    group('copyWith', () {
      test('should create copy with updated savedAt', () {
        // Arrange
        final originalRecipe = TestData.sampleRecipe1;
        final newSavedAt = DateTime(2024, 1, 1);

        // Act
        final updatedRecipe = originalRecipe.copyWith(savedAt: newSavedAt);

        // Assert
        expect(updatedRecipe.savedAt, newSavedAt);
        expect(updatedRecipe.triedAt, originalRecipe.triedAt);
        expect(updatedRecipe.id, originalRecipe.id);
        expect(updatedRecipe.title, originalRecipe.title);
        expect(updatedRecipe.image, originalRecipe.image);
      });

      test('should create copy with updated triedAt', () {
        // Arrange
        final originalRecipe = TestData.sampleRecipe1;
        final newTriedAt = DateTime(2024, 1, 2);

        // Act
        final updatedRecipe = originalRecipe.copyWith(triedAt: newTriedAt);

        // Assert
        expect(updatedRecipe.triedAt, newTriedAt);
        expect(updatedRecipe.savedAt, originalRecipe.savedAt);
        expect(updatedRecipe.id, originalRecipe.id);
        expect(updatedRecipe.title, originalRecipe.title);
      });

      test('should create copy with both savedAt and triedAt updated', () {
        // Arrange
        final originalRecipe = TestData.sampleRecipe1;
        final newSavedAt = DateTime(2024, 1, 1);
        final newTriedAt = DateTime(2024, 1, 2);

        // Act
        final updatedRecipe = originalRecipe.copyWith(
          savedAt: newSavedAt,
          triedAt: newTriedAt,
        );

        // Assert
        expect(updatedRecipe.savedAt, newSavedAt);
        expect(updatedRecipe.triedAt, newTriedAt);
        expect(updatedRecipe.id, originalRecipe.id);
        expect(updatedRecipe.title, originalRecipe.title);
      });

      test('should preserve existing values when not specified', () {
        // Arrange
        final originalRecipe = TestData.sampleRecipe1.copyWith(
          savedAt: DateTime(2024, 1, 1),
          triedAt: DateTime(2024, 1, 2),
        );

        // Act
        final updatedRecipe = originalRecipe.copyWith();

        // Assert
        expect(updatedRecipe.savedAt, originalRecipe.savedAt);
        expect(updatedRecipe.triedAt, originalRecipe.triedAt);
        expect(updatedRecipe.id, originalRecipe.id);
        expect(updatedRecipe.title, originalRecipe.title);
      });
    });

    group('Edge Cases', () {
      test('should handle empty lists', () {
        // Arrange & Act
        final recipe = Recipe(
          id: 1,
          title: 'Empty Recipe',
          readyInMinutes: 0,
          servings: 0,
          instructions: [],
          ingredients: [],
          cuisines: [],
          dishTypes: [],
          diets: [],
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
        );

        // Assert
        expect(recipe.instructions, isEmpty);
        expect(recipe.ingredients, isEmpty);
        expect(recipe.cuisines, isEmpty);
        expect(recipe.dishTypes, isEmpty);
        expect(recipe.diets, isEmpty);
      });

      test('should handle null optional fields', () {
        // Arrange & Act
        final recipe = Recipe(
          id: 1,
          title: 'Minimal Recipe',
          readyInMinutes: 30,
          servings: 4,
          instructions: ['Step 1'],
          ingredients: [TestData.sampleIngredient1],
          cuisines: ['Italian'],
          dishTypes: ['main course'],
          diets: [],
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
        );

        // Assert
        expect(recipe.image, isNull);
        expect(recipe.summary, isNull);
        expect(recipe.spoonacularScore, isNull);
        expect(recipe.healthScore, isNull);
        expect(recipe.sourceUrl, isNull);
        expect(recipe.savedAt, isNull);
        expect(recipe.triedAt, isNull);
      });
    });
  });
}
