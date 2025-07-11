
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';

class RecipeDetailScreen extends ConsumerWidget {
  final Recipe recipe;

  const RecipeDetailScreen({
    super.key,
    required this.recipe,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedRecipes = ref.watch(savedRecipesProvider.notifier);
    final triedRecipes = ref.watch(triedRecipesProvider.notifier);
    final isSaved = savedRecipes.isRecipeSaved(recipe.id);
    final isTried = triedRecipes.isRecipeTried(recipe.id);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                recipe.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      offset: Offset(0, 1),
                      blurRadius: 3,
                      color: Colors.black54,
                    ),
                  ],
                ),
              ),
              background: recipe.image != null
                  ? CachedNetworkImage(
                      imageUrl: recipe.image!,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey[800],
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[800],
                        child: const Icon(
                          Icons.restaurant,
                          size: 64,
                          color: Colors.white54,
                        ),
                      ),
                    )
                  : Container(
                      color: Colors.grey[800],
                      child: const Icon(
                        Icons.restaurant,
                        size: 64,
                        color: Colors.white54,
                      ),
                    ),
            ),
            actions: [
              IconButton(
                onPressed: () {
                  if (isSaved) {
                    savedRecipes.removeRecipe(recipe.id);
                  } else {
                    savedRecipes.saveRecipe(recipe);
                  }
                },
                icon: Icon(
                  isSaved ? Icons.favorite : Icons.favorite_border,
                  color: isSaved ? Colors.red : Colors.white,
                ),
              ),
              IconButton(
                onPressed: () {
                  if (isTried) {
                    triedRecipes.removeFromTried(recipe.id);
                  } else {
                    triedRecipes.markAsTried(recipe);
                  }
                },
                icon: Icon(
                  isTried ? Icons.check_circle : Icons.check_circle_outline,
                  color: isTried ? Colors.green : Colors.white,
                ),
              ),
            ],
          ),

          // Recipe Details
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick Info Row
                  Row(
                    children: [
                      _buildInfoChip(
                        icon: Icons.timer,
                        label: '${recipe.readyInMinutes} min',
                      ),
                      const SizedBox(width: 8),
                      _buildInfoChip(
                        icon: Icons.people,
                        label: '${recipe.servings} servings',
                      ),
                      if (recipe.healthScore != null) ...[
                        const SizedBox(width: 8),
                        _buildInfoChip(
                          icon: Icons.health_and_safety,
                          label: '${recipe.healthScore!.round()}% healthy',
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Diet Tags
                  if (recipe.diets.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: recipe.diets.map((diet) {
                        return Chip(
                          label: Text(diet),
                          backgroundColor: Theme.of(context).primaryColor.withOpacity(0.2),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Summary
                  if (recipe.summary != null) ...[
                    const Text(
                      'Summary',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _stripHtmlTags(recipe.summary!),
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Ingredients
                  const Text(
                    'Ingredients',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...recipe.ingredients.map((ingredient) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.circle,
                            size: 8,
                            color: Colors.grey,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              ingredient.original,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),

                  const SizedBox(height: 24),

                  // Instructions
                  if (recipe.instructions.isNotEmpty) ...[
                    const Text(
                      'Instructions',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...recipe.instructions.asMap().entries.map((entry) {
                      final index = entry.key;
                      final instruction = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  '${index + 1}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                instruction,
                                style: const TextStyle(fontSize: 16),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white70),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  String _stripHtmlTags(String htmlString) {
    final RegExp exp = RegExp(r"<[^>]*>", multiLine: true, caseSensitive: true);
    return htmlString.replaceAll(exp, '');
  }
}
