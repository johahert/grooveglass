
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateQuiz from "./pages/CreateQuiz";
import JoinQuiz from "./pages/JoinQuiz";
import HostQuiz from "./pages/HostQuiz";
import NotFound from "./pages/NotFound";
import { SpotifyAuthProvider } from "./components/providers/SpotifyAuthProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SpotifyAuthProvider>
    <TooltipProvider>

      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/join-quiz" element={<JoinQuiz />} />
          <Route path="/host-quiz" element={<HostQuiz />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </SpotifyAuthProvider>
  </QueryClientProvider>
);

export default App;
