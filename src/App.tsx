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
import ProLanding from "./pages/ProLanding.tsx";
import ProOnboard from "./pages/ProOnboard.tsx";
import ProOnboardSuccess from "./pages/ProOnboardSuccess.tsx";
import ProLogin from "./pages/ProLogin.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
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
          <Route path="/agentes/:slug" element={<AgentProfile />} />
          <Route path="/pro" element={<ProLanding />} />
          <Route path="/pro/onboard" element={<ProOnboard />} />
          <Route path="/pro/onboard/success" element={<ProOnboardSuccess />} />
          <Route path="/pro/login" element={<ProLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
