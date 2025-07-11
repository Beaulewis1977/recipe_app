
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:recipe_slot_app/providers/recipe_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _maxTimeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final settings = ref.read(userSettingsProvider);
      _apiKeyController.text = settings.apiKey;
      _maxTimeController.text = settings.maxReadyTime.toString();
    });
  }

  @override
  void dispose() {
    _apiKeyController.dispose();
    _maxTimeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(userSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // API Key Section
          _buildSection(
            title: 'API Configuration',
            children: [
              TextField(
                controller: _apiKeyController,
                decoration: const InputDecoration(
                  labelText: 'Spoonacular API Key',
                  hintText: 'Enter your API key',
                  helperText: 'Get your free API key from spoonacular.com',
                ),
                onChanged: (value) {
                  ref.read(userSettingsProvider.notifier).updateApiKey(value);
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Dietary Preferences Section
          _buildSection(
            title: 'Dietary Preferences',
            children: [
              _buildMultiSelectChips(
                title: 'Diets',
                options: const [
                  'vegetarian',
                  'vegan',
                  'gluten free',
                  'ketogenic',
                  'paleo',
                  'pescetarian',
                  'dairy free',
                ],
                selectedValues: settings.diets,
                onChanged: (values) {
                  ref.read(userSettingsProvider.notifier).updateDiets(values);
                },
              ),
              const SizedBox(height: 16),
              _buildMultiSelectChips(
                title: 'Allergies',
                options: const [
                  'dairy',
                  'egg',
                  'gluten',
                  'grain',
                  'peanut',
                  'seafood',
                  'sesame',
                  'shellfish',
                  'soy',
                  'sulfite',
                  'tree nut',
                  'wheat',
                ],
                selectedValues: settings.allergies,
                onChanged: (values) {
                  ref.read(userSettingsProvider.notifier).updateAllergies(values);
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Cuisine Preferences Section
          _buildSection(
            title: 'Cuisine Preferences',
            children: [
              _buildMultiSelectChips(
                title: 'Preferred Cuisines',
                options: const [
                  'african',
                  'american',
                  'british',
                  'cajun',
                  'caribbean',
                  'chinese',
                  'eastern european',
                  'european',
                  'french',
                  'german',
                  'greek',
                  'indian',
                  'irish',
                  'italian',
                  'japanese',
                  'jewish',
                  'korean',
                  'latin american',
                  'mediterranean',
                  'mexican',
                  'middle eastern',
                  'nordic',
                  'southern',
                  'spanish',
                  'thai',
                  'vietnamese',
                ],
                selectedValues: settings.cuisines,
                onChanged: (values) {
                  ref.read(userSettingsProvider.notifier).updateCuisines(values);
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Recipe Preferences Section
          _buildSection(
            title: 'Recipe Preferences',
            children: [
              TextField(
                controller: _maxTimeController,
                decoration: const InputDecoration(
                  labelText: 'Maximum Ready Time (minutes)',
                  hintText: 'e.g., 60',
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  final time = int.tryParse(value) ?? 60;
                  ref.read(userSettingsProvider.notifier).updateMaxReadyTime(time);
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // About Section
          _buildSection(
            title: 'About',
            children: [
              ListTile(
                leading: const Icon(Icons.info),
                title: const Text('App Version'),
                subtitle: const Text('1.0.0'),
                contentPadding: EdgeInsets.zero,
              ),
              ListTile(
                leading: const Icon(Icons.code),
                title: const Text('Powered by Spoonacular API'),
                subtitle: const Text('Recipe data provided by Spoonacular'),
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }

  Widget _buildMultiSelectChips({
    required String title,
    required List<String> options,
    required List<String> selectedValues,
    required Function(List<String>) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: options.map((option) {
            final isSelected = selectedValues.contains(option);
            return FilterChip(
              label: Text(option),
              selected: isSelected,
              onSelected: (selected) {
                final newValues = List<String>.from(selectedValues);
                if (selected) {
                  newValues.add(option);
                } else {
                  newValues.remove(option);
                }
                onChanged(newValues);
              },
            );
          }).toList(),
        ),
      ],
    );
  }
}
