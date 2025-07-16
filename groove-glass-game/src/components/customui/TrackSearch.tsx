import { set } from 'date-fns';
import React from 'react'

interface SpotifyTrackResult {
    title: string;
    id: string;
    artists: string[];
}

interface TrackSearchProps {
    token: string;
    onTrackSelected ?: (track: SpotifyTrackResult) => void;
} 

const TrackSearch = ({token, onTrackSelected} : TrackSearchProps) => {
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const [query, setQuery] = React.useState("");

    const [searchResults, setSearchResults] = React.useState<SpotifyTrackResult[]>([]);

    const [selectedTrack, setSelectedTrack] = React.useState<SpotifyTrackResult | null>(null);

    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (selectedTrack) {
            console.log("Selected track:", selectedTrack);
        }
    }, [selectedTrack]);

    const handleSearch = async () => {
        if (!query.trim()) {
            console.log("Search query is empty");
            return;
        }
        setSearchResults([]);
        setLoading(true);

        if (!token) {
            console.error("No token provided for search");
            setLoading(false);
            return;
        }

        try {
            console.log("Token:", token);
            console.log(`Searching for tracks with query: ${query}`);
            const response = await fetch(`${BACKEND_BASE_URL}/spotify/search?query=${query}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            })

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error fetching search results:", errorData);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log("Search results:", data);
            setSearchResults(data);
            setLoading(false);

        } catch (error) {
            console.error("Error during search:", error);
            setLoading(false);
            return;
            
        }
    }

    return (
    <div className='rounded-lg overflow-hidden border border-white/50 bg-white/10 backdrop-blur-sm'>
      {selectedTrack ? (
        <div className=''>
          <div className='flex items-center justify-between p-2'>
              <div className='text-sm flex-1 '>
                  <h5 className='font-semibold text-white'>{selectedTrack.title}</h5>
                  <p className="text-white/80">
                      {selectedTrack.artists?.join(', ')}
                  </p>
              </div>
              <button 
                className='bg-white/25 px-4 py-2 text-white rounded-md hover:bg-white/40 text-sm' 
                onClick={() => setSelectedTrack(null)}
              >
                Change
              </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative w-full flex">
            <div className="relative flex items-center flex-1">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                placeholder="Search for a track..."
                className='input input-bordered input-primary w-full p-2 text-base bg-white/10 placeholder-white/50 text-white pr-10'
              />
              {query && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => {
                    setQuery("");
                    setSearchResults([]);
                  }}
                  aria-label="Clear search"
                >
                  &#10005;
                </button>
              )}
            </div>
            <button className='bg-white/25 px-4 text-white' onClick={handleSearch}>Search</button>
          </div>
          <div>
            {loading && (
              <div className='text-white text-center p-4'>
                <p>Loading...</p>
              </div>
            )}
            {searchResults.length > 0 && (
              <ul className='divide-y divide-white/25 text-sm '>
                {searchResults.map((track) => (
                  <li 
                    className='p-2 hover:bg-black/20 cursor-pointer text-white' 
                    key={track.id} 
                    onClick={() => {
                      setSelectedTrack(track)
                      if (onTrackSelected) {
                        onTrackSelected(track);
                      }
                    }
                  }
                  >
                    <h5 className='font-semibold'>{track.title}</h5>
                    <p className='text-white/80'>
                      {track.artists?.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackSearch
