import React from 'react'
const TrackSearch = (token) => {
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const [query, setQuery] = React.useState("");

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

    }

    return (
        <>
        <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a track..."
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
            />
           <button onClick={handleSearch}>Search</button>
        </>
    )
}

export default TrackSearch
