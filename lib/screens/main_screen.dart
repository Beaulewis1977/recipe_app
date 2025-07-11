
import 'package:flutter/material.dart';
import 'package:recipe_slot_app/screens/spin_mode_screen.dart';
import 'package:recipe_slot_app/screens/ingredient_mode_screen.dart';
import 'package:recipe_slot_app/screens/saved_recipes_screen.dart';
import 'package:recipe_slot_app/screens/settings_screen.dart';
import 'package:recipe_slot_app/core/navigation/adaptive_navigation_shell.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const SpinModeScreen(),
    const IngredientModeScreen(),
    const SavedRecipesScreen(),
    const SettingsScreen(),
  ];

  final List<NavigationDestinationData> _destinations = [
    const NavigationDestinationData(
      icon: Icons.casino_outlined,
      selectedIcon: Icons.casino,
      label: 'Spin',
    ),
    const NavigationDestinationData(
      icon: Icons.search_outlined,
      selectedIcon: Icons.search,
      label: 'Ingredients',
    ),
    const NavigationDestinationData(
      icon: Icons.favorite_outline,
      selectedIcon: Icons.favorite,
      label: 'Saved',
    ),
    const NavigationDestinationData(
      icon: Icons.settings_outlined,
      selectedIcon: Icons.settings,
      label: 'Settings',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return AdaptiveNavigationShell(
      destinations: _destinations,
      selectedIndex: _currentIndex,
      onDestinationSelected: (index) {
        setState(() {
          _currentIndex = index;
        });
      },
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
    );
  }
}
