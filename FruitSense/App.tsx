import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigation } from './src/navigation';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F7F4" />
        <AppNavigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
