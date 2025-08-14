import { SpotifyDevice } from "./SpotifyDevice";

export interface SpotifyUserClientResponse {
    displayName: string;
    spotifyUserId: string;
    jwtToken: string;
    jwtRefreshToken: string;
    jwtTokenExpiration: Date;
    selectedDevice?: SpotifyDevice;
}