# NXB MVP App

A modern sports scores and highlights application built with React Native and Expo. This project aims to provide a seamless user experience for tracking football matches, viewing highlights, and managing favorite teams/leagues.

## Features

-   **Authentication Flow:** User login and registration powered by Firebase.
-   **Custom Bottom Navigation:** A sleek, modern bottom navigation bar with "Highlight", "Favourites", and "For You" tabs, featuring a "pill" design for active tabs.
-   **Highlight Screen:**
    -   Dynamic display of match scores and odds with a toggle switch.
    -   Horizontal date navigation for browsing match schedules.
    -   Collapsible "Matches" section with league-grouped match listings.
    -   Detailed match items showing team logos, scores, status, and action buttons (Preview/Summary).
    -   Integrated ad banner.
-   **Path Aliases:** Configured for easier module imports.
-   **Theming:** Consistent dark theme applied throughout the application.

## Technologies Used

-   **React Native:** A framework for building native mobile apps using React.
-   **Expo:** A platform for universal React applications, enabling faster development.
-   **Expo Router:** File-based routing for Expo and React Native.
-   **Firebase:** Backend services for authentication.
-   **@expo/vector-icons:** Customizable vector icons for UI elements.
-   **expo-image:** Optimized image loading and display.
-   **@expo-google-fonts/poppins:** Custom font integration.
-   **babel-plugin-module-resolver:** For path alias resolution.

## Setup Instructions

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js:** [LTS version recommended](https://nodejs.org/en/download/)
-   **npm** (comes with Node.js) or **Yarn**
-   **Expo CLI:** Install globally using npm or yarn:
    ```bash
    npm install -g expo-cli
    # OR
    yarn global add expo-cli
    ```

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nxb-mvp.git # Replace with your repository URL
cd nxb-mvp
```

### 2. Install Dependencies

```bash
npm install
# OR
yarn install
```

### 3. Configure Firebase

This project uses Firebase for authentication. You need to set up your Firebase project and add your configuration.

1.  Create a new project on the [Firebase Console](https://console.firebase.google.com/).
2.  Add a web app to your Firebase project to get your configuration details.
3.  Create a file named `firebaseConfig.js` in the root of your project (if it doesn't exist) and add your Firebase configuration:

    ```javascript
    // firebaseConfig.js
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore'; // If you use Firestore

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    // const db = getFirestore(app); // Uncomment if you use Firestore

    export { auth, app }; // Export db if you uncommented it
    ```

### 4. Run the Application

You can run the application on an Android emulator/device, iOS simulator/device, or in a web browser.

```bash
npm start
# OR
yarn start
```

This will open the Expo Developer Tools in your browser. From there, you can:

-   Scan the QR code with the Expo Go app on your physical device.
-   Run on an Android emulator.
-   Run on an iOS simulator (macOS only).
-   Run in a web browser.

## Project Structure

```
.
├── app/                  # Expo Router app directory for screens and layouts
│   ├── (app)/            # Group for authenticated screens (Highlight, Favourites, For You)
│   ├── (auth)/           # Group for authentication screens (Login, Signup)
│   └── _layout.jsx       # Root layout for the entire app
├── assets/               # Static assets like images
├── components/           # Reusable UI components (e.g., CustomTabBar, MatchItem)
├── constants/            # Global constants (theme, sizes, colors)
├── context/              # React Context providers (e.g., AuthContext)
├── mock/                 # Mock data for development (e.g., matches.js)
├── utils/                # Utility functions (e.g., firebaseErrors)
├── babel.config.js       # Babel configuration for module resolution
├── jsconfig.json         # JavaScript language service configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.