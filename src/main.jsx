import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './index.css';

// Check system preference for dark mode
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
if (mediaQuery.matches) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Listen for system preference changes
mediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <Provider store={store}>
            <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
            <App />
        </Provider>
    </React.StrictMode>
);