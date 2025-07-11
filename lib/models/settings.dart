
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'settings.g.dart';

@HiveType(typeId: 2)
@JsonSerializable()
class UserSettings extends HiveObject {
  @HiveField(0)
  final List<String> allergies;

  @HiveField(1)
  final List<String> diets;

  @HiveField(2)
  final List<String> cuisines;

  @HiveField(3)
  final List<String> excludeIngredients;

  @HiveField(4)
  final int maxReadyTime;

  @HiveField(5)
  final bool darkMode;

  @HiveField(6)
  final String apiKey;

  UserSettings({
    required this.allergies,
    required this.diets,
    required this.cuisines,
    required this.excludeIngredients,
    required this.maxReadyTime,
    required this.darkMode,
    required this.apiKey,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) => _$UserSettingsFromJson(json);
  Map<String, dynamic> toJson() => _$UserSettingsToJson(this);

  static UserSettings get defaultSettings => UserSettings(
    allergies: [],
    diets: [],
    cuisines: [],
    excludeIngredients: [],
    maxReadyTime: 60,
    darkMode: true,
    apiKey: '',
  );

  UserSettings copyWith({
    List<String>? allergies,
    List<String>? diets,
    List<String>? cuisines,
    List<String>? excludeIngredients,
    int? maxReadyTime,
    bool? darkMode,
    String? apiKey,
  }) {
    return UserSettings(
      allergies: allergies ?? this.allergies,
      diets: diets ?? this.diets,
      cuisines: cuisines ?? this.cuisines,
      excludeIngredients: excludeIngredients ?? this.excludeIngredients,
      maxReadyTime: maxReadyTime ?? this.maxReadyTime,
      darkMode: darkMode ?? this.darkMode,
      apiKey: apiKey ?? this.apiKey,
    );
  }
}
