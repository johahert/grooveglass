import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";
import SpotifyDeviceSelect from "./customui/SpotifyDeviceSelect";

const SpotifyUserToggle = () => {
  const { spotifyUser, login, logout, loading } = useSpotifyAuth();

  if (loading) return null;

  return (
    <div className={`flex items-center ${spotifyUser ? 'justify-between' : 'justify-end'} mb-4`}>
      <div>
        {spotifyUser && (<SpotifyDeviceSelect />)}
      </div>
      {spotifyUser ? (
        <div className="flex items-center gap-4">
          <span className="text-white/80">Logged in as <span className="font-bold ">{spotifyUser.displayName}</span></span>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-primary-element border border-subtle hover:bg-white/10 text-red-200 "
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 rounded-lg bg-primary-element border border-subtle hover:bg-white/10 text-primary-200 "
        >
          Log in with Spotify
        </button>
      )}
    </div>
  );
};

export default SpotifyUserToggle;
