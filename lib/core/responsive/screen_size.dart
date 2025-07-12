import 'package:flutter/material.dart';

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


