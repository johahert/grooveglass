import { useSpotifyAuth } from "@/components/providers/SpotifyAuthProvider";

const SpotifyUserToggle = () => {
  const { spotifyUser, login, logout, loading } = useSpotifyAuth();

  if (loading) return null;

  return (
    <div className="flex items-center justify-end mb-4">
      {spotifyUser ? (
        <div className="flex items-center gap-4">
          <span className="text-white/80">Logged in as <span className="font-bold">{spotifyUser.displayName}</span></span>
          <button
            onClick={logout}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold"
        >
          Log in with Spotify
        </button>
      )}
    </div>
  );
};

export default SpotifyUserToggle;
