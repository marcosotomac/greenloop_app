import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";

import "@/styles/globals.css";
import { ToastProvider } from "@heroui/react";

import { TokenProvider } from "@/contexts/TokenContext.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <TokenProvider>
        <BrowserRouter>
          <Provider>
            <ToastProvider />
            <main className={"text-foreground bg-background"}>
              <App />
            </main>
          </Provider>
        </BrowserRouter>
      </TokenProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
