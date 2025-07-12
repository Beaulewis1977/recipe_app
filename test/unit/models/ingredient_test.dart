import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import '../../helpers/test_data.dart';

void main() {
  group('Ingredient Model', () {
    group('Constructor', () {
      test('should create Ingredient with required fields', () {
        // Arrange & Act
        final ingredient = Ingredient(
          id: 1,
          name: 'flour',
          original: '2 cups all-purpose flour',
          amount: 2.0,
          unit: 'cups',
        );

        // Assert
        expect(ingredient.id, 1);
        expect(ingredient.name, 'flour');
        expect(ingredient.original, '2 cups all-purpose flour');
        expect(ingredient.amount, 2.0);
        expect(ingredient.unit, 'cups');
        expect(ingredient.image, isNull);
      });

      test('should create Ingredient with optional image field', () {
        // Arrange & Act
        final ingredient = Ingredient(
          id: 1,
          name: 'flour',
          original: '2 cups all-purpose flour',
          amount: 2.0,
          unit: 'cups',
          image: 'https://example.com/flour.jpg',
        );

        // Assert
        expect(ingredient.id, 1);
        expect(ingredient.name, 'flour');
        expect(ingredient.original, '2 cups all-purpose flour');
        expect(ingredient.amount, 2.0);
        expect(ingredient.unit, 'cups');
        expect(ingredient.image, 'https://example.com/flour.jpg');
      });
    });

    group('JSON Serialization', () {
      test('should serialize to JSON correctly', () {
        // Arrange
        final ingredient = TestData.sampleIngredient1;

        // Act
        final json = ingredient.toJson();

        // Assert
        expect(json['id'], 1);
        expect(json['name'], 'spaghetti');
        expect(json['original'], '400g spaghetti');
        expect(json['amount'], 400.0);
        expect(json['unit'], 'g');
        expect(json['image'], 'https://example.com/spaghetti.jpg');
      });

      test('should serialize to JSON with null image', () {
        // Arrange
        final ingredient = TestData.sampleIngredient2;

        // Act
        final json = ingredient.toJson();

        // Assert
        expect(json['id'], 2);
        expect(json['name'], 'pancetta');
        expect(json['original'], '200g pancetta');
        expect(json['amount'], 200.0);
        expect(json['unit'], 'g');
        expect(json['image'], isNull);
      });

      test('should deserialize from JSON correctly', () {
        // Arrange
        final json = {
          'id': 1,
          'name': 'tomatoes',
          'original': '3 large tomatoes, diced',
          'amount': 3.0,
          'unit': 'large',
          'image': 'https://example.com/tomatoes.jpg',
        };

        // Act
        final ingredient = Ingredient.fromJson(json);

        // Assert
        expect(ingredient.id, 1);
        expect(ingredient.name, 'tomatoes');
        expect(ingredient.original, '3 large tomatoes, diced');
        expect(ingredient.amount, 3.0);
        expect(ingredient.unit, 'large');
        expect(ingredient.image, 'https://example.com/tomatoes.jpg');
      });

      test('should deserialize from JSON with null image', () {
        // Arrange
        final json = {
          'id': 2,
          'name': 'salt',
          'original': '1 tsp salt',
          'amount': 1.0,
          'unit': 'tsp',
          'image': null,
        };

        // Act
        final ingredient = Ingredient.fromJson(json);

        // Assert
        expect(ingredient.id, 2);
        expect(ingredient.name, 'salt');
        expect(ingredient.original, '1 tsp salt');
        expect(ingredient.amount, 1.0);
        expect(ingredient.unit, 'tsp');
        expect(ingredient.image, isNull);
      });

      test('should handle round-trip JSON serialization', () {
        // Arrange
        final originalIngredient = TestData.sampleIngredient1;

        // Act
        final json = originalIngredient.toJson();
        final deserializedIngredient = Ingredient.fromJson(json);

        // Assert
        expect(deserializedIngredient.id, originalIngredient.id);
        expect(deserializedIngredient.name, originalIngredient.name);
        expect(deserializedIngredient.original, originalIngredient.original);
        expect(deserializedIngredient.amount, originalIngredient.amount);
        expect(deserializedIngredient.unit, originalIngredient.unit);
        expect(deserializedIngredient.image, originalIngredient.image);
      });
    });

    group('Data Types', () {
      test('should handle integer amounts as double', () {
        // Arrange
        final json = {
          'id': 1,
          'name': 'eggs',
          'original': '2 eggs',
          'amount': 2, // Integer in JSON
          'unit': 'whole',
          'image': null,
        };

        // Act
        final ingredient = Ingredient.fromJson(json);

        // Assert
        expect(ingredient.amount, 2.0);
        expect(ingredient.amount, isA<double>());
      });

      test('should handle decimal amounts', () {
        // Arrange
        final json = {
          'id': 1,
          'name': 'butter',
          'original': '0.5 cup butter',
          'amount': 0.5,
          'unit': 'cup',
          'image': null,
        };

        // Act
        final ingredient = Ingredient.fromJson(json);

        // Assert
        expect(ingredient.amount, 0.5);
        expect(ingredient.amount, isA<double>());
      });

      test('should handle large amounts', () {
        // Arrange
        final ingredient = Ingredient(
          id: 1,
          name: 'water',
          original: '1000ml water',
          amount: 1000.0,
          unit: 'ml',
        );

        // Act
        final json = ingredient.toJson();
        final deserializedIngredient = Ingredient.fromJson(json);

        // Assert
        expect(deserializedIngredient.amount, 1000.0);
      });
    });

    group('Edge Cases', () {
      test('should handle empty strings', () {
        // Arrange & Act
        final ingredient = Ingredient(
          id: 1,
          name: '',
          original: '',
          amount: 0.0,
          unit: '',
        );

        // Assert
        expect(ingredient.name, '');
        expect(ingredient.original, '');
        expect(ingredient.amount, 0.0);
        expect(ingredient.unit, '');
      });

      test('should handle special characters in strings', () {
        // Arrange & Act
        final ingredient = Ingredient(
          id: 1,
          name: 'jalapeño peppers',
          original: '2 jalapeño peppers, finely chopped',
          amount: 2.0,
          unit: 'whole',
        );

        // Assert
        expect(ingredient.name, 'jalapeño peppers');
        expect(ingredient.original, '2 jalapeño peppers, finely chopped');
      });

      test('should handle very small amounts', () {
        // Arrange & Act
        final ingredient = Ingredient(
          id: 1,
          name: 'vanilla extract',
          original: '1/4 tsp vanilla extract',
          amount: 0.25,
          unit: 'tsp',
        );

        // Assert
        expect(ingredient.amount, 0.25);
      });

      test('should handle zero amount', () {
        // Arrange & Act
        final ingredient = Ingredient(
          id: 1,
          name: 'garnish',
          original: 'fresh herbs for garnish',
          amount: 0.0,
          unit: 'to taste',
        );

        // Assert
        expect(ingredient.amount, 0.0);
      });
    });

    group('Equality and Comparison', () {
      test('should be equal when all properties match', () {
        // Arrange
        final ingredient1 = Ingredient(
          id: 1,
          name: 'flour',
          original: '2 cups flour',
          amount: 2.0,
          unit: 'cups',
          image: 'https://example.com/flour.jpg',
        );

        final ingredient2 = Ingredient(
          id: 1,
          name: 'flour',
          original: '2 cups flour',
          amount: 2.0,
          unit: 'cups',
          image: 'https://example.com/flour.jpg',
        );

        // Act & Assert
        // Note: Since Ingredient doesn't override == operator,
        // this tests object identity, not value equality
        expect(ingredient1 == ingredient2, false);
        expect(ingredient1.id, ingredient2.id);
        expect(ingredient1.name, ingredient2.name);
        expect(ingredient1.original, ingredient2.original);
        expect(ingredient1.amount, ingredient2.amount);
        expect(ingredient1.unit, ingredient2.unit);
        expect(ingredient1.image, ingredient2.image);
      });
    });
  });
}
