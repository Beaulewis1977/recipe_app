
import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/widgets/recipe_card.dart';
import 'package:recipe_slot_app/screens/recipe_detail_screen.dart';

class RecipeCardStack extends StatefulWidget {
  final List<Recipe> recipes;
  final Function(Recipe) onSwipeLeft;
  final Function(Recipe) onSwipeRight;
  final Function(Recipe) onSwipeUp;

  const RecipeCardStack({
    super.key,
    required this.recipes,
    required this.onSwipeLeft,
    required this.onSwipeRight,
    required this.onSwipeUp,
  });

  @override
  State<RecipeCardStack> createState() => _RecipeCardStackState();
}

class _RecipeCardStackState extends State<RecipeCardStack> {
  late CardSwiperController _controller;

  @override
  void initState() {
    super.initState();
    _controller = CardSwiperController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.recipes.isEmpty) {
      return const Center(
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
              'No recipes available',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Swipe Instructions
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildSwipeInstruction(
                icon: Icons.close,
                color: Colors.red,
                label: 'Pass',
                direction: '←',
              ),
              _buildSwipeInstruction(
                icon: Icons.favorite,
                color: Colors.green,
                label: 'Save',
                direction: '→',
              ),
              _buildSwipeInstruction(
                icon: Icons.check_circle,
                color: Colors.blue,
                label: 'Tried',
                direction: '↑',
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Card Swiper
        Expanded(
          child: CardSwiper(
            controller: _controller,
            cardsCount: widget.recipes.length,
            onSwipe: _onSwipe,
            onUndo: _onUndo,
            numberOfCardsDisplayed: 3,
            backCardOffset: const Offset(40, 40),
            padding: const EdgeInsets.all(24.0),
            cardBuilder: (context, index, horizontalThreshold, verticalThreshold) {
              final recipe = widget.recipes[index];
              return GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => RecipeDetailScreen(recipe: recipe),
                    ),
                  );
                },
                child: RecipeCard(
                  recipe: recipe,
                  horizontalThreshold: horizontalThreshold,
                  verticalThreshold: verticalThreshold,
                ),
              );
            },
          ),
        ),
        
        // Action Buttons
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildActionButton(
                icon: Icons.close,
                color: Colors.red,
                onPressed: () => _controller.swipe(CardSwiperDirection.left),
              ),
              _buildActionButton(
                icon: Icons.undo,
                color: Colors.grey,
                onPressed: () => _controller.undo(),
              ),
              _buildActionButton(
                icon: Icons.favorite,
                color: Colors.green,
                onPressed: () => _controller.swipe(CardSwiperDirection.right),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSwipeInstruction({
    required IconData icon,
    required Color color,
    required String label,
    required String direction,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              direction,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              icon,
              color: color,
              size: 16,
            ),
          ],
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 2),
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, color: color),
        iconSize: 28,
      ),
    );
  }

  bool _onSwipe(
    int previousIndex,
    int? currentIndex,
    CardSwiperDirection direction,
  ) {
    final recipe = widget.recipes[previousIndex];
    
    switch (direction) {
      case CardSwiperDirection.left:
        widget.onSwipeLeft(recipe);
        break;
      case CardSwiperDirection.right:
        widget.onSwipeRight(recipe);
        break;
      case CardSwiperDirection.top:
        widget.onSwipeUp(recipe);
        break;
      case CardSwiperDirection.bottom:
        // Handle swipe down if needed
        break;
    }
    
    return true;
  }

  bool _onUndo(
    int? previousIndex,
    int currentIndex,
    CardSwiperDirection direction,
  ) {
    return true;
  }
}
