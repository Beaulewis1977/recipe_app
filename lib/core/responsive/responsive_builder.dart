import 'package:flutter/material.dart';
import 'screen_size.dart';

/// A builder widget that provides responsive layout capabilities
class ResponsiveBuilder extends StatelessWidget {
  const ResponsiveBuilder({
    super.key,
    required this.builder,
    this.breakpoints,
  });

  /// Builder function that receives screen size and constraints
  final Widget Function(
    BuildContext context,
    ScreenSize screenSize,
    BoxConstraints constraints,
  ) builder;

  /// Optional custom breakpoints (uses default if not provided)
  final Map<ScreenSize, double>? breakpoints;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final screenSize = ResponsiveLayout.getScreenSize(context);
        return builder(context, screenSize, constraints);
      },
    );
  }
}

/// A widget that shows different layouts based on screen size
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({
    super.key,
    this.small,
    this.medium,
    this.large,
    this.xlarge,
    required this.fallback,
  });

  final Widget? small;
  final Widget? medium;
  final Widget? large;
  final Widget? xlarge;
  final Widget fallback;

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        switch (screenSize) {
          case ScreenSize.small:
            return small ?? fallback;
          case ScreenSize.medium:
            return medium ?? small ?? fallback;
          case ScreenSize.large:
            return large ?? medium ?? small ?? fallback;
          case ScreenSize.xlarge:
            return xlarge ?? large ?? medium ?? small ?? fallback;
        }
      },
    );
  }

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

/// Responsive padding widget
class ResponsivePadding extends StatelessWidget {
  const ResponsivePadding({
    super.key,
    required this.child,
    this.small = 16.0,
    this.medium = 24.0,
    this.large = 32.0,
    this.xlarge = 48.0,
  });

  final Widget child;
  final double small;
  final double medium;
  final double large;
  final double xlarge;

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        double padding;
        switch (screenSize) {
          case ScreenSize.small:
            padding = small;
            break;
          case ScreenSize.medium:
            padding = medium;
            break;
          case ScreenSize.large:
            padding = large;
            break;
          case ScreenSize.xlarge:
            padding = xlarge;
            break;
        }
        
        return Padding(
          padding: EdgeInsets.all(padding),
          child: child,
        );
      },
    );
  }
}

/// Responsive text widget that scales based on screen size
class ResponsiveText extends StatelessWidget {
  const ResponsiveText(
    this.text, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
    this.scaleFactor = 1.0,
  });

  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  final double scaleFactor;

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        double scale = scaleFactor;
        
        // Adjust scale based on screen size
        switch (screenSize) {
          case ScreenSize.small:
            scale *= 0.9;
            break;
          case ScreenSize.medium:
            scale *= 1.0;
            break;
          case ScreenSize.large:
            scale *= 1.1;
            break;
          case ScreenSize.xlarge:
            scale *= 1.2;
            break;
        }
        
        return Text(
          text,
          style: style?.copyWith(
            fontSize: (style?.fontSize ?? 14) * scale,
          ),
          textAlign: textAlign,
          maxLines: maxLines,
          overflow: overflow,
        );
      },
    );
  }
}
