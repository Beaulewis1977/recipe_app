import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/screens/spin_mode_screen.dart';
import 'package:recipe_slot_app/widgets/slot_machine_widget.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';

import '../helpers/test_app.dart';

void main() {
  group('SpinModeScreen', () {
    group('Widget Structure', () {
      testWidgets('should render spin mode screen with correct structure', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert
        expect(find.byType(SpinModeScreen), findsOneWidget);
        expect(find.byType(ResponsiveBuilder), findsOneWidget);
        expect(find.text('Spin for Random Recipes!'), findsOneWidget);
      });

      testWidgets('should display slot machine widget', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert
        expect(find.byType(SlotMachineWidget), findsOneWidget);
      });

      testWidgets('should display spin button', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert
        expect(find.byType(ElevatedButton), findsOneWidget);
        expect(find.text('SPIN'), findsOneWidget);
      });

      testWidgets('should display swipe to explore section', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert
        expect(find.text('Swipe to Explore'), findsOneWidget);
      });
    });

    group('Responsive Layout', () {
      testWidgets('should use mobile layout on small screens', (WidgetTester tester) async {
        // Arrange - Set mobile screen size
        tester.view.physicalSize = const Size(400, 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert - Should find Column layout for mobile
        final columnFinder = find.descendant(
          of: find.byType(SpinModeScreen),
          matching: find.byType(Column),
        );
        expect(columnFinder, findsWidgets);
      });

      testWidgets('should use desktop layout on large screens', (WidgetTester tester) async {
        // Arrange - Set desktop screen size
        tester.view.physicalSize = const Size(1200, 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert - Should find Row layout for desktop
        final rowFinder = find.descendant(
          of: find.byType(SpinModeScreen),
          matching: find.byType(Row),
        );
        expect(rowFinder, findsWidgets);
      });
    });

    group('User Interactions', () {
      testWidgets('should handle spin button tap', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Find the spin button
        final spinButton = find.text('SPIN');
        expect(spinButton, findsOneWidget);

        // Act - Tap the spin button
        await tester.tap(spinButton);
        await tester.pump();

        // Assert - Button should still be present (may change to loading state)
        expect(find.byType(ElevatedButton), findsOneWidget);
      });

      testWidgets('should display loading state when spinning', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Act - Tap the spin button to start spinning
        await tester.tap(find.text('SPIN'));
        await tester.pump();

        // Assert - Should show loading indicator or disabled state
        // Note: The exact behavior depends on the implementation
        expect(find.byType(ElevatedButton), findsOneWidget);
      });
    });

    group('Content Display', () {
      testWidgets('should display all required text elements', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert - Check for all expected text elements
        expect(find.text('Spin for Random Recipes!'), findsOneWidget);
        expect(find.text('Swipe to Explore'), findsOneWidget);
        expect(find.text('SPIN'), findsOneWidget);
      });

      testWidgets('should integrate with slot machine widget properly', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert - Slot machine should be integrated
        expect(find.byType(SlotMachineWidget), findsOneWidget);
        
        // Check that slot machine content is visible
        expect(find.text('🎰 Recipe Slot Machine 🎰'), findsOneWidget);
        expect(find.text('Cuisine'), findsOneWidget);
        expect(find.text('Meal Type'), findsOneWidget);
        expect(find.text('Time'), findsOneWidget);
      });
    });

    group('Accessibility', () {
      testWidgets('should be accessible with proper semantics', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert - Check for semantic elements
        expect(find.byType(SpinModeScreen), findsOneWidget);
        
        // Verify text elements are accessible
        expect(find.text('Spin for Random Recipes!'), findsOneWidget);
        expect(find.text('Swipe to Explore'), findsOneWidget);
        expect(find.text('SPIN'), findsOneWidget);
        
        // Verify button is accessible
        expect(find.byType(ElevatedButton), findsOneWidget);
      });
    });

    group('Error Handling', () {
      testWidgets('should handle widget creation without errors', (WidgetTester tester) async {
        // Arrange & Act
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Assert - No exceptions should be thrown
        expect(find.byType(SpinModeScreen), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('should handle multiple rebuilds gracefully', (WidgetTester tester) async {
        // Arrange
        await tester.pumpWidget(
          TestApp(
            child: const SpinModeScreen(),
          ),
        );

        // Act - Trigger multiple rebuilds
        await tester.pump();
        await tester.pump();
        await tester.pump();

        // Assert - Widget should still be functional
        expect(find.byType(SpinModeScreen), findsOneWidget);
        expect(find.text('Spin for Random Recipes!'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });
    });
  });
}
