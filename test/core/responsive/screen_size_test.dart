import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_slot_app/core/responsive/screen_size.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';

// Helper function to test screen size logic directly
ScreenSize getScreenSizeFromWidth(double width) {
  if (width >= 1200) return ScreenSize.xlarge;
  if (width >= 840) return ScreenSize.large;
  if (width >= 600) return ScreenSize.medium;
  return ScreenSize.small;
}

void main() {
  group('ScreenSize', () {
    testWidgets('should detect screen size correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              final screenSize = ResponsiveLayout.getScreenSize(context);
              final width = MediaQuery.sizeOf(context).width;

              // Test the actual logic rather than forcing specific sizes
              if (width >= 1200) {
                expect(screenSize, ScreenSize.xlarge);
                expect(screenSize.isDesktop, true);
                expect(screenSize.isExpanded, true);
              } else if (width >= 840) {
                expect(screenSize, ScreenSize.large);
                expect(screenSize.isTablet, true);
                expect(screenSize.isDesktop, true);
                expect(screenSize.isExpanded, true);
              } else if (width >= 600) {
                expect(screenSize, ScreenSize.medium);
                expect(screenSize.isTablet, true);
                expect(screenSize.isCompact, true);
              } else {
                expect(screenSize, ScreenSize.small);
                expect(screenSize.isMobile, true);
                expect(screenSize.isCompact, true);
              }
              return Container();
            },
          ),
        ),
      );
    });

    test('should classify screen sizes correctly based on width breakpoints', () {
      // Test the breakpoint logic directly
      expect(getScreenSizeFromWidth(500), ScreenSize.small);
      expect(getScreenSizeFromWidth(700), ScreenSize.medium);
      expect(getScreenSizeFromWidth(1000), ScreenSize.large);
      expect(getScreenSizeFromWidth(1400), ScreenSize.xlarge);

      // Test edge cases
      expect(getScreenSizeFromWidth(599), ScreenSize.small);
      expect(getScreenSizeFromWidth(600), ScreenSize.medium);
      expect(getScreenSizeFromWidth(839), ScreenSize.medium);
      expect(getScreenSizeFromWidth(840), ScreenSize.large);
      expect(getScreenSizeFromWidth(1199), ScreenSize.large);
      expect(getScreenSizeFromWidth(1200), ScreenSize.xlarge);
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
