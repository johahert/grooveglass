import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";

export default function RequireSpotifyLogin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSpotifyAuth();
  if (loading) {
    // Optionally show a spinner here
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/host-quiz" replace />;
  }
  return <>{children}</>;
}
