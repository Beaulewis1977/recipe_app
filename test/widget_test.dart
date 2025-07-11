
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/main.dart';

void main() {
  testWidgets('Recipe Slot App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: RecipeSlotApp(),
      ),
    );

    // Verify that the app starts with the main screen
    expect(find.text('Recipe Slot Machine'), findsOneWidget);
    expect(find.byType(BottomNavigationBar), findsOneWidget);

    // Verify bottom navigation items
    expect(find.text('Spin'), findsOneWidget);
    expect(find.text('Ingredients'), findsOneWidget);
    expect(find.text('Saved'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
  });

  testWidgets('Bottom navigation test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: RecipeSlotApp(),
      ),
    );

    // Tap on the Ingredients tab
    await tester.tap(find.text('Ingredients'));
    await tester.pumpAndSettle();

    // Verify we're on the ingredients screen
    expect(find.text('Search by Ingredients'), findsOneWidget);

    // Tap on the Settings tab
    await tester.tap(find.text('Settings'));
    await tester.pumpAndSettle();

    // Verify we're on the settings screen
    expect(find.text('Settings'), findsOneWidget);
  });
}
