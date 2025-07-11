
import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/widgets/recipe_card.dart';
import 'package:recipe_slot_app/screens/recipe_detail_screen.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';
import 'package:recipe_slot_app/core/responsive/screen_size.dart';

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
      return ResponsiveBuilder(
        builder: (context, screenSize, constraints) {
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
                ResponsiveText(
                  'No recipes available',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        },
      );
    }

    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        final padding = ResponsiveLayout.getHorizontalPadding(screenSize);
        final isCompact = screenSize.isCompact;
        
        return Column(
      children: [
          // Swipe Instructions
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: padding, 
              vertical: isCompact ? 8 : 12,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSwipeInstruction(
                  icon: Icons.close,
                  color: Colors.red,
                  label: 'Pass',
                  direction: '←',
                  isCompact: isCompact,
                ),
                _buildSwipeInstruction(
                  icon: Icons.favorite,
                  color: Colors.green,
                  label: 'Save',
                  direction: '→',
                  isCompact: isCompact,
                ),
                _buildSwipeInstruction(
                  icon: Icons.check_circle,
                  color: Colors.blue,
                  label: 'Tried',
                  direction: '↑',
                  isCompact: isCompact,
                ),
              ],
            ),
          ),
          
          SizedBox(height: isCompact ? 16 : 20),
          
          // Card Swiper
          Expanded(
            child: CardSwiper(
              controller: _controller,
              cardsCount: widget.recipes.length,
              onSwipe: _onSwipe,
              onUndo: _onUndo,
              numberOfCardsDisplayed: isCompact ? 2 : 3,
              backCardOffset: Offset(
                isCompact ? 30 : 40, 
                isCompact ? 30 : 40,
              ),
              padding: EdgeInsets.all(isCompact ? 16.0 : 24.0),
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
          padding: EdgeInsets.all(padding),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildActionButton(
                icon: Icons.close,
                color: Colors.red,
                onPressed: () => _controller.swipe(CardSwiperDirection.left),
                isCompact: isCompact,
              ),
              _buildActionButton(
                icon: Icons.undo,
                color: Colors.grey,
                onPressed: () => _controller.undo(),
                isCompact: isCompact,
              ),
              _buildActionButton(
                icon: Icons.favorite,
                color: Colors.green,
                onPressed: () => _controller.swipe(CardSwiperDirection.right),
                isCompact: isCompact,
              ),
            ],
          ),
        ),
      ],
    );
      },
    );
  }

  Widget _buildSwipeInstruction({
    required IconData icon,
    required Color color,
    required String label,
    required String direction,
    required bool isCompact,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              direction,
              style: TextStyle(
                fontSize: isCompact ? 14 : 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            SizedBox(width: isCompact ? 3 : 4),
            Icon(
              icon,
              color: color,
              size: isCompact ? 14 : 16,
            ),
          ],
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: isCompact ? 10 : 12,
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
    required bool isCompact,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        shape: BoxShape.circle,
        border: Border.all(color: color, width: isCompact ? 1.5 : 2),
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, color: color),
        iconSize: isCompact ? 24 : 28,
        padding: EdgeInsets.all(isCompact ? 8 : 12),
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
