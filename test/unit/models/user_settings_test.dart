import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/models/settings.dart';
import '../../helpers/test_data.dart';

void main() {
  group('UserSettings Model', () {
    group('Constructor', () {
      test('should create UserSettings with all required fields', () {
        // Arrange & Act
        final settings = UserSettings(
          allergies: ['nuts', 'dairy'],
          diets: ['vegetarian'],
          cuisines: ['italian', 'mexican'],
          excludeIngredients: ['onions'],
          maxReadyTime: 45,
          darkMode: true,
          apiKey: 'test-api-key',
        );

        // Assert
        expect(settings.allergies, ['nuts', 'dairy']);
        expect(settings.diets, ['vegetarian']);
        expect(settings.cuisines, ['italian', 'mexican']);
        expect(settings.excludeIngredients, ['onions']);
        expect(settings.maxReadyTime, 45);
        expect(settings.darkMode, true);
        expect(settings.apiKey, 'test-api-key');
      });

      test('should create UserSettings with empty lists', () {
        // Arrange & Act
        final settings = UserSettings(
          allergies: [],
          diets: [],
          cuisines: [],
          excludeIngredients: [],
          maxReadyTime: 60,
          darkMode: false,
          apiKey: '',
        );

        // Assert
        expect(settings.allergies, isEmpty);
        expect(settings.diets, isEmpty);
        expect(settings.cuisines, isEmpty);
        expect(settings.excludeIngredients, isEmpty);
        expect(settings.maxReadyTime, 60);
        expect(settings.darkMode, false);
        expect(settings.apiKey, '');
      });
    });

    group('Default Settings', () {
      test('should provide correct default settings', () {
        // Act
        final defaultSettings = UserSettings.defaultSettings;

        // Assert
        expect(defaultSettings.allergies, isEmpty);
        expect(defaultSettings.diets, isEmpty);
        expect(defaultSettings.cuisines, isEmpty);
        expect(defaultSettings.excludeIngredients, isEmpty);
        expect(defaultSettings.maxReadyTime, 60);
        expect(defaultSettings.darkMode, true);
        expect(defaultSettings.apiKey, '');
      });

      test('should create new instance each time', () {
        // Act
        final settings1 = UserSettings.defaultSettings;
        final settings2 = UserSettings.defaultSettings;

        // Assert
        expect(identical(settings1, settings2), false);
        expect(settings1.allergies, settings2.allergies);
        expect(settings1.diets, settings2.diets);
        expect(settings1.maxReadyTime, settings2.maxReadyTime);
        expect(settings1.darkMode, settings2.darkMode);
        expect(settings1.apiKey, settings2.apiKey);
      });
    });

    group('JSON Serialization', () {
      test('should serialize to JSON correctly', () {
        // Arrange
        final settings = TestData.userSettingsWithAllergies;

        // Act
        final json = settings.toJson();

        // Assert
        expect(json['allergies'], ['nuts', 'dairy', 'gluten']);
        expect(json['diets'], ['vegetarian']);
        expect(json['cuisines'], ['italian']);
        expect(json['excludeIngredients'], ['onions']);
        expect(json['maxReadyTime'], 45);
        expect(json['darkMode'], false);
        expect(json['apiKey'], TestData.validApiKey);
      });

      test('should serialize empty lists correctly', () {
        // Arrange
        final settings = TestData.defaultUserSettings;

        // Act
        final json = settings.toJson();

        // Assert
        expect(json['allergies'], isEmpty);
        expect(json['diets'], isEmpty);
        expect(json['cuisines'], isEmpty);
        expect(json['excludeIngredients'], isEmpty);
        expect(json['maxReadyTime'], 60);
        expect(json['darkMode'], true);
        expect(json['apiKey'], TestData.validApiKey);
      });

      test('should deserialize from JSON correctly', () {
        // Arrange
        final json = {
          'allergies': ['shellfish', 'eggs'],
          'diets': ['vegan', 'gluten-free'],
          'cuisines': ['asian', 'mediterranean'],
          'excludeIngredients': ['cilantro', 'mushrooms'],
          'maxReadyTime': 30,
          'darkMode': false,
          'apiKey': 'test-key-123',
        };

        // Act
        final settings = UserSettings.fromJson(json);

        // Assert
        expect(settings.allergies, ['shellfish', 'eggs']);
        expect(settings.diets, ['vegan', 'gluten-free']);
        expect(settings.cuisines, ['asian', 'mediterranean']);
        expect(settings.excludeIngredients, ['cilantro', 'mushrooms']);
        expect(settings.maxReadyTime, 30);
        expect(settings.darkMode, false);
        expect(settings.apiKey, 'test-key-123');
      });

      test('should handle round-trip JSON serialization', () {
        // Arrange
        final originalSettings = TestData.userSettingsWithAllergies;

        // Act
        final json = originalSettings.toJson();
        final deserializedSettings = UserSettings.fromJson(json);

        // Assert
        expect(deserializedSettings.allergies, originalSettings.allergies);
        expect(deserializedSettings.diets, originalSettings.diets);
        expect(deserializedSettings.cuisines, originalSettings.cuisines);
        expect(deserializedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(deserializedSettings.maxReadyTime, originalSettings.maxReadyTime);
        expect(deserializedSettings.darkMode, originalSettings.darkMode);
        expect(deserializedSettings.apiKey, originalSettings.apiKey);
      });
    });

    group('copyWith', () {
      test('should create copy with updated allergies', () {
        // Arrange
        final originalSettings = TestData.defaultUserSettings;
        final newAllergies = ['nuts', 'dairy'];

        // Act
        final updatedSettings = originalSettings.copyWith(allergies: newAllergies);

        // Assert
        expect(updatedSettings.allergies, newAllergies);
        expect(updatedSettings.diets, originalSettings.diets);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(updatedSettings.maxReadyTime, originalSettings.maxReadyTime);
        expect(updatedSettings.darkMode, originalSettings.darkMode);
        expect(updatedSettings.apiKey, originalSettings.apiKey);
      });

      test('should create copy with updated diets', () {
        // Arrange
        final originalSettings = TestData.defaultUserSettings;
        final newDiets = ['vegetarian', 'gluten-free'];

        // Act
        final updatedSettings = originalSettings.copyWith(diets: newDiets);

        // Assert
        expect(updatedSettings.diets, newDiets);
        expect(updatedSettings.allergies, originalSettings.allergies);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(updatedSettings.maxReadyTime, originalSettings.maxReadyTime);
        expect(updatedSettings.darkMode, originalSettings.darkMode);
        expect(updatedSettings.apiKey, originalSettings.apiKey);
      });

      test('should create copy with updated maxReadyTime', () {
        // Arrange
        final originalSettings = TestData.defaultUserSettings;
        const newMaxReadyTime = 30;

        // Act
        final updatedSettings = originalSettings.copyWith(maxReadyTime: newMaxReadyTime);

        // Assert
        expect(updatedSettings.maxReadyTime, newMaxReadyTime);
        expect(updatedSettings.allergies, originalSettings.allergies);
        expect(updatedSettings.diets, originalSettings.diets);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(updatedSettings.darkMode, originalSettings.darkMode);
        expect(updatedSettings.apiKey, originalSettings.apiKey);
      });

      test('should create copy with updated darkMode', () {
        // Arrange
        final originalSettings = TestData.defaultUserSettings;
        const newDarkMode = false;

        // Act
        final updatedSettings = originalSettings.copyWith(darkMode: newDarkMode);

        // Assert
        expect(updatedSettings.darkMode, newDarkMode);
        expect(updatedSettings.allergies, originalSettings.allergies);
        expect(updatedSettings.diets, originalSettings.diets);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(updatedSettings.maxReadyTime, originalSettings.maxReadyTime);
        expect(updatedSettings.apiKey, originalSettings.apiKey);
      });

      test('should create copy with updated apiKey', () {
        // Arrange
        final originalSettings = TestData.defaultUserSettings;
        const newApiKey = 'new-api-key-456';

        // Act
        final updatedSettings = originalSettings.copyWith(apiKey: newApiKey);

        // Assert
        expect(updatedSettings.apiKey, newApiKey);
        expect(updatedSettings.allergies, originalSettings.allergies);
        expect(updatedSettings.diets, originalSettings.diets);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(updatedSettings.maxReadyTime, originalSettings.maxReadyTime);
        expect(updatedSettings.darkMode, originalSettings.darkMode);
      });

      test('should create copy with multiple fields updated', () {
        // Arrange
        final originalSettings = TestData.defaultUserSettings;
        final newAllergies = ['nuts'];
        final newDiets = ['vegetarian'];
        const newMaxReadyTime = 45;
        const newDarkMode = false;
        const newApiKey = 'multi-update-key';

        // Act
        final updatedSettings = originalSettings.copyWith(
          allergies: newAllergies,
          diets: newDiets,
          maxReadyTime: newMaxReadyTime,
          darkMode: newDarkMode,
          apiKey: newApiKey,
        );

        // Assert
        expect(updatedSettings.allergies, newAllergies);
        expect(updatedSettings.diets, newDiets);
        expect(updatedSettings.maxReadyTime, newMaxReadyTime);
        expect(updatedSettings.darkMode, newDarkMode);
        expect(updatedSettings.apiKey, newApiKey);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
      });

      test('should preserve existing values when not specified', () {
        // Arrange
        final originalSettings = TestData.userSettingsWithAllergies;

        // Act
        final updatedSettings = originalSettings.copyWith();

        // Assert
        expect(updatedSettings.allergies, originalSettings.allergies);
        expect(updatedSettings.diets, originalSettings.diets);
        expect(updatedSettings.cuisines, originalSettings.cuisines);
        expect(updatedSettings.excludeIngredients, originalSettings.excludeIngredients);
        expect(updatedSettings.maxReadyTime, originalSettings.maxReadyTime);
        expect(updatedSettings.darkMode, originalSettings.darkMode);
        expect(updatedSettings.apiKey, originalSettings.apiKey);
      });
    });

    group('Edge Cases', () {
      test('should handle very long lists', () {
        // Arrange
        final longList = List.generate(100, (index) => 'item$index');

        // Act
        final settings = UserSettings(
          allergies: longList,
          diets: longList,
          cuisines: longList,
          excludeIngredients: longList,
          maxReadyTime: 60,
          darkMode: true,
          apiKey: 'test-key',
        );

        // Assert
        expect(settings.allergies, hasLength(100));
        expect(settings.diets, hasLength(100));
        expect(settings.cuisines, hasLength(100));
        expect(settings.excludeIngredients, hasLength(100));
      });

      test('should handle extreme maxReadyTime values', () {
        // Arrange & Act
        final settingsMin = UserSettings(
          allergies: [],
          diets: [],
          cuisines: [],
          excludeIngredients: [],
          maxReadyTime: 0,
          darkMode: true,
          apiKey: 'test-key',
        );

        final settingsMax = UserSettings(
          allergies: [],
          diets: [],
          cuisines: [],
          excludeIngredients: [],
          maxReadyTime: 999999,
          darkMode: true,
          apiKey: 'test-key',
        );

        // Assert
        expect(settingsMin.maxReadyTime, 0);
        expect(settingsMax.maxReadyTime, 999999);
      });

      test('should handle special characters in strings', () {
        // Arrange & Act
        final settings = UserSettings(
          allergies: ['nuts & seeds', 'dairy/lactose'],
          diets: ['gluten-free', 'low-carb'],
          cuisines: ['mexican/tex-mex', 'asian (chinese)'],
          excludeIngredients: ['onions & garlic'],
          maxReadyTime: 60,
          darkMode: true,
          apiKey: 'key-with-special-chars!@#\$%',
        );

        // Assert
        expect(settings.allergies, contains('nuts & seeds'));
        expect(settings.diets, contains('gluten-free'));
        expect(settings.cuisines, contains('mexican/tex-mex'));
        expect(settings.excludeIngredients, contains('onions & garlic'));
        expect(settings.apiKey, 'key-with-special-chars!@#\$%');
      });
    });
  });
}
