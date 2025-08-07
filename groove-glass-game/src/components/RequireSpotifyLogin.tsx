import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { SpotifyAuthContext } from "@/components/providers/SpotifyAuthProvider";

export default function RequireSpotifyLogin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(SpotifyAuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/host-quiz" replace />;
  }
  return <>{children}</>;
}
