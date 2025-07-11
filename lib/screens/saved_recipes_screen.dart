
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';
import 'package:recipe_slot_app/widgets/recipe_list_item.dart';
import 'package:recipe_slot_app/screens/recipe_detail_screen.dart';

class SavedRecipesScreen extends ConsumerWidget {
  const SavedRecipesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedRecipes = ref.watch(savedRecipesProvider);
    final triedRecipes = ref.watch(triedRecipesProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Recipes'),
          centerTitle: true,
          bottom: const TabBar(
            tabs: [
              Tab(
                icon: Icon(Icons.favorite),
                text: 'Saved',
              ),
              Tab(
                icon: Icon(Icons.check_circle),
                text: 'Tried',
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Saved Recipes Tab
            _buildRecipeList(
              context,
              ref,
              savedRecipes,
              'No saved recipes yet',
              'Save recipes by swiping right in Spin or Ingredient mode',
              Icons.favorite_border,
            ),
            
            // Tried Recipes Tab
            _buildRecipeList(
              context,
              ref,
              triedRecipes,
              'No tried recipes yet',
              'Mark recipes as tried by swiping up in Spin or Ingredient mode',
              Icons.check_circle_outline,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecipeList(
    BuildContext context,
    WidgetRef ref,
    List<dynamic> recipes,
    String emptyTitle,
    String emptySubtitle,
    IconData emptyIcon,
  ) {
    if (recipes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              emptyIcon,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              emptyTitle,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                emptySubtitle,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: recipes.length,
      itemBuilder: (context, index) {
        final recipe = recipes[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: RecipeListItem(
            recipe: recipe,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => RecipeDetailScreen(recipe: recipe),
                ),
              );
            },
            onRemove: () {
              _showRemoveDialog(context, ref, recipe);
            },
          ),
        );
      },
    );
  }

  void _showRemoveDialog(BuildContext context, WidgetRef ref, dynamic recipe) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Recipe'),
        content: Text('Are you sure you want to remove "${recipe.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Determine which list to remove from based on recipe properties
              if (recipe.savedAt != null) {
                ref.read(savedRecipesProvider.notifier).removeRecipe(recipe.id);
              }
              if (recipe.triedAt != null) {
                ref.read(triedRecipesProvider.notifier).removeFromTried(recipe.id);
              }
              Navigator.of(context).pop();
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }
}
