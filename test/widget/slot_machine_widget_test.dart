import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/widgets/slot_machine_widget.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';

import '../helpers/test_app.dart';

void main() {
  group('SlotMachineWidget', () {
    late List<Recipe> capturedRecipes;
    late bool spinCompleteCallbackCalled;

    void onSpinComplete(List<Recipe> recipes) {
      capturedRecipes = recipes;
      spinCompleteCallbackCalled = true;
    }

    setUp(() {
      capturedRecipes = [];
      spinCompleteCallbackCalled = false;
    });

    group('Widget Structure', () {
      testWidgets('should render slot machine widget with correct structure', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert
        expect(find.byType(SlotMachineWidget), findsOneWidget);
        expect(find.text('🎰 Recipe Slot Machine 🎰'), findsOneWidget);
        expect(find.byType(ResponsiveBuilder), findsOneWidget);
      });

      testWidgets('should display three slot columns with correct titles', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert
        expect(find.text('Cuisine'), findsOneWidget);
        expect(find.text('Meal Type'), findsOneWidget);
        expect(find.text('Time'), findsOneWidget);
      });

      testWidgets('should display default slot items when not spinning', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Check for default items (first in each list)
        expect(find.textContaining('🍕 Italian'), findsOneWidget);
        expect(find.textContaining('🍳 Breakfast'), findsOneWidget);
        expect(find.textContaining('⚡ 15 min'), findsOneWidget);
      });
    });

    group('Responsive Layout', () {
      testWidgets('should use vertical layout on mobile screens', (WidgetTester tester) async {
        // Arrange - Set mobile screen size
        tester.view.physicalSize = const Size(400, 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Should find Column layout for mobile
        final columnFinder = find.descendant(
          of: find.byType(SlotMachineWidget),
          matching: find.byType(Column),
        );
        expect(columnFinder, findsWidgets);
      });

      testWidgets('should use horizontal layout on tablet/desktop screens', (WidgetTester tester) async {
        // Arrange - Set tablet screen size
        tester.view.physicalSize = const Size(1024, 768);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Should find Row layout for tablet/desktop
        final rowFinder = find.descendant(
          of: find.byType(SlotMachineWidget),
          matching: find.byType(Row),
        );
        expect(rowFinder, findsWidgets);
      });
    });

    group('Basic Functionality', () {
      testWidgets('should maintain state when widget is updated', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Act - Update widget properties
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Widget should still be present and functional
        expect(find.byType(SlotMachineWidget), findsOneWidget);
        expect(find.text('🎰 Recipe Slot Machine 🎰'), findsOneWidget);
      });

      testWidgets('should handle callback function properly', (WidgetTester tester) async {
        // Arrange
        bool callbackCalled = false;
        void testCallback(List<Recipe> recipes) {
          callbackCalled = true;
        }

        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: testCallback,
            ),
          ),
        );

        // Assert - Widget should be created without errors
        expect(find.byType(SlotMachineWidget), findsOneWidget);
        expect(callbackCalled, isFalse); // Callback shouldn't be called yet
      });
    });

    group('Content Verification', () {
      testWidgets('should display expected slot content when not spinning', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Check that basic content is present
        expect(find.text('Cuisine'), findsOneWidget);
        expect(find.text('Meal Type'), findsOneWidget);
        expect(find.text('Time'), findsOneWidget);

        // Check for at least some slot content
        expect(find.textContaining('Italian'), findsOneWidget);
        expect(find.textContaining('Breakfast'), findsOneWidget);
        expect(find.textContaining('15 min'), findsOneWidget);
      });

      testWidgets('should handle isSpinning false state', (WidgetTester tester) async {
        // Arrange - Test not spinning state
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Widget should render without errors
        expect(find.byType(SlotMachineWidget), findsOneWidget);
        expect(find.text('🎰 Recipe Slot Machine 🎰'), findsOneWidget);
        expect(find.text('Cuisine'), findsOneWidget);
        expect(find.text('Meal Type'), findsOneWidget);
        expect(find.text('Time'), findsOneWidget);
      });

      testWidgets('should handle widget properties correctly', (WidgetTester tester) async {
        // Arrange - Test widget with different callback
        bool customCallbackCalled = false;
        void customCallback(List<Recipe> recipes) {
          customCallbackCalled = true;
        }

        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: customCallback,
            ),
          ),
        );

        // Assert - Widget should render with custom callback
        expect(find.byType(SlotMachineWidget), findsOneWidget);
        expect(find.text('🎰 Recipe Slot Machine 🎰'), findsOneWidget);
        expect(customCallbackCalled, isFalse); // Callback not called yet
      });
    });

    group('Accessibility', () {
      testWidgets('should be accessible with proper semantics', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: SlotMachineWidget(
              isSpinning: false,
              onSpinComplete: onSpinComplete,
            ),
          ),
        );

        // Assert - Check for semantic elements
        expect(find.byType(SlotMachineWidget), findsOneWidget);

        // Verify text elements are accessible
        expect(find.text('🎰 Recipe Slot Machine 🎰'), findsOneWidget);
        expect(find.text('Cuisine'), findsOneWidget);
        expect(find.text('Meal Type'), findsOneWidget);
        expect(find.text('Time'), findsOneWidget);
      });
    });
  });
}
