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
    testWidgets('should show correct widget for small screen', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
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
      
      expect(find.text('Small'), findsOneWidget);
      expect(find.text('Medium'), findsNothing);
      expect(find.text('Large'), findsNothing);
      expect(find.text('XLarge'), findsNothing);
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
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveLayout(
            // small not provided
            medium: const Text('Medium'),
            fallback: const Text('Fallback'),
          ),
        ),
      );
      
      expect(find.text('Fallback'), findsOneWidget);
    });
  });

  group('ResponsivePadding', () {
    testWidgets('should apply correct padding for small screen', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
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
      expect(padding.padding, const EdgeInsets.all(10.0));
    });

    testWidgets('should apply correct padding for large screen', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1000, 800));
      
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
      expect(padding.padding, const EdgeInsets.all(30.0));
    });
  });

  group('ResponsiveText', () {
    testWidgets('should scale text correctly for different screen sizes', (tester) async {
      // Test small screen
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
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
      expect(textWidget.style!.fontSize, 18.0); // 20 * 0.9 for small screen
      
      // Test large screen
      await tester.binding.setSurfaceSize(const Size(1000, 800));
      await tester.pumpWidget(
        MaterialApp(
          home: ResponsiveText(
            'Test Text',
            style: const TextStyle(fontSize: 20),
            scaleFactor: 1.0,
          ),
        ),
      );
      
      final textWidgetLarge = tester.widget<Text>(find.byType(Text));
      expect(textWidgetLarge.style!.fontSize, 22.0); // 20 * 1.1 for large screen
    });
  });
}
