import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "@fuel/styles.css";
import { createFuelQueryClient } from "@fuel/lib/queryClient.js";
import StorageStatus from "@fuel/components/StorageStatus.jsx";
import FuelApp from "./FuelApp.jsx";

const qc = createFuelQueryClient();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <StorageStatus />
      <FuelApp />
    </QueryClientProvider>
  </React.StrictMode>,
);
