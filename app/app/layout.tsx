
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/components/settings-provider';
import { IngredientStorageProvider } from '@/components/ingredient-storage-provider';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe Slot - Discover Amazing Recipes',
  description: 'Spin to discover amazing recipes tailored to your taste and dietary preferences.',
  keywords: 'recipes, cooking, food, ingredients, meal planning',
  authors: [{ name: 'Recipe Slot Team' }],
  creator: 'Recipe Slot',
  publisher: 'Recipe Slot',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://recipeslot.app',
    title: 'Recipe Slot - Discover Amazing Recipes',
    description: 'Spin to discover amazing recipes tailored to your taste and dietary preferences.',
    siteName: 'Recipe Slot',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Recipe Slot - Discover Amazing Recipes',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recipe Slot - Discover Amazing Recipes',
    description: 'Spin to discover amazing recipes tailored to your taste and dietary preferences.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <IngredientStorageProvider>
              <main className="pb-20">
                {children}
              </main>
              <Navigation />
              <Toaster />
            </IngredientStorageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
