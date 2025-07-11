
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/models/settings.dart';
import 'package:recipe_slot_app/theme/app_theme.dart';
import 'package:recipe_slot_app/screens/main_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Register adapters
  Hive.registerAdapter(RecipeAdapter());
  Hive.registerAdapter(UserSettingsAdapter());
  
  // Open boxes
  await Hive.openBox<Recipe>('saved_recipes');
  await Hive.openBox<Recipe>('tried_recipes');
  await Hive.openBox<UserSettings>('user_settings');
  
  runApp(
    const ProviderScope(
      child: RecipeSlotApp(),
    ),
  );
}

class RecipeSlotApp extends StatelessWidget {
  const RecipeSlotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Recipe Slot App',
      theme: AppTheme.darkTheme,
      home: const MainScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
