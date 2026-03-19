import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Setup } from './pages/Setup';
import { Building } from './pages/Building';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

export type Page = 'home' | 'setup' | 'building' | 'dashboard' | 'settings';

function App() {
  const [currentPath, setCurrentPath] = useState<Page>('home');

  const renderPage = () => {
      switch(currentPath) {
          case 'home': return <Home navigate={setCurrentPath} key="home" />;
          case 'setup': return <Setup navigate={setCurrentPath} key="setup" />;
          case 'building': return <Building navigate={setCurrentPath} key="building" />;
          case 'dashboard': return <Dashboard navigate={setCurrentPath} key="dashboard" />;
          case 'settings': return <Settings navigate={setCurrentPath} key="settings" />;
          default: return <Home navigate={setCurrentPath} key="home" />;
      }
  };

  return (
      <Layout currentPath={currentPath} navigate={setCurrentPath}>
          <AnimatePresence mode="wait">
              {renderPage()}
          </AnimatePresence>
      </Layout>
  );
}

export default App;