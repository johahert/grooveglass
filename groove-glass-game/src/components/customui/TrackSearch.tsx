import React from 'react'

interface SpotifyTrackResult {
    title: string;
    id: string;
    artists: string[];
}

const TrackSearch = (token) => {
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const [query, setQuery] = React.useState("");

    const [searchResults, setSearchResults] = React.useState<SpotifyTrackResult[]>([]);

    const mockSearchResults = [
        {
            id: "1",
            name: "Mock Track 1",
            artist: "Mock Artist 1",
            album: "Mock Album 1",
            duration_ms: 210000,
        },
        {
            id: "2",
            name: "Mock Track 2",
            artist: "Mock Artist 2",
            album: "Mock Album 2",
            duration_ms: 185000,
        },
        {
            id: "3",
            name: "Mock Track 3",
            artist: "Mock Artist 3",
            album: "Mock Album 3",
            duration_ms: 240000,
        },
    ];

    const handleSearch = async () => {
        if (!query.trim()) {
            console.log("Search query is empty");
            return;
        }
        console.log("Token:", token.token);
        console.log(`Searching for tracks with query: ${query}`);
        const response = await fetch(`${BACKEND_BASE_URL}/spotify/search?query=${query}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token.token}` }),
            },
        })

        const data = await response.json();
        if (!response.ok) {
            console.error("Error fetching search results:", data);
            return;
        }
        console.log("Search results:", data);

        setSearchResults(data);

    }

    return (
        <div className='rounded-lg overflow-hidden border border-white/50 '>
        <div className="relative w-full flex">
            <div className="relative flex items-center flex-1">

            <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a track..."
            className='input input-bordered input-primary w-full p-2 text-base bg-white/10 backdrop-blur-sm placeholder-white/50 text-white pr-10'
            />
            {query && (
                <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
            {searchResults.length > 0 && (
            <ul className='divide-y divide-white/25 text-sm '>
                {searchResults.map((track, index) => (
                <li className='p-2 hover:bg-black/5 cursor-pointer' key={index}>
                    <h5 className='font-semibold'>{track.title}</h5>
                    <p>
                        {track.artists.join(', ')}
                    </p>
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>
    )
}

export default TrackSearch
