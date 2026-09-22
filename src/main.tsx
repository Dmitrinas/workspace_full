import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Или другой CSS файл, если он у вас называется по-другому
import App from "./App"; // Убедитесь, что путь к компоненту App правильный

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);