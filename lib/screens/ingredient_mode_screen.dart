
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';
import 'package:recipe_slot_app/widgets/recipe_card_stack.dart';
import 'package:recipe_slot_app/models/recipe.dart';

class IngredientModeScreen extends ConsumerStatefulWidget {
  const IngredientModeScreen({super.key});

  @override
  ConsumerState<IngredientModeScreen> createState() => _IngredientModeScreenState();
}

class _IngredientModeScreenState extends ConsumerState<IngredientModeScreen> {
  final TextEditingController _ingredientController = TextEditingController();
  final List<String> _selectedIngredients = [];
  List<String>? _searchIngredients;

  @override
  void dispose() {
    _ingredientController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchResults = _searchIngredients != null
        ? ref.watch(ingredientSearchProvider(_searchIngredients!))
        : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search by Ingredients'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Ingredient Input Section
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'What ingredients do you have?',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _ingredientController,
                        decoration: const InputDecoration(
                          hintText: 'Enter an ingredient...',
                          prefixIcon: Icon(Icons.add),
                        ),
                        onSubmitted: _addIngredient,
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _addIngredient(_ingredientController.text),
                      child: const Text('Add'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Selected Ingredients
                if (_selectedIngredients.isNotEmpty) ...[
                  const Text(
                    'Selected Ingredients:',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _selectedIngredients.map((ingredient) {
                      return Chip(
                        label: Text(ingredient),
                        deleteIcon: const Icon(Icons.close, size: 18),
                        onDeleted: () => _removeIngredient(ingredient),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _selectedIngredients.isEmpty ? null : _searchRecipes,
                          child: const Text('Search Recipes'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _selectedIngredients.isEmpty ? null : _clearIngredients,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          
          // Search Results Section
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: searchResults?.when(
                data: (recipes) {
                  if (recipes.isEmpty) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search_off,
                            size: 64,
                            color: Colors.grey,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'No recipes found',
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.grey,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Try different ingredients or check your spelling',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Found ${recipes.length} recipes',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: RecipeCardStack(
                          recipes: recipes,
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
                        ),
                      ),
                    ],
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
                      const Text(
                        'Error searching recipes',
                        style: TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        error.toString(),
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          if (_searchIngredients != null) {
                            ref.invalidate(ingredientSearchProvider(_searchIngredients!));
                          }
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ) ?? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.restaurant_menu,
                      size: 64,
                      color: Colors.grey,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Add ingredients to search for recipes',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _addIngredient(String ingredient) {
    final trimmed = ingredient.trim();
    if (trimmed.isNotEmpty && !_selectedIngredients.contains(trimmed)) {
      setState(() {
        _selectedIngredients.add(trimmed);
        _ingredientController.clear();
      });
    }
  }

  void _removeIngredient(String ingredient) {
    setState(() {
      _selectedIngredients.remove(ingredient);
    });
  }

  void _clearIngredients() {
    setState(() {
      _selectedIngredients.clear();
      _searchIngredients = null;
    });
  }

  void _searchRecipes() {
    if (_selectedIngredients.isNotEmpty) {
      setState(() {
        _searchIngredients = List.from(_selectedIngredients);
      });
    }
  }
}
