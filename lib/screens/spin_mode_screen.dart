
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';
import 'package:recipe_slot_app/widgets/slot_machine_widget.dart';
import 'package:recipe_slot_app/widgets/recipe_card_stack.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';
import 'package:recipe_slot_app/core/responsive/screen_size.dart';

class SpinModeScreen extends ConsumerStatefulWidget {
  const SpinModeScreen({super.key});

  @override
  ConsumerState<SpinModeScreen> createState() => _SpinModeScreenState();
}

class _SpinModeScreenState extends ConsumerState<SpinModeScreen> {
  List<Recipe> _currentRecipes = [];
  bool _isSpinning = false;

  @override
  Widget build(BuildContext context) {
    final randomRecipesAsync = ref.watch(randomRecipesProvider(10));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recipe Slot Machine'),
        centerTitle: true,
      ),
      body: ResponsiveBuilder(
        builder: (context, screenSize, constraints) {
          final isCompact = screenSize.isCompact;
          final padding = ResponsiveLayout.getHorizontalPadding(screenSize);
          
          if (isCompact) {
            // Mobile layout - vertical stack (preserve existing design)
            return Column(
              children: [
                // Slot Machine Section
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: EdgeInsets.all(padding),
              child: Column(
                children: [
                  Text(
                    'Spin for Random Recipes!',
                    style: TextStyle(
                      fontSize: screenSize.isMobile ? 20 : 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: screenSize.isMobile ? 12 : 20),
                  Expanded(
                    child: SlotMachineWidget(
                      isSpinning: _isSpinning,
                      onSpinComplete: (recipes) {
                        setState(() {
                          _currentRecipes = recipes;
                          _isSpinning = false;
                        });
                      },
                    ),
                  ),
                  SizedBox(height: screenSize.isMobile ? 12 : 20),
                  ElevatedButton(
                    onPressed: _isSpinning ? null : _startSpin,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 40,
                        vertical: 16,
                      ),
                      textStyle: const TextStyle(fontSize: 18),
                    ),
                    child: _isSpinning
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('SPIN'),
                  ),
                ],
              ),
            ),
          ),
          
          // Recipe Cards Section
          Expanded(
            flex: 3,
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Swipe to Explore',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: randomRecipesAsync.when(
                      data: (recipes) {
                        if (_currentRecipes.isEmpty && recipes.isNotEmpty) {
                          _currentRecipes = recipes;
                        }
                        return RecipeCardStack(
                          recipes: _currentRecipes,
                          onSwipeLeft: (recipe) {
                            // Recipe dismissed
                          },
                          onSwipeRight: (recipe) {
                            ref.read(savedRecipesProvider.notifier).saveRecipe(recipe);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${recipe.title} saved!'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          onSwipeUp: (recipe) {
                            ref.read(triedRecipesProvider.notifier).markAsTried(recipe);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${recipe.title} marked as tried!'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                        );
                      },
                      loading: () => const Center(
                        child: CircularProgressIndicator(),
                      ),
                      error: (error, stack) => Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Error loading recipes',
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              error.toString(),
                              style: Theme.of(context).textTheme.bodyMedium,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                ref.invalidate(randomRecipesProvider);
                              },
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    } else {
      // Tablet/Desktop layout - side by side
      return Row(
        children: [
          // Slot Machine Section
          Expanded(
            flex: 1,
            child: Container(
              padding: EdgeInsets.all(padding),
              child: Column(
                children: [
                  ResponsiveText(
                    'Spin for Random Recipes!',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: SlotMachineWidget(
                      isSpinning: _isSpinning,
                      onSpinComplete: (recipes) {
                        setState(() {
                          _currentRecipes = recipes;
                          _isSpinning = false;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _isSpinning ? null : _startSpin,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 40,
                        vertical: 16,
                      ),
                      textStyle: const TextStyle(fontSize: 18),
                    ),
                    child: _isSpinning
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('SPIN'),
                  ),
                ],
              ),
            ),
          ),
          
          // Recipe Cards Section
          Expanded(
            flex: 1,
            child: Container(
              padding: EdgeInsets.all(padding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveText(
                    'Swipe to Explore',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: randomRecipesAsync.when(
                      data: (recipes) {
                        if (_currentRecipes.isEmpty && recipes.isNotEmpty) {
                          _currentRecipes = recipes;
                        }
                        return RecipeCardStack(
                          recipes: _currentRecipes,
                          onSwipeLeft: (recipe) {
                            // Recipe dismissed
                          },
                          onSwipeRight: (recipe) {
                            ref.read(savedRecipesProvider.notifier).saveRecipe(recipe);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${recipe.title} saved!'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          onSwipeUp: (recipe) {
                            ref.read(triedRecipesProvider.notifier).markAsTried(recipe);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${recipe.title} marked as tried!'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                        );
                      },
                      loading: () => const Center(
                        child: CircularProgressIndicator(),
                      ),
                      error: (error, stack) => Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Error loading recipes',
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              error.toString(),
                              style: Theme.of(context).textTheme.bodyMedium,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                ref.invalidate(randomRecipesProvider);
                              },
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
        }
      },
        ),
    );
  }

  void _startSpin() {
    setState(() {
      _isSpinning = true;
    });
    
    // Refresh recipes
    ref.invalidate(randomRecipesProvider);
  }
}
