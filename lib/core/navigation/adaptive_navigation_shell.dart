import 'package:flutter/material.dart';
import '../responsive/responsive_builder.dart';
import '../responsive/screen_size.dart';

/// Navigation destination data
class NavigationDestinationData {
  const NavigationDestinationData({
    required this.icon,
    required this.selectedIcon,
    required this.label,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
}

/// Adaptive navigation shell that changes navigation pattern based on screen size
class AdaptiveNavigationShell extends StatelessWidget {
  const AdaptiveNavigationShell({
    super.key,
    required this.destinations,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.body,
    this.appBar,
    this.floatingActionButton,
  });

  final List<NavigationDestinationData> destinations;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        final navigationLayout = ResponsiveLayout.getNavigationLayout(screenSize);
        
        switch (navigationLayout) {
          case NavigationLayout.bottomNavigation:
            return _buildBottomNavigation(context, screenSize);
          case NavigationLayout.navigationRail:
            return _buildNavigationRail(context, screenSize);
          case NavigationLayout.navigationDrawer:
            return _buildNavigationDrawer(context, screenSize);
        }
      },
    );
  }

  Widget _buildBottomNavigation(BuildContext context, ScreenSize screenSize) {
    return Scaffold(
      appBar: appBar,
      body: body,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: onDestinationSelected,
        destinations: destinations.map((dest) => NavigationDestination(
          icon: Icon(dest.icon),
          selectedIcon: Icon(dest.selectedIcon),
          label: dest.label,
        )).toList(),
      ),
    );
  }

  Widget _buildNavigationRail(BuildContext context, ScreenSize screenSize) {
    return Scaffold(
      appBar: appBar,
      floatingActionButton: floatingActionButton,
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: selectedIndex,
            onDestinationSelected: onDestinationSelected,
            labelType: NavigationRailLabelType.all,
            destinations: destinations.map((dest) => NavigationRailDestination(
              icon: Icon(dest.icon),
              selectedIcon: Icon(dest.selectedIcon),
              label: Text(dest.label),
            )).toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: body),
        ],
      ),
    );
  }

  Widget _buildNavigationDrawer(BuildContext context, ScreenSize screenSize) {
    return Scaffold(
      appBar: appBar,
      floatingActionButton: floatingActionButton,
      body: Row(
        children: [
          NavigationDrawer(
            selectedIndex: selectedIndex,
            onDestinationSelected: onDestinationSelected,
            children: [
              const DrawerHeader(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.deepPurple, Colors.purple],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Icon(
                      Icons.restaurant_menu,
                      size: 48,
                      color: Colors.white,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Recipe Slot App',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              ...destinations.asMap().entries.map((entry) {
                final index = entry.key;
                final dest = entry.value;
                return NavigationDrawerDestination(
                  icon: Icon(dest.icon),
                  selectedIcon: Icon(dest.selectedIcon),
                  label: Text(dest.label),
                );
              }).toList(),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: body),
        ],
      ),
    );
  }
}

/// Responsive app bar that adapts to screen size
class ResponsiveAppBar extends StatelessWidget implements PreferredSizeWidget {
  const ResponsiveAppBar({
    super.key,
    this.title,
    this.actions,
    this.leading,
    this.automaticallyImplyLeading = true,
    this.centerTitle,
  });

  final Widget? title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool automaticallyImplyLeading;
  final bool? centerTitle;

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        // Adjust app bar based on screen size
        bool shouldCenterTitle = centerTitle ?? screenSize.isMobile;
        
        return AppBar(
          title: title,
          actions: actions,
          leading: leading,
          automaticallyImplyLeading: automaticallyImplyLeading,
          centerTitle: shouldCenterTitle,
          elevation: screenSize.isDesktop ? 0 : null,
          scrolledUnderElevation: screenSize.isDesktop ? 1 : null,
        );
      },
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

/// Responsive floating action button that adapts to screen size
class ResponsiveFloatingActionButton extends StatelessWidget {
  const ResponsiveFloatingActionButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.tooltip,
    this.heroTag,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final String? tooltip;
  final Object? heroTag;

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        // Hide FAB on desktop with navigation drawer
        if (screenSize.isDesktop && 
            ResponsiveLayout.getNavigationLayout(screenSize) == NavigationLayout.navigationDrawer) {
          return const SizedBox.shrink();
        }
        
        return FloatingActionButton(
          onPressed: onPressed,
          tooltip: tooltip,
          heroTag: heroTag,
          child: child,
        );
      },
    );
  }
}
