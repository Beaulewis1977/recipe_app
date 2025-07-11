import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/core/responsive/screen_size.dart';

void main() {
  group('ScreenSize', () {
    testWidgets('should return small for mobile screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(400, 800));
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              final screenSize = ResponsiveLayout.getScreenSize(context);
              expect(screenSize, ScreenSize.small);
              expect(screenSize.isMobile, true);
              expect(screenSize.isCompact, true);
              return Container();
            },
          ),
        ),
      );
    });

    testWidgets('should return medium for large mobile/small tablet screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(700, 800));
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              final screenSize = ResponsiveLayout.getScreenSize(context);
              expect(screenSize, ScreenSize.medium);
              expect(screenSize.isTablet, true);
              expect(screenSize.isCompact, true);
              return Container();
            },
          ),
        ),
      );
    });

    testWidgets('should return large for tablet screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1000, 800));
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              final screenSize = ResponsiveLayout.getScreenSize(context);
              expect(screenSize, ScreenSize.large);
              expect(screenSize.isTablet, true);
              expect(screenSize.isDesktop, true);
              expect(screenSize.isExpanded, true);
              return Container();
            },
          ),
        ),
      );
    });

    testWidgets('should return xlarge for desktop screens', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1400, 1000));
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              final screenSize = ResponsiveLayout.getScreenSize(context);
              expect(screenSize, ScreenSize.xlarge);
              expect(screenSize.isDesktop, true);
              expect(screenSize.isExpanded, true);
              return Container();
            },
          ),
        ),
      );
    });
  });

  group('NavigationLayout', () {
    test('should return bottom navigation for small screens', () {
      final layout = ResponsiveLayout.getNavigationLayout(ScreenSize.small);
      expect(layout, NavigationLayout.bottomNavigation);
    });

    test('should return navigation rail for medium screens', () {
      final layout = ResponsiveLayout.getNavigationLayout(ScreenSize.medium);
      expect(layout, NavigationLayout.navigationRail);
    });

    test('should return navigation drawer for large screens', () {
      final layout = ResponsiveLayout.getNavigationLayout(ScreenSize.large);
      expect(layout, NavigationLayout.navigationDrawer);
    });

    test('should return navigation drawer for xlarge screens', () {
      final layout = ResponsiveLayout.getNavigationLayout(ScreenSize.xlarge);
      expect(layout, NavigationLayout.navigationDrawer);
    });
  });

  group('Grid Columns', () {
    test('should return correct grid columns for each screen size', () {
      expect(ResponsiveLayout.getGridColumns(ScreenSize.small), 1);
      expect(ResponsiveLayout.getGridColumns(ScreenSize.medium), 2);
      expect(ResponsiveLayout.getGridColumns(ScreenSize.large), 3);
      expect(ResponsiveLayout.getGridColumns(ScreenSize.xlarge), 4);
    });
  });

  group('Horizontal Padding', () {
    test('should return correct padding for each screen size', () {
      expect(ResponsiveLayout.getHorizontalPadding(ScreenSize.small), 16.0);
      expect(ResponsiveLayout.getHorizontalPadding(ScreenSize.medium), 24.0);
      expect(ResponsiveLayout.getHorizontalPadding(ScreenSize.large), 32.0);
      expect(ResponsiveLayout.getHorizontalPadding(ScreenSize.xlarge), 48.0);
    });
  });

  group('Max Content Width', () {
    test('should return correct max width for each screen size', () {
      expect(ResponsiveLayout.getMaxContentWidth(ScreenSize.small), double.infinity);
      expect(ResponsiveLayout.getMaxContentWidth(ScreenSize.medium), 600.0);
      expect(ResponsiveLayout.getMaxContentWidth(ScreenSize.large), 840.0);
      expect(ResponsiveLayout.getMaxContentWidth(ScreenSize.xlarge), 1200.0);
    });
  });
}
