import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import AiStudioPage from './src/pages/AiStudioPage';
import Home from './src/pages/Home';
import NotFound from './src/pages/NotFound';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header />
      <main className="container mx-auto py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-studio" element={<AiStudioPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
