# Next Agent Research Guide
**For Comprehensive Testing Implementation**

## 🔍 Context7 Research Required

### 1. Flutter Widget Testing Patterns
```bash
# Research Topics:
- "flutter widget testing best practices 2024"
- "flutter testwidgets pumping and settling"
- "flutter widget testing with riverpod providers"
- "flutter responsive widget testing"
- "flutter golden tests implementation"
```

### 2. Riverpod Testing Strategies
```bash
# Research Topics:
- "riverpod widget testing provider overrides"
- "riverpod testing with mocktail"
- "riverpod async provider testing"
- "riverpod state notifier testing"
```

### 3. Flutter Integration Testing
```bash
# Research Topics:
- "flutter integration testing best practices"
- "flutter integration test cross platform"
- "flutter integration test performance"
- "flutter driver vs integration test"
```

### 4. Performance and Accessibility Testing
```bash
# Research Topics:
- "flutter performance testing benchmarks"
- "flutter accessibility testing wcag"
- "flutter memory leak testing"
- "flutter animation performance testing"
```

## 🤖 Gemini MCP Server Consultation Topics

### 1. Testing Architecture Review
**Prompt:** "Review this Flutter testing strategy for a Recipe Slot App. The app has responsive design, Riverpod state management, and targets mobile/tablet/desktop. Evaluate the testing pyramid approach (70% unit, 20% widget, 10% integration) and suggest improvements for a SaaS app targeting millions of users."

**Include:** TESTING_STRATEGY.md content

### 2. Widget Testing Implementation Strategy
**Prompt:** "I need to implement comprehensive widget tests for a Flutter Recipe Slot App with these key components: SlotMachineWidget (core spinning functionality), RecipeCardStack (swipeable cards), AdaptiveNavigationShell (responsive navigation). The app uses Riverpod for state management. Provide a detailed testing approach including mock strategies, test scenarios, and best practices."

**Include:** Component details from codebase

### 3. Responsive Testing Approach
**Prompt:** "How should I test responsive Flutter widgets that adapt to different screen sizes (mobile, tablet, desktop)? The app has a responsive design system with ScreenSize enum and ResponsiveBuilder widgets. Current tests are failing because screen size detection doesn't match expectations. Provide debugging approach and testing patterns."

**Include:** Responsive system code and failing test details

### 4. Integration Testing Strategy
**Prompt:** "Design an integration testing strategy for a Flutter Recipe Slot App with these critical user flows: 1) Slot machine spinning and recipe generation, 2) Recipe saving/loading with Hive database, 3) API integration for recipe data, 4) Cross-platform functionality. The app targets iOS, Android, and Web. Focus on real-world scenarios and edge cases."

### 5. Performance Testing Implementation
**Prompt:** "Create a performance testing strategy for a Flutter Recipe Slot App targeting millions of users. Key requirements: <3s cold start, <150MB memory, 60 FPS animations, efficient slot machine animations. Include memory leak detection, animation performance testing, and scalability considerations."

### 6. CI/CD Testing Pipeline
**Prompt:** "Design a CI/CD testing pipeline for a Flutter Recipe Slot App with unit, widget, integration, and performance tests. Include automated testing for iOS, Android, and Web platforms, test coverage reporting, and quality gates. Consider GitHub Actions and best practices for Flutter testing automation."

## 📋 Research Workflow

### Step 1: Context7 Research (30 minutes)
1. Research each topic systematically
2. Take notes on latest patterns and best practices
3. Identify any new testing libraries or approaches
4. Focus on Riverpod + Flutter testing combinations

### Step 2: Gemini Consultation (45 minutes)
1. Start with Testing Architecture Review
2. Get specific guidance for Widget Testing Implementation
3. Address Responsive Testing issues
4. Plan Integration and Performance testing
5. Design CI/CD pipeline

### Step 3: Implementation Planning (15 minutes)
1. Synthesize research findings
2. Create detailed implementation plan
3. Prioritize testing components
4. Set up development workflow

## 🎯 Expected Outcomes

### From Context7 Research:
- Latest Flutter testing patterns and libraries
- Riverpod testing best practices
- Responsive testing strategies
- Performance testing approaches

### From Gemini Consultation:
- Validated testing architecture
- Specific implementation guidance
- Problem-solving for current issues
- Strategic planning for complex scenarios

### Combined Results:
- Comprehensive testing implementation plan
- Solutions for existing test failures
- Optimized testing workflow
- Production-ready testing strategy

## 🚀 Implementation Priority

### High Priority (Must Research):
1. **Widget Testing with Riverpod** - Core to app functionality
2. **Responsive Widget Testing** - Fix existing failures
3. **Slot Machine Testing** - Critical app component

### Medium Priority (Should Research):
1. **Integration Testing Patterns** - User flow validation
2. **Performance Testing Setup** - Scalability requirements

### Low Priority (Nice to Have):
1. **CI/CD Pipeline Design** - Future automation
2. **Advanced Testing Patterns** - Optimization

---

**Research Goal:** Implement comprehensive, production-ready testing for Recipe Slot App  
**Time Allocation:** ~90 minutes research + implementation  
**Success Metric:** Working widget tests with proper coverage and patterns
