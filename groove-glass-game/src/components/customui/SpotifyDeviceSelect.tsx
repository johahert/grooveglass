import React, { useEffect } from 'react'
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';
import { GetSpotifyDevices } from '../services/api/SpotifyTrackApiService';
import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SpotifyDevice } from '@/models/interfaces/SpotifyDevice';

const SpotifyDeviceSelect = () => {
    const auth = useSpotifyAuth();
    const { spotifyUser, updateSpotifyUser } = auth;
    const [devices, setDevices] = useState<SpotifyDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>("");

    const fetchDevices = async () => {
        const devices: SpotifyDevice[] = await GetSpotifyDevices(auth);
        console.log("Fetched devices:", devices);
        if(!devices){
            console.error("No devices found or error fetching devices");
            return
        }
        setDevices(devices);
        const selectedDeviceInfo: SpotifyDevice = devices.find(device => device.id === selectedDevice);

    };

    useEffect(() => {
        if (!selectedDevice) return;
        const selectedDeviceInfo: SpotifyDevice = devices.find(device => device.id === selectedDevice);

        if(selectedDeviceInfo) {
            setSelectedDevice(selectedDeviceInfo.id);
            updateSpotifyUser({ selectedDevice: selectedDeviceInfo });
        }

    }, [selectedDevice])

    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger >
                <SelectValue placeholder="Select a Spotify device" />
            </SelectTrigger>
            <SelectContent >
                {devices?.map(device => (
                    <SelectItem key={device.id} value={device.id} 
                    >
                        {device.name} ({device.type})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default SpotifyDeviceSelect