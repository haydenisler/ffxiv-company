import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/iosevka';

import{ SWRConfig } from 'swr';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig value={{
      fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
    }}>
      <App />
    </SWRConfig>
  </React.StrictMode>,
);
