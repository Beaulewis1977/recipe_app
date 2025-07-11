
# 🤝 Contributing to Recipe Slot App

> **Welcome to the Recipe Slot App community! We're excited to have you contribute to making recipe discovery more fun and accessible for everyone.**

---

## 🌟 Ways to Contribute

We welcome all types of contributions, from code to documentation to design feedback:

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new features and improvements
- 💻 **Code Contributions**: Implement features, fix bugs, improve performance
- 📚 **Documentation**: Improve guides, tutorials, and API docs
- 🎨 **Design**: UI/UX improvements and accessibility enhancements
- 🧪 **Testing**: Help test new features and report issues
- 🌍 **Localization**: Translate the app to new languages
- 💡 **Ideas**: Share creative ideas for the app's future

---

## 🚀 Getting Started

### 1. **Set Up Your Development Environment**

#### **For Mobile Development (Flutter)**
```bash
# Clone the repository
git clone <repository-url>
cd recipe_slot_app

# Install Flutter dependencies
flutter pub get

# Generate code files
flutter packages pub run build_runner build

# Run the app
flutter run
```

#### **For Web Development (Next.js)**
```bash
# Navigate to web app directory
cd app

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma db push

# Start development server
yarn dev
```

### 2. **Get Your Spoonacular API Key**
- Visit [Spoonacular API](https://spoonacular.com/food-api)
- Sign up for a free account
- Copy your API key and add it to your environment configuration

### 3. **Explore the Codebase**
- Read through the [README.md](README.md) for project overview
- Check out the [TODO.md](TODO.md) for feature ideas
- Browse existing issues on GitHub for contribution opportunities

---

## 📋 Contribution Process

### **1. Find or Create an Issue**
- Browse [existing issues](https://github.com/your-repo/issues) for something to work on
- Look for issues labeled `good-first-issue` if you're new to the project
- Create a new issue if you've found a bug or have a feature idea
- Comment on the issue to let others know you're working on it

### **2. Fork and Branch**
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/recipe_slot_app.git
cd recipe_slot_app

# Create a new branch for your feature
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### **3. Make Your Changes**
- Write clean, readable code that follows our style guidelines
- Add tests for new functionality
- Update documentation as needed
- Ensure your changes don't break existing functionality

### **4. Test Your Changes**
```bash
# For Flutter
flutter test
flutter analyze

# For Next.js
cd app
yarn test
yarn lint
yarn build
```

### **5. Commit and Push**
```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add ingredient substitution suggestions"

# Push to your fork
git push origin feature/your-feature-name
```

### **6. Create a Pull Request**
- Go to your fork on GitHub
- Click "New Pull Request"
- Fill out the PR template with details about your changes
- Link any related issues
- Wait for review and address any feedback

---

## 📝 Code Style Guidelines

### **Flutter/Dart Code Style**
- Follow the [Dart Style Guide](https://dart.dev/guides/language/effective-dart/style)
- Use `flutter format` to format your code
- Run `flutter analyze` to check for issues
- Use meaningful variable and function names
- Add comments for complex logic

```dart
// Good
class RecipeCard extends StatelessWidget {
  final Recipe recipe;
  final VoidCallback onSave;
  
  const RecipeCard({
    Key? key,
    required this.recipe,
    required this.onSave,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          // Widget implementation
        ],
      ),
    );
  }
}
```

### **TypeScript/React Code Style**
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Use functional components with hooks
- Follow React best practices

```typescript
// Good
interface RecipeCardProps {
  recipe: Recipe;
  onSave: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave();
    } finally {
      setIsLoading(false);
    }
  }, [onSave]);
  
  return (
    <div className="recipe-card">
      {/* Component implementation */}
    </div>
  );
};
```

### **General Guidelines**
- **Naming**: Use descriptive names for variables, functions, and classes
- **Comments**: Write comments for complex logic, not obvious code
- **File Organization**: Keep files focused and well-organized
- **Error Handling**: Always handle errors gracefully
- **Performance**: Consider performance implications of your changes

---

## 🧪 Testing Guidelines

### **Writing Tests**
- Write unit tests for new functions and classes
- Write integration tests for complex features
- Test edge cases and error conditions
- Ensure tests are fast and reliable

### **Flutter Testing**
```dart
// Example widget test
testWidgets('RecipeCard displays recipe information', (WidgetTester tester) async {
  final recipe = Recipe(
    id: '1',
    title: 'Test Recipe',
    image: 'test.jpg',
  );
  
  await tester.pumpWidget(
    MaterialApp(
      home: RecipeCard(recipe: recipe, onSave: () {}),
    ),
  );
  
  expect(find.text('Test Recipe'), findsOneWidget);
});
```

### **Next.js Testing**
```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { RecipeCard } from './RecipeCard';

test('renders recipe title', () => {
  const recipe = {
    id: '1',
    title: 'Test Recipe',
    image: 'test.jpg',
  };
  
  render(<RecipeCard recipe={recipe} onSave={() => {}} />);
  
  expect(screen.getByText('Test Recipe')).toBeInTheDocument();
});
```

---

## 📚 Documentation Guidelines

### **Code Documentation**
- Document public APIs and complex functions
- Use JSDoc for TypeScript and Dart doc comments for Dart
- Include examples in documentation when helpful

### **README Updates**
- Update the README if you add new features
- Include setup instructions for new dependencies
- Add screenshots for UI changes

### **Changelog Updates**
- Add your changes to [CHANGELOG.md](CHANGELOG.md)
- Follow the established format
- Include issue numbers and PR links

---

## 🐛 Bug Report Guidelines

When reporting bugs, please include:

### **Bug Report Template**
```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.0, Android 12]
- App Version: [e.g. 1.0.0]
- Browser (if web): [e.g. Chrome 96, Safari 15]

## Additional Context
Any other context about the problem.
```

---

## ✨ Feature Request Guidelines

When requesting features, please include:

### **Feature Request Template**
```markdown
## Feature Description
A clear description of what you want to happen.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe the solution you'd like.

## Alternative Solutions
Describe any alternative solutions you've considered.

## Additional Context
Any other context, mockups, or examples.

## Priority
How important is this feature to you? (Low/Medium/High)
```

---

## 🏷️ Issue Labels

We use labels to organize and prioritize issues:

### **Type Labels**
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `question`: Further information is requested

### **Priority Labels**
- `priority-high`: Critical issues that need immediate attention
- `priority-medium`: Important issues for next release
- `priority-low`: Nice-to-have improvements

### **Difficulty Labels**
- `good-first-issue`: Good for newcomers
- `help-wanted`: Extra attention is needed
- `advanced`: Requires deep knowledge of the codebase

### **Platform Labels**
- `flutter`: Related to mobile app
- `nextjs`: Related to web app
- `api`: Related to API integration
- `ui/ux`: Related to user interface/experience

---

## 🎯 Contribution Recognition

We value all contributions and recognize them in several ways:

### **Contributors List**
- All contributors are listed in our README
- GitHub automatically tracks contributions
- Special recognition for significant contributions

### **Contributor Badges**
- First-time contributors get a special mention
- Regular contributors get recognition badges
- Top contributors may be invited to join the core team

### **Community Highlights**
- Outstanding contributions are highlighted in release notes
- Community contributions are shared on social media
- Contributors may be featured in blog posts or interviews

---

## 📞 Getting Help

Need help with your contribution? Here are ways to get support:

### **GitHub Discussions**
- Use GitHub Discussions for general questions
- Search existing discussions before creating new ones
- Tag your questions appropriately

### **Discord/Slack Community**
- Join our community chat for real-time help
- Connect with other contributors
- Get quick answers to development questions

### **Direct Contact**
- Email: [BeauRecipeApp@gmail.com](mailto:BeauRecipeApp@gmail.com)
- Include "Contribution Help" in the subject line
- Provide context about what you're working on

---

## 🔒 Security Considerations

### **Reporting Security Issues**
- **DO NOT** create public issues for security vulnerabilities
- Email security issues directly to [BeauRecipeApp@gmail.com](mailto:BeauRecipeApp@gmail.com)
- Include "SECURITY" in the subject line
- Provide detailed information about the vulnerability

### **Security Best Practices**
- Never commit API keys or sensitive data
- Use environment variables for configuration
- Follow secure coding practices
- Keep dependencies up to date

---

## 📜 Code of Conduct

### **Our Pledge**
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### **Our Standards**
Examples of behavior that contributes to creating a positive environment include:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### **Unacceptable Behavior**
Examples of unacceptable behavior include:
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### **Enforcement**
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting [BeauRecipeApp@gmail.com](mailto:BeauRecipeApp@gmail.com). All complaints will be reviewed and investigated promptly and fairly.

---

## 🎉 Thank You!

Thank you for taking the time to contribute to the Recipe Slot App! Your contributions help make cooking more accessible and enjoyable for users around the world.

Every contribution, no matter how small, makes a difference. Whether you're fixing a typo, adding a feature, or helping other contributors, you're part of making this project better.

**Happy Contributing! 🍳✨**

---

*This contributing guide is maintained by [Beau Lewis](mailto:BeauRecipeApp@gmail.com) and the Recipe Slot App community.*

**Last Updated**: June 26, 2024
