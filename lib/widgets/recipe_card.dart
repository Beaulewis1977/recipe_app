
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:recipe_slot_app/models/recipe.dart';

class RecipeCard extends StatelessWidget {
  final Recipe recipe;
  final double horizontalThreshold;
  final double verticalThreshold;

  const RecipeCard({
    super.key,
    required this.recipe,
    required this.horizontalThreshold,
    required this.verticalThreshold,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            // Background Image
            Positioned.fill(
              child: recipe.image != null
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

            // Gradient Overlay
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                    stops: const [0.5, 1.0],
                  ),
                ),
              ),
            ),

            // Swipe Direction Indicators
            if (horizontalThreshold > 0.1)
              Positioned.fill(
                child: Container(
                  color: Colors.green.withOpacity(0.3),
                  child: const Center(
                    child: Icon(
                      Icons.favorite,
                      size: 64,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            if (horizontalThreshold < -0.1)
              Positioned.fill(
                child: Container(
                  color: Colors.red.withOpacity(0.3),
                  child: const Center(
                    child: Icon(
                      Icons.close,
                      size: 64,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            if (verticalThreshold < -0.1)
              Positioned.fill(
                child: Container(
                  color: Colors.blue.withOpacity(0.3),
                  child: const Center(
                    child: Icon(
                      Icons.check_circle,
                      size: 64,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),

            // Recipe Information
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Title
                    Text(
                      recipe.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    
                    const SizedBox(height: 12),
                    
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
                            label: '${recipe.healthScore!.round()}%',
                          ),
                        ],
                      ],
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Diet Tags
                    if (recipe.diets.isNotEmpty)
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: recipe.diets.take(3).map((diet) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              diet,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    
                    const SizedBox(height: 16),
                    
                    // Tap to view hint
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.touch_app,
                            size: 16,
                            color: Colors.white70,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Tap to view details',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white70),
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
}
