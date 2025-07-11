/// Semantic screen size classifications for responsive design
enum ScreenSize { 
  small,    // Mobile phones (< 600px)
  medium,   // Large phones, small tablets (600px - 840px)
  large,    // Tablets, small desktops (840px - 1200px)
  xlarge    // Large desktops (> 1200px)
}

/// Extension to provide semantic meaning to screen sizes
extension ScreenSizeExtension on ScreenSize {
  bool get isMobile => this == ScreenSize.small;
  bool get isTablet => this == ScreenSize.medium || this == ScreenSize.large;
  bool get isDesktop => this == ScreenSize.large || this == ScreenSize.xlarge;
  bool get isCompact => this == ScreenSize.small || this == ScreenSize.medium;
  bool get isExpanded => this == ScreenSize.large || this == ScreenSize.xlarge;
}

/// Layout type for navigation patterns
enum NavigationLayout {
  bottomNavigation,  // Mobile: Bottom navigation bar
  navigationRail,    // Tablet: Side navigation rail
  navigationDrawer   // Desktop: Persistent navigation drawer
}

/// Responsive layout utility class
class ResponsiveLayout {
  /// Get semantic screen size based on width
  static ScreenSize getScreenSize(BuildContext context) {
    final double width = MediaQuery.sizeOf(context).width;
    
    if (width >= 1200) return ScreenSize.xlarge;
    if (width >= 840) return ScreenSize.large;
    if (width >= 600) return ScreenSize.medium;
    return ScreenSize.small;
  }
  
  /// Get appropriate navigation layout for current screen size
  static NavigationLayout getNavigationLayout(ScreenSize screenSize) {
    switch (screenSize) {
      case ScreenSize.small:
        return NavigationLayout.bottomNavigation;
      case ScreenSize.medium:
        return NavigationLayout.navigationRail;
      case ScreenSize.large:
      case ScreenSize.xlarge:
        return NavigationLayout.navigationDrawer;
    }
  }
  
  /// Get number of columns for grid layouts
  static int getGridColumns(ScreenSize screenSize) {
    switch (screenSize) {
      case ScreenSize.small:
        return 1;
      case ScreenSize.medium:
        return 2;
      case ScreenSize.large:
        return 3;
      case ScreenSize.xlarge:
        return 4;
    }
  }
  
  /// Get horizontal padding based on screen size
  static double getHorizontalPadding(ScreenSize screenSize) {
    switch (screenSize) {
      case ScreenSize.small:
        return 16.0;
      case ScreenSize.medium:
        return 24.0;
      case ScreenSize.large:
        return 32.0;
      case ScreenSize.xlarge:
        return 48.0;
    }
  }
  
  /// Get maximum content width for readability
  static double getMaxContentWidth(ScreenSize screenSize) {
    switch (screenSize) {
      case ScreenSize.small:
        return double.infinity;
      case ScreenSize.medium:
        return 600.0;
      case ScreenSize.large:
        return 840.0;
      case ScreenSize.xlarge:
        return 1200.0;
    }
  }
}
