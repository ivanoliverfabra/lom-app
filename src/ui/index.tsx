import React from 'react';
import { createRoot } from 'react-dom/client';

import App from 'ui/App';
import './index.css';

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(<App />);
