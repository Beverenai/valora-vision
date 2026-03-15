import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Sell from "./pages/Sell.tsx";
import Rent from "./pages/Rent.tsx";
import SellValuation from "./pages/SellValuation.tsx";
import RentValuation from "./pages/RentValuation.tsx";
import SellResult from "./pages/SellResult.tsx";
import RentResult from "./pages/RentResult.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/sell/valuation" element={<SellValuation />} />
          <Route path="/sell/result/:id" element={<SellResult />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/rent/valuation" element={<RentValuation />} />
          <Route path="/rent/result/:id" element={<RentResult />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
