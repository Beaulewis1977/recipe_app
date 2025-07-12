import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/models/recipe.dart';

void main() {
  group('Simple Recipe Test', () {
    test('should create a basic recipe', () {
      // Arrange
      final ingredient = Ingredient(
        id: 1,
        name: 'test ingredient',
        original: '1 cup test ingredient',
        amount: 1.0,
        unit: 'cup',
      );

      // Act
      final recipe = Recipe(
        id: 1,
        title: 'Test Recipe',
        readyInMinutes: 30,
        servings: 4,
        instructions: ['Step 1'],
        ingredients: [ingredient],
        cuisines: ['Test'],
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
      expect(recipe.instructions, ['Step 1']);
      expect(recipe.ingredients, hasLength(1));
      expect(recipe.ingredients.first.name, 'test ingredient');
      expect(recipe.cuisines, ['Test']);
      expect(recipe.dishTypes, ['main course']);
      expect(recipe.diets, isEmpty);
      expect(recipe.vegetarian, false);
      expect(recipe.vegan, false);
      expect(recipe.glutenFree, false);
      expect(recipe.dairyFree, false);
    });
  });
}
