import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import SpotifyDeviceSelect from "./customui/SpotifyDeviceSelect";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem } from "./ui/navigation-menu";
import { Switch } from "./ui/switch";
import { ThemeToggle } from "./ui/theme-toggle";

const SpotifyUserToggle = () => {
  const { spotifyUser, login, logout, loading } = useSpotifyAuth();

  if (loading) return null;

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        {spotifyUser && <SpotifyDeviceSelect />}
        <ThemeToggle />
      </div>

      {spotifyUser ? (
        <div className="text-foreground">
          <span>Logged in as <span className="font-bold ">{spotifyUser.displayName}</span></span>
          <Button
            variant="ghost"
            onClick={logout}
            >
            Log out
          </Button>
        </div>
      ) : (
        <Button
        variant="ghost"
        onClick={login}
        >
          Log in with Spotify
        </Button>
      )}
    </div>
  );
};

export default SpotifyUserToggle;
