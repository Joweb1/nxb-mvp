
# NXB MVP App

## Project Overview

NXB MVP is a sleek and modern mobile application designed for football enthusiasts. Built with React Native and Expo, this cross-platform app provides a seamless and engaging user experience for tracking live football scores, viewing match highlights, and personalizing content. The app features a clean, dark-themed interface and is optimized for both iOS and Android devices, with web support as well.

The core of the application is its real-time match tracking functionality. Live match data is sourced from the API-Football service, periodically fetched and synchronized with a Firebase Firestore database. This ensures that users have access to up-to-the-minute information with minimal latency.

## Key Features

- **User Authentication:** Secure user registration and login functionality powered by Firebase Authentication.
- **Tab-Based Navigation:** A custom-built, animated tab bar provides intuitive navigation between the main sections of the app: "Highlight", "Favourites", and "For You".
- **Highlight Screen:** The central hub of the app, this screen displays a list of live and upcoming matches, grouped by league. It features:
  - A dynamic date selector to easily browse matches from different days.
  - A collapsible list of matches, each with detailed information including team logos, scores, match status, and time.
  - An integrated ad banner for monetization.
  - A toggle to show/hide betting odds.
- **Favourites:** A dedicated screen where users can track their favorite matches for quick access. (Functionality in development).
- **For You:** A personalized feed of matches and content tailored to the user's preferences. (Functionality in development).
- **Real-Time Updates:** The app leverages Firebase Firestore to listen for real-time updates to match data, ensuring that scores and match statuses are always current.
- **Responsive Design:** The UI is designed to be responsive and adapt to different screen sizes, including tablet support.

## Technical Implementation

### Frontend

- **Framework:** React Native with Expo, enabling rapid development and a single codebase for multiple platforms.
- **Routing:** Expo Router is used for file-based routing and navigation between screens.
- **UI & Styling:**
  - A custom design system with a consistent dark theme is implemented using `StyleSheet`.
  - Google Fonts (`Poppins`) are used for a clean and modern typography.
  - `react-native-reanimated` is used for smooth animations, such as in the custom tab bar and date selector.
  - The app is built with reusable components like `MatchItem` and `CustomTabBar` to ensure a modular and maintainable codebase.
- **State Management:** React Context is used for managing global state, such as user authentication status.

### Backend & Services

- **Backend as a Service (BaaS):** Firebase is used for both user authentication and as a real-time database (Firestore).
- **Data Source:** Live football data is fetched from the [API-Football](https://www.api-football.com/) service. A backend process (not included in this repository) is responsible for periodically fetching data from the API and updating the Firestore database.
- **API Interaction:** The `services/api-football.js` module contains the logic for making requests to the external API, while the `services/firebase.js` module provides a clean interface for interacting with Firestore.

### Development & Tooling

- **Package Management:** `npm` is used for managing project dependencies.
- **Linting:** ESLint is configured to enforce code quality and consistency.
- **Module Resolution:** Babel is used with `babel-plugin-module-resolver` to allow for clean and absolute import paths.

## Project Structure

The project follows a well-organized folder structure:

- `app/`: Contains all the screens and layouts, organized using Expo Router's conventions.
  - `(auth)/`: Authentication-related screens (Login, Signup).
  - `(app)/`: The main application screens, accessible after authentication.
- `components/`: Reusable UI components.
- `constants/`: Global constants, including the color palette and font styles.
- `context/`: React Context providers for managing global state.
- `hooks/`: Custom React hooks, such as `useResponsive`.
- `services/`: Modules for interacting with external APIs and Firebase.
- `utils/`: Utility functions.
