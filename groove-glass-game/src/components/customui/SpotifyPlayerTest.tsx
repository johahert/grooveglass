import React, { useEffect } from 'react'
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';
import SpotifyTrackPlayer from './SpotifyTrackPlayer';

interface AccessToken {
    accessToken: string;
}

const SpotifyPlayerTest = () => {

    const { getAccessToken, spotifyUser } = useSpotifyAuth();

    const [accessToken, setAccessToken] = React.useState<string | null>(null);

    useEffect(() => {
        if (!spotifyUser) {
            return;
        }
        const fetchToken = async () => {
            const token: AccessToken = await getAccessToken();
            console.log("Access Token:", token);
            return token.accessToken;
        };
        fetchToken().then(token => {
            setAccessToken(token);
        }).catch(error => {
            console.error("Error fetching access token:", error);
        });
    }, [spotifyUser]);

    useEffect(() => {
        if (accessToken) {
            console.log("Access Token for Spotify Player:", accessToken);
            // Here you can initialize the Spotify Player with the access token
            // For example, you can create a new instance of the Spotify Player
            // and pass the access token to it.
        }
    }, [accessToken]);

  return (
    <div>
        <button className='bg-green-500 text-white p-2 rounded-md hover:bg-green-600' >
            Test Spotify Player
        </button>
        <SpotifyTrackPlayer token={accessToken || ''} trackIds={['52vLuv7YSkhX27eMg4wv2L', '5EWPGh7jbTNO2wakv8LjUI']} />
    </div>
  )
}

export default SpotifyPlayerTest