import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/core/navigation/adaptive_navigation_shell.dart';

void main() {
  group('AdaptiveNavigationShell', () {
    final testDestinations = [
      const NavigationDestinationData(
        icon: Icons.home_outlined,
        selectedIcon: Icons.home,
        label: 'Home',
      ),
      const NavigationDestinationData(
        icon: Icons.search_outlined,
        selectedIcon: Icons.search,
        label: 'Search',
      ),
    ];

    testWidgets('should show bottom navigation on small screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: AdaptiveNavigationShell(
            destinations: testDestinations,
            selectedIndex: 0,
            onDestinationSelected: (_) {},
            body: const Text('Body Content'),
          ),
        ),
      );
      
      // Should find NavigationBar (Material 3 bottom navigation)
      expect(find.byType(NavigationBar), findsOneWidget);
      expect(find.byType(NavigationRail), findsNothing);
      expect(find.byType(NavigationDrawer), findsNothing);
      
      // Should find the body content
      expect(find.text('Body Content'), findsOneWidget);
    });

    testWidgets('should show navigation rail on medium screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(700, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: AdaptiveNavigationShell(
            destinations: testDestinations,
            selectedIndex: 0,
            onDestinationSelected: (_) {},
            body: const Text('Body Content'),
          ),
        ),
      );
      
      // Should find NavigationRail
      expect(find.byType(NavigationRail), findsOneWidget);
      expect(find.byType(NavigationBar), findsNothing);
      expect(find.byType(NavigationDrawer), findsNothing);
      
      // Should find the body content
      expect(find.text('Body Content'), findsOneWidget);
    });

    testWidgets('should show navigation drawer on large screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1000, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: AdaptiveNavigationShell(
            destinations: testDestinations,
            selectedIndex: 0,
            onDestinationSelected: (_) {},
            body: const Text('Body Content'),
          ),
        ),
      );
      
      // Should find NavigationDrawer
      expect(find.byType(NavigationDrawer), findsOneWidget);
      expect(find.byType(NavigationBar), findsNothing);
      expect(find.byType(NavigationRail), findsNothing);
      
      // Should find the body content
      expect(find.text('Body Content'), findsOneWidget);
    });

    testWidgets('should handle destination selection', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
      int selectedIndex = 0;
      
      await tester.pumpWidget(
        MaterialApp(
          home: StatefulBuilder(
            builder: (context, setState) {
              return AdaptiveNavigationShell(
                destinations: testDestinations,
                selectedIndex: selectedIndex,
                onDestinationSelected: (index) {
                  setState(() {
                    selectedIndex = index;
                  });
                },
                body: Text('Selected: $selectedIndex'),
              );
            },
          ),
        ),
      );
      
      // Tap on the second destination
      await tester.tap(find.text('Search'));
      await tester.pumpAndSettle();
      
      expect(find.text('Selected: 1'), findsOneWidget);
    });

    testWidgets('should include app bar when provided', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: AdaptiveNavigationShell(
            destinations: testDestinations,
            selectedIndex: 0,
            onDestinationSelected: (_) {},
            body: const Text('Body Content'),
            appBar: AppBar(title: const Text('Test App Bar')),
          ),
        ),
      );
      
      expect(find.text('Test App Bar'), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });
  });

  group('ResponsiveAppBar', () {
    testWidgets('should center title on mobile screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: const ResponsiveAppBar(
              title: Text('Test Title'),
            ),
          ),
        ),
      );
      
      final appBar = tester.widget<AppBar>(find.byType(AppBar));
      expect(appBar.centerTitle, true);
    });

    testWidgets('should not center title on desktop screens by default', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: const ResponsiveAppBar(
              title: Text('Test Title'),
            ),
          ),
        ),
      );
      
      final appBar = tester.widget<AppBar>(find.byType(AppBar));
      expect(appBar.centerTitle, false);
    });

    testWidgets('should have no elevation on desktop screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: const ResponsiveAppBar(
              title: Text('Test Title'),
            ),
          ),
        ),
      );
      
      final appBar = tester.widget<AppBar>(find.byType(AppBar));
      expect(appBar.elevation, 0);
      expect(appBar.scrolledUnderElevation, 1);
    });
  });

  group('ResponsiveFloatingActionButton', () {
    testWidgets('should show FAB on mobile screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            floatingActionButton: ResponsiveFloatingActionButton(
              onPressed: () {},
              child: const Icon(Icons.add),
            ),
          ),
        ),
      );
      
      expect(find.byType(FloatingActionButton), findsOneWidget);
    });

    testWidgets('should hide FAB on desktop with navigation drawer', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            floatingActionButton: ResponsiveFloatingActionButton(
              onPressed: () {},
              child: const Icon(Icons.add),
            ),
          ),
        ),
      );
      
      expect(find.byType(FloatingActionButton), findsNothing);
      expect(find.byType(SizedBox), findsOneWidget);
    });
  });
}
