# EarnBurn Project 🏋️‍♂️

**EarnBurn** is a React Native mobile application built with Expo, designed for advanced workout programming and tracking. It focuses on periodization and seamless workout execution.

## 📱 About the App

While built with web-standard technologies (React, TypeScript), this is a **native mobile application** (iOS/Android).

### Key Features

#### 1. Workout Planning (Periodization)
-   **Macrocycles & Mesocycles**: Create long-term training blocks tailored to specific goals (e.g., Hypertrophy, Strength).
-   **Microcycles (Weekly Plans)**: Detailed weekly views (Day A, Day B, etc.) with specific focuses.
-   **Exercise Library**: Comprehensive database of exercises categorized by muscle group and pattern.

#### 2. Smart Execution
-   **Draft System**: customize your daily workout before starting.
-   **Smart Swaps**: specific equipment busy? Swap exercises for valid alternatives directly from the plan.
-   **Active Session**: "Start" a workout to carry your plan into a live logging session with rest timers and set tracking.

#### 3. Offline-First
-   Local database using SQLite ensures your data is always available, even without an internet connection.

## 🛠 Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/)
-   **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/)
-   **Styling**: Custom theme system (StyleSheet)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start the App**
    ```bash
    npx expo start
    ```

3.  **Run on Device/Simulator**
    -   Press `i` for iOS Simulator.
    -   Press `a` for Android Emulator.
    -   Scan the QR code with the Expo Go app on your physical device.

## 📂 Project Structure

-   `app/`: Application screens and routes (Expo Router).
-   `src/components/`: Reusable UI components.
-   `src/store/`: Zustand state stores (User, Program, Workout Draft).
-   `src/db/`: Database schema and client configuration.
-   `src/repositories/`: Data access layer.
-   `src/theme/`: Design tokens (Colors, Typography, Spacing).

---
*Built with Expo & Google Antigravity AI & Google Gemini 3 & OpenAI ChatGPT 5.2 & A Human & much ❤️*

