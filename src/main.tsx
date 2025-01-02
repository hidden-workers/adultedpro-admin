import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import './css/simple-datatables.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'nouislider/dist/nouislider.css';
import 'dropzone/dist/dropzone.css';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store.js';
import { ContextProvider } from './context/useStateContext.js';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <ContextProvider>
      <Router>
        <Toaster />
        <App />
      </Router>
    </ContextProvider>
  </Provider>,
);
