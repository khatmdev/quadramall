import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import { getStore } from "@/store";
import { Provider } from "react-redux";
import "cropperjs/dist/cropper.css";
import { createApi } from "./services/axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tạo client
const queryClient = new QueryClient();

// Tạo store duy nhất
const store = getStore();
// Tạo instance Axios với store
export const api = createApi();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <ToastContainer />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
  </React.StrictMode>
);
