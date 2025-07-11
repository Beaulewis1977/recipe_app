
# 🍽️ Spoonacular API Setup Guide

## ⚠️ REQUIRED API KEY

**This app requires a real Spoonacular API key to function.** Without it, the app will not work and will return API key errors.

## 🔑 Getting Your Free Spoonacular API Key

### Step 1: Create Account
1. **Visit Spoonacular**: Go to [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
2. **Sign Up**: Click "Get Started" and create a free account with your email
3. **Verify Email**: Check your email and verify your account

### Step 2: Get Your API Key
1. **Login** to your Spoonacular dashboard
2. **Find Your API Key**: Look for "Your API Key" section on the dashboard
3. **Copy the Key**: It will look something like `1a2b3c4d5e6f7g8h9i0j`

### Step 3: Add to Your App (REQUIRED)
1. **Navigate** to your Recipe Slot App directory: `/home/ubuntu/recipe_slot_app/app/`
2. **Open the .env file**:
   ```bash
   cd /home/ubuntu/recipe_slot_app/app
   nano .env
   ```
3. **Replace the placeholder** with your real API key:
   ```
   SPOONACULAR_API_KEY="your-actual-api-key-here"
   ```
   For example:
   ```
   SPOONACULAR_API_KEY="1a2b3c4d5e6f7g8h9i0j"
   ```
4. **Save and restart** the development server

## API Quota Information

**Free Tier:**
- 150 requests per day
- Perfect for development and testing
- No credit card required

**Paid Tiers:**
- $50/month: 5,000 requests/day
- $100/month: 15,000 requests/day
- $200/month: 50,000 requests/day

## 🚀 App Features

With your Spoonacular API key configured, the Recipe Slot App provides a complete cooking companion experience:

### 📊 **Complete Recipe Data**
✅ **365,000+ Real Recipes**: Access to Spoonacular's massive recipe database
✅ **High-Quality Images**: Professional food photography for every recipe
✅ **Detailed Ingredients**: Complete lists with precise amounts and units
✅ **Step-by-Step Instructions**: Professional cooking directions
✅ **Cooking Times**: Prep time, cook time, and total time
✅ **Serving Information**: Adjustable servings with automatic ingredient scaling

### 🥗 **Advanced Nutritional Information**
✅ **Complete Nutrition Facts**: Calories, protein, fat, carbohydrates per serving
✅ **Detailed Macros**: Fiber, sugar, sodium, cholesterol content
✅ **Serving-Adjusted**: Nutrition automatically scales with serving size changes
✅ **Dietary Tracking**: Perfect for fitness and health goals

### 🔍 **Smart Search & Discovery**
✅ **Ingredient-Based Search**: Find recipes using ingredients you already have
✅ **Dietary Filters**: Vegetarian, vegan, gluten-free, keto, and more
✅ **Cuisine Types**: Italian, Asian, Mexican, Mediterranean, and more
✅ **Allergen Detection**: Automatic detection and warnings for common allergens

### 📱 **Complete App Functionality**
✅ **Swipe to Action**: Swipe left (skip), right (keep), up (save for later)
✅ **Tap for Details**: Tap any recipe card to see complete recipe information
✅ **Save & Track**: Save recipes and mark as tried
✅ **Smart Caching**: Reduces API calls and improves performance

## Testing the Integration

1. **Start the app**: `yarn dev` in the `app` directory
2. **Check the console**: Look for messages about API source and any errors
3. **Try both modes**: Test "Spin Mode" and "Ingredient Mode"
4. **Monitor requests**: Check the browser's Network tab for Spoonacular API calls

## API Rate Limiting

The app includes built-in rate limiting to protect your API quota:
- Maximum 100 requests per minute per user
- Smart caching to minimize API calls
- Error messages if quota exceeded

## Troubleshooting

**"API key required" error?**
- Check your API key is correctly set in `.env`
- Ensure the key is not wrapped in extra quotes
- Restart the development server after changing `.env`
- Verify your API key is valid on the Spoonacular dashboard

**API quota exceeded error?**
- Free tier has 150 requests/day limit
- Consider upgrading if you need more requests
- Wait until the next day for quota reset

**Recipe images not loading?**
- Some recipes may have broken image URLs
- App automatically replaces with placeholder images
- This is normal and expected behavior

**App shows errors instead of recipes?**
- Ensure you have a valid Spoonacular API key
- Check your internet connection
- Verify the API key has not expired
