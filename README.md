# Edifica - Multilingual Language Learning App 🌍

Edifica is a comprehensive mobile language learning application built with React Native and Expo. The app provides an interactive and engaging platform for users to learn multiple languages through various modules including vocabulary, reading, writing, and pyramid-based learning techniques.

## ✨ Features

### 🎯 Core Learning Modules

- **Vocabulary Module**: Interactive vocabulary quizzes with text-to-speech support
- **Writing Module**: Structured writing exercises with AI-powered evaluation
- **Reading Module**: Reading comprehension with progressive difficulty levels
- **Pyramid Learning**: Unique sentence-building exercises for grammar and syntax

### 🌐 Multi-Language Support

- **Supported Languages**: English, Spanish, Turkish
- **Interface Languages**: Full localization support with i18next
- **Text-to-Speech**: Native pronunciation support for all languages
- **Dynamic Language Switching**: Real-time interface language changes

### 📱 User Experience

- **Adaptive Learning**: Personalized content based on user's knowledge level
- **Progress Tracking**: Comprehensive statistics and learning analytics
- **Offline Support**: Continue learning without internet connection
- **Dark/Light Theme**: Customizable UI themes
- **Responsive Design**: Optimized for various screen sizes

### 🔐 Authentication & User Management

- **Secure Authentication**: JWT-based authentication with token refresh
- **User Profiles**: Customizable profiles with learning preferences
- **Progress Persistence**: Cloud-based progress synchronization
- **Knowledge Assessment**: Initial skill level evaluation

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd graduation-project-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory with your API configuration:

   ```env
   EXPO_PUBLIC_API_URL=your_api_endpoint_here
   ```

4. **Start the development server**

   ```bash
   npx expo start
   ```

### Development Options

Choose your preferred development environment:

- **🤖 Android Emulator**: Run `npx expo run:android`
- **📱 iOS Simulator**: Run `npx expo run:ios` (macOS only)
- **🌐 Web Browser**: Run `npx expo start --web`
- **📲 Expo Go**: Use the Expo Go app to scan the QR code

## 🏗️ Project Structure

```text
edifica/
├── app/                          # Main application screens (file-based routing)
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── vocabulary-module/    # Vocabulary learning module
│   │   ├── writing-module/       # Writing exercises module
│   │   └── reading-module/       # Reading comprehension module
│   ├── login.tsx                 # Authentication screens
│   ├── signup.tsx
│   ├── choose-language.tsx       # Language selection
│   ├── user-level.tsx           # Skill level assessment
│   └── settings.tsx             # App settings
├── components/                   # Reusable UI components
│   ├── AnswerInput.tsx          # Interactive input components
│   ├── QuestionWord.tsx         # Word display with TTS
│   ├── LanguageToggle.tsx       # Language switching
│   ├── ProgressBar.tsx          # Learning progress indicators
│   └── ...
├── contexts/                     # React contexts for state management
│   ├── AuthenticationContext.tsx # User authentication
│   ├── LanguageContext.tsx      # Language preferences
│   ├── ProgressContext.tsx      # Learning progress
│   └── ThemeContext.tsx         # UI theme management
├── hooks/                        # Custom React hooks
│   ├── useVocabularyList.ts     # Vocabulary management
│   ├── useWriting.ts            # Writing exercises
│   └── useScale.ts              # Responsive scaling
├── services/                     # API service layer
├── translations/                 # Internationalization files
│   ├── en.json                  # English translations
│   ├── es.json                  # Spanish translations
│   └── tr.json                  # Turkish translations
├── themes/                       # UI theme definitions
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions
└── assets/                       # Images, icons, and media files
    ├── flags/                   # Country flags
    ├── icons/                   # UI icons
    └── illustrations/           # App illustrations
```

## 🔧 Technology Stack

### Core Technologies

- **React Native 0.79.2**: Cross-platform mobile development
- **Expo SDK 53**: Development platform and tools
- **TypeScript**: Type-safe JavaScript development
- **Expo Router**: File-based navigation system

### State Management & Data

- **React Context**: Global state management
- **AsyncStorage**: Local data persistence
- **Secure Store**: Encrypted credential storage
- **Axios**: HTTP client for API communication

### UI & Styling

- **React Native Paper**: Material Design components
- **React Native SVG**: Vector graphics support
- **React Native Reanimated**: Smooth animations
- **Custom Themes**: Dark/Light mode support

### Internationalization

- **i18next**: Multi-language support
- **React i18next**: React integration for translations
- **Expo Speech**: Text-to-speech functionality

### Development Tools

- **ESLint**: Code linting and formatting
- **Jest**: Unit testing framework
- **Metro**: JavaScript bundler
- **EAS**: Expo Application Services for builds

## 📊 Key Features Implementation

### Vocabulary Learning System

- Interactive quiz interface with multiple input methods
- Smart word repetition algorithm
- Progress tracking and statistics
- Text-to-speech pronunciation guides
- Bookmarking system for difficult words

### Writing Evaluation Engine

- AI-powered writing assessment
- Real-time feedback and suggestions
- Progressive difficulty levels
- Grammar and syntax analysis
- Scenario-based writing exercises

### Adaptive Learning Algorithm

- Initial knowledge assessment
- Personalized content recommendation
- Difficulty adjustment based on performance
- Spaced repetition for vocabulary retention

### Multilingual Architecture

- Dynamic language switching without app restart
- Localized content for all supported languages
- Culture-specific UI adaptations
- Language-specific text-to-speech engines

## 🎨 Design System

### Themes

- **Light Theme**: Clean, modern interface with high contrast
- **Dark Theme**: Eye-friendly dark mode for low-light usage
- **Adaptive Colors**: System-aware theme switching

### Typography

- **Custom Font Family**: Consistent typography across the app
- **Responsive Text Scaling**: Accessible font sizes
- **Language-Specific Fonts**: Optimized for each supported language

### Icons & Illustrations

- **Custom SVG Icons**: Scalable vector graphics
- **Cultural Illustrations**: Language-specific visual elements
- **Progressive Enhancement**: Fallback for older devices

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The project includes:

- Unit tests for core functionality
- Integration tests for API communication
- Component testing with React Native Testing Library

## 📱 Platform-Specific Features

### Android

- **Adaptive Icons**: Dynamic icon theming
- **Navigation Bar**: Immersive mode support
- **Back Button**: Hardware back button handling
- **Deep Linking**: URL scheme support

### iOS

- **Tablet Support**: Optimized for iPad
- **Status Bar**: Adaptive status bar styling
- **Haptic Feedback**: Native haptic responses
- **Universal Links**: iOS-specific deep linking

### Web

- **Progressive Web App**: PWA capabilities
- **Responsive Design**: Desktop and mobile layouts
- **Web-Specific Optimizations**: Browser performance tuning

## 🔄 State Management

The app uses a combination of React Context and local state management:

### Global State (Contexts)

- **Authentication**: User session and token management
- **Language**: Current language and interface preferences
- **Progress**: Learning progress across all modules
- **Theme**: UI theme and appearance settings
- **Vocabulary**: Vocabulary lists and learning data

### Local State (Hooks)

- **Custom Hooks**: Reusable logic for specific features
- **API Integration**: Data fetching and caching
- **Component State**: UI-specific state management

## 🌐 API Integration

The app communicates with a backend API for:

- User authentication and profile management
- Learning content delivery
- Progress synchronization
- Writing evaluation services
- Vocabulary management

### Key API Endpoints

- `/auth/*`: Authentication services
- `/user/*`: User profile management
- `/vocabulary/*`: Vocabulary content and progress
- `/writing/*`: Writing exercises and evaluation
- `/progress/*`: Learning analytics and statistics

## 🚀 Build & Deployment

### Development Build

```bash
npx expo run:android
npx expo run:ios
```

### Production Build

```bash
eas build --platform android
eas build --platform ios
```

### Web Deployment

```bash
npx expo export --platform web
```

---

Built with ❤️ using React Native and Expo
