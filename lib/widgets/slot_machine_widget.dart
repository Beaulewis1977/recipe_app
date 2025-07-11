
import 'package:flutter/material.dart';
import 'package:slot_machine_roller/slot_machine_roller.dart';
import 'package:recipe_slot_app/models/recipe.dart';
import 'package:recipe_slot_app/core/responsive/responsive_builder.dart';
import 'package:recipe_slot_app/core/responsive/screen_size.dart';

class SlotMachineWidget extends StatefulWidget {
  final bool isSpinning;
  final Function(List<Recipe>) onSpinComplete;

  const SlotMachineWidget({
    super.key,
    required this.isSpinning,
    required this.onSpinComplete,
  });

  @override
  State<SlotMachineWidget> createState() => _SlotMachineWidgetState();
}

class _SlotMachineWidgetState extends State<SlotMachineWidget> {
  final List<String> _cuisineTypes = [
    '🍕 Italian',
    '🍜 Asian',
    '🌮 Mexican',
    '🍔 American',
    '🥘 Indian',
    '🥗 Mediterranean',
    '🍱 Japanese',
    '🥖 French',
  ];

  final List<String> _mealTypes = [
    '🍳 Breakfast',
    '🥪 Lunch',
    '🍽️ Dinner',
    '🍰 Dessert',
    '🥤 Snack',
    '🍲 Soup',
    '🥙 Appetizer',
    '🍹 Beverage',
  ];

  final List<String> _cookingTimes = [
    '⚡ 15 min',
    '🕐 30 min',
    '🕑 45 min',
    '🕒 60 min',
    '🕓 90 min',
    '🕔 2 hours',
    '🕕 3 hours',
    '🕖 4+ hours',
  ];

  int _cuisineTarget = 0;
  int _mealTarget = 0;
  int _timeTarget = 0;

  @override
  void initState() {
    super.initState();
    _generateRandomTargets();
  }

  @override
  void didUpdateWidget(SlotMachineWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSpinning && !oldWidget.isSpinning) {
      _generateRandomTargets();
      // Simulate spin completion after animation
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          widget.onSpinComplete([]);
        }
      });
    }
  }

  void _generateRandomTargets() {
    setState(() {
      _cuisineTarget = DateTime.now().millisecondsSinceEpoch % _cuisineTypes.length;
      _mealTarget = DateTime.now().millisecondsSinceEpoch % _mealTypes.length;
      _timeTarget = DateTime.now().millisecondsSinceEpoch % _cookingTimes.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, screenSize, constraints) {
        // Adapt layout based on screen size
        final isCompact = screenSize.isCompact;
        final padding = ResponsiveLayout.getHorizontalPadding(screenSize);
        final titleFontSize = isCompact ? 18.0 : 24.0;
        
        return Container(
          padding: EdgeInsets.all(padding),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            children: [
              Text(
                '🎰 Recipe Slot Machine 🎰',
                style: TextStyle(
                  fontSize: titleFontSize,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: isCompact ? 16 : 24),
              Expanded(
                child: _buildSlotLayout(screenSize, isCompact),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSlotLayout(ScreenSize screenSize, bool isCompact) {
    if (isCompact) {
      // Vertical layout for mobile - stack slots vertically
      return Column(
        children: [
          Expanded(
            child: _buildSlotColumn(
              title: 'Cuisine',
              items: _cuisineTypes,
              target: widget.isSpinning ? _cuisineTarget : 0,
              isSpinning: widget.isSpinning,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _buildSlotColumn(
              title: 'Meal Type',
              items: _mealTypes,
              target: widget.isSpinning ? _mealTarget : 0,
              isSpinning: widget.isSpinning,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _buildSlotColumn(
              title: 'Time',
              items: _cookingTimes,
              target: widget.isSpinning ? _timeTarget : 0,
              isSpinning: widget.isSpinning,
            ),
          ),
        ],
      );
    } else {
      // Horizontal layout for tablet/desktop - slots side by side
      return Row(
        children: [
          Expanded(
            child: _buildSlotColumn(
              title: 'Cuisine',
              items: _cuisineTypes,
              target: widget.isSpinning ? _cuisineTarget : 0,
              isSpinning: widget.isSpinning,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildSlotColumn(
              title: 'Meal Type',
              items: _mealTypes,
              target: widget.isSpinning ? _mealTarget : 0,
              isSpinning: widget.isSpinning,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildSlotColumn(
              title: 'Time',
              items: _cookingTimes,
              target: widget.isSpinning ? _timeTarget : 0,
              isSpinning: widget.isSpinning,
            ),
          ),
        ],
      );
    }
  }

  Widget _buildSlotColumn({
    required String title,
    required List<String> items,
    required int target,
    required bool isSpinning,
  }) {
    return Column(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Theme.of(context).primaryColor,
                width: 2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: isSpinning
                  ? SlotMachineRoller(
                      height: double.infinity,
                      width: double.infinity,
                      target: target,
                      itemBuilder: (index) => _buildSlotItem(items[index % items.length]),
                    )
                  : _buildSlotItem(items[target]),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSlotItem(String text) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      alignment: Alignment.center,
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}
