import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SellValuation from "./pages/SellValuation.tsx";
import RentValuation from "./pages/RentValuation.tsx";
import SellResult from "./pages/SellResult.tsx";
import RentResult from "./pages/RentResult.tsx";
import BuyAnalysis from "./pages/BuyAnalysis.tsx";
import BuyResult from "./pages/BuyResult.tsx";
import ValuationLookup from "./pages/ValuationLookup.tsx";
import Admin from "./pages/Admin.tsx";
import AgentProfile from "./pages/AgentProfile.tsx";
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
          <Route path="/sell/valuation" element={<SellValuation />} />
          <Route path="/sell/result/:id" element={<SellResult />} />
          <Route path="/rent/valuation" element={<RentValuation />} />
          <Route path="/rent/result/:id" element={<RentResult />} />
          <Route path="/buy" element={<BuyAnalysis />} />
          <Route path="/buy/result/:id" element={<BuyResult />} />
          <Route path="/lookup" element={<ValuationLookup />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
