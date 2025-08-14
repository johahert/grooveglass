
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpotifyAuthProvider } from "./components/providers/SpotifyAuthProvider";
import { SignalRContextProvider } from "./components/providers/SignalRContextProvider";
import { AppContent } from "./pages/Appcontent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SpotifyAuthProvider>
    <TooltipProvider>

      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SignalRContextProvider>
          <AppContent/>
        </SignalRContextProvider>
      </BrowserRouter>
    </TooltipProvider>
    </SpotifyAuthProvider>
  </QueryClientProvider>
);

export default App;
