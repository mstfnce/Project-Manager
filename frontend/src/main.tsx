import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App.tsx";

// react-query'nin veri deposu (cache) - hangi veri ne zaman cekildi,
// cache'te ne var gibi seyleri tutar. Tek bir kere olusturulup
// QueryClientProvider ile tum uygulamaya (Context uzerinden) dagitilir.
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* useQuery kullanan her component (orn. ProjectListPage) bu depoya
        prop almadan erisebilsin diye tum agacin en tepesine sariyoruz. */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter adres cubugunu dinler; icerideki Routes bu bilgiye
        gore hangi sayfanin gosterilecegine karar verir. */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
