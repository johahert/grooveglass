import { set } from 'date-fns';
import React from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

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
                console.log(response)
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
    <> 
      {selectedTrack ? (
        <>
          <Card className='flex items-center justify-between p-2 px-4'>
              <div className='flex-1 space-y-1'>
                  <h5 className='font-semibold'>{selectedTrack.title}</h5>
                  <p className="text-sm text-muted-foreground">
                      {selectedTrack.artists?.join(', ')}
                  </p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setSelectedTrack(null)}
              >
                Change
              </Button>
          </Card>
        </>
      ) : (
        <>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                  placeholder="Search for a track..."
                  className="pl-10 pr-10"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setQuery("");
                      setSearchResults([]);
                    }}
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              size='sm'
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
                <Card className='mt-4'>
              <ScrollArea className='h-40 w-full ' >
                  <div className='p-4'>

                {searchResults.map((track) => (
                  <Button
                    className='w-full mr-4 hover:bg-none'
                    variant='ghost'
                    key={track.id} 
                    onClick={() => {
                      setSelectedTrack(track)
                      if (onTrackSelected) {
                        onTrackSelected(track);
                      }
                    }}
                    >
                    <h5 className='font-semibold text-sm'>{track.title}</h5>
                    <p className='text-xs text-muted-foreground'>
                      {track.artists?.join(', ')}
                    </p>
                  </Button>
                ))}
                </div>
              </ScrollArea>
                </Card>
            )}
        </>
      )}
    </>
  )
}

export default TrackSearch
