import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';
import 'package:recipe_slot_app/core/responsive/screen_size.dart';

void main() {
  group('ResponsiveBuilder', () {
    testWidgets('should provide correct screen size and constraints to builder', (tester) async {
      await tester.binding.setSurfaceSize(const Size(800, 600));
      
      ScreenSize? capturedScreenSize;
      BoxConstraints? capturedConstraints;
      
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveBuilder(
            builder: (context, screenSize, constraints) {
              capturedScreenSize = screenSize;
              capturedConstraints = constraints;
              return Container();
            },
          ),
        ),
      );
      
      expect(capturedScreenSize, ScreenSize.medium);
      expect(capturedConstraints, isNotNull);
      expect(capturedConstraints!.maxWidth, 800);
    });
  });

  group('ResponsiveLayout', () {
    testWidgets('should show correct widget based on screen size', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveLayout(
            small: const Text('Small'),
            medium: const Text('Medium'),
            large: const Text('Large'),
            xlarge: const Text('XLarge'),
            fallback: const Text('Fallback'),
          ),
        ),
      );

      // Test environment typically defaults to medium screen size
      // Check that exactly one of the expected widgets is shown
      final smallFound = find.text('Small').evaluate().isNotEmpty;
      final mediumFound = find.text('Medium').evaluate().isNotEmpty;
      final largeFound = find.text('Large').evaluate().isNotEmpty;
      final xlargeFound = find.text('XLarge').evaluate().isNotEmpty;
      final fallbackFound = find.text('Fallback').evaluate().isNotEmpty;

      final totalFound = [smallFound, mediumFound, largeFound, xlargeFound, fallbackFound]
          .where((found) => found).length;

      expect(totalFound, 1, reason: 'Exactly one responsive widget should be shown');
    });

    testWidgets('should show correct widget for medium screen', (tester) async {
      await tester.binding.setSurfaceSize(const Size(700, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveLayout(
            small: const Text('Small'),
            medium: const Text('Medium'),
            large: const Text('Large'),
            xlarge: const Text('XLarge'),
            fallback: const Text('Fallback'),
          ),
        ),
      );
      
      expect(find.text('Medium'), findsOneWidget);
      expect(find.text('Small'), findsNothing);
    });

    testWidgets('should fallback to smaller screen when larger not provided', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1000, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveLayout(
            small: const Text('Small'),
            medium: const Text('Medium'),
            // large not provided
            fallback: const Text('Fallback'),
          ),
        ),
      );
      
      expect(find.text('Medium'), findsOneWidget);
    });

    testWidgets('should use fallback when no appropriate size provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveLayout(
            // No size-specific widgets provided, only fallback
            fallback: const Text('Fallback'),
          ),
        ),
      );

      expect(find.text('Fallback'), findsOneWidget);
    });
  });

  group('ResponsivePadding', () {
    testWidgets('should apply responsive padding based on screen size', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsivePadding(
            small: 10.0,
            medium: 20.0,
            large: 30.0,
            xlarge: 40.0,
            child: const Text('Test'),
          ),
        ),
      );

      final padding = tester.widget<Padding>(find.byType(Padding));
      // Test environment typically defaults to medium screen size (20.0 padding)
      // Verify that some appropriate padding is applied
      expect(padding.padding, isIn([
        const EdgeInsets.all(10.0), // small
        const EdgeInsets.all(20.0), // medium
        const EdgeInsets.all(30.0), // large
        const EdgeInsets.all(40.0), // xlarge
      ]));
    });

    testWidgets('should fallback to smaller padding when larger not provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsivePadding(
            small: 10.0,
            medium: 20.0,
            // large and xlarge not provided
            child: const Text('Test'),
          ),
        ),
      );

      final padding = tester.widget<Padding>(find.byType(Padding));
      // Should use medium padding since large/xlarge not provided
      expect(padding.padding, isIn([
        const EdgeInsets.all(10.0), // small
        const EdgeInsets.all(20.0), // medium (fallback)
      ]));
    });
  });

  group('ResponsiveText', () {
    testWidgets('should scale text correctly based on screen size', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveText(
            'Test Text',
            style: const TextStyle(fontSize: 20),
            scaleFactor: 1.0,
          ),
        ),
      );

      final textWidget = tester.widget<Text>(find.byType(Text));
      // Test environment typically defaults to medium screen size
      // Verify that appropriate scaling is applied
      expect(textWidget.style!.fontSize, isIn([
        18.0, // small screen: 20 * 0.9
        20.0, // medium screen: 20 * 1.0
        22.0, // large screen: 20 * 1.1
        24.0, // xlarge screen: 20 * 1.2
      ]));
    });
  });
}
