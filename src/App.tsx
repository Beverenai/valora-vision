import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyRetry } from "@/lib/lazyRetry";
import PageLoadingFallback from "@/components/shared/PageLoadingFallback";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy-loaded pages with chunk retry
const SellValuation = lazy(() => lazyRetry(() => import("./pages/SellValuation.tsx")));
const RentValuation = lazy(() => lazyRetry(() => import("./pages/RentValuation.tsx")));
const SellResult = lazy(() => lazyRetry(() => import("./pages/SellResult.tsx")));
const RentResult = lazy(() => lazyRetry(() => import("./pages/RentResult.tsx")));
const BuyAnalysis = lazy(() => lazyRetry(() => import("./pages/BuyAnalysis.tsx")));
const BuyResult = lazy(() => lazyRetry(() => import("./pages/BuyResult.tsx")));
const ValuationLookup = lazy(() => lazyRetry(() => import("./pages/ValuationLookup.tsx")));
const Admin = lazy(() => lazyRetry(() => import("./pages/Admin.tsx")));
const AgentProfile = lazy(() => lazyRetry(() => import("./pages/AgentProfile.tsx")));
const AgentDirectory = lazy(() => lazyRetry(() => import("./pages/AgentDirectory.tsx")));
const ProLanding = lazy(() => lazyRetry(() => import("./pages/ProLanding.tsx")));
const ProOnboard = lazy(() => lazyRetry(() => import("./pages/ProOnboard.tsx")));
const ProOnboardSuccess = lazy(() => lazyRetry(() => import("./pages/ProOnboardSuccess.tsx")));
const ProLogin = lazy(() => lazyRetry(() => import("./pages/ProLogin.tsx")));
const ProDashboard = lazy(() => lazyRetry(() => import("./pages/ProDashboard.tsx")));
const ResetPassword = lazy(() => lazyRetry(() => import("./pages/ResetPassword.tsx")));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
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
            <Route path="/agentes" element={<AgentDirectory />} />
            <Route path="/agentes/:slug" element={<AgentProfile />} />
            <Route path="/pro" element={<ProLanding />} />
            <Route path="/pro/onboard" element={<ProOnboard />} />
            <Route path="/pro/onboard/success" element={<ProOnboardSuccess />} />
            <Route path="/pro/login" element={<ProLogin />} />
            <Route path="/pro/dashboard" element={<ProDashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
