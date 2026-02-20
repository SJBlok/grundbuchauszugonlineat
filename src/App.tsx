import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Grundbuchauszug from "./pages/Grundbuchauszug";
import Preise from "./pages/Preise";
import FAQ from "./pages/FAQ";
import Kontakt from "./pages/Kontakt";
import Anfordern from "./pages/Anfordern";
import AnfordernB from "./pages/AnfordernB";
import Danke from "./pages/Danke";
import Bestaetigung from "./pages/Bestaetigung";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Widerruf from "./pages/Widerruf";
import Impressum from "./pages/Impressum";
import UeberUns from "./pages/UeberUns";
import NotFound from "./pages/NotFound";
import GrundbuchTest from "./pages/GrundbuchTest";
import EmailTemplates from "./pages/EmailTemplates";
import GrundbuchPreview from "./pages/GrundbuchPreview";
import DailyReports from "./pages/DailyReports";
import ApiDocs from "./pages/ApiDocs";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/grundbuchauszug" element={<Grundbuchauszug />} />
          <Route path="/ablauf" element={<Preise />} />
          <Route path="/preise" element={<Preise />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/anfordern" element={<Anfordern />} />
          <Route path="/anfordern-b" element={<AnfordernB />} />
          <Route path="/danke" element={<Danke />} />
          <Route path="/bestaetigung" element={<Bestaetigung />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/widerruf" element={<Widerruf />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/ueber-uns" element={<UeberUns />} />
          <Route path="/test/grundbuch" element={<GrundbuchTest />} />
          <Route path="/email-templates" element={<EmailTemplates />} />
          <Route path="/grundbuch-preview" element={<GrundbuchPreview />} />
          <Route path="/daily-reports" element={<DailyReports />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
