
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { ModelProvider } from '@/contexts/ModelContext';
import './App.css';

function App() {
  return (
    <ModelProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ModelProvider>
  );
}

export default App;
