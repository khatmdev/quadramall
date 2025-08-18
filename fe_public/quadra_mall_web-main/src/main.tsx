import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify'; // Thêm ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Nhập CSS cho Toastify
import './index.css';
import {getStore} from "@/store";
import App from './App';
import { createApi } from './api/axios';
import { Toaster } from 'react-hot-toast';


// Tạo store duy nhất
const store = getStore();
// Tạo instance Axios với store
export const api = createApi(store);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
