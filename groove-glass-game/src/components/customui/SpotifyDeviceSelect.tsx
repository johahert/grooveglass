import React, { useEffect } from 'react'
import { useSpotifyAuth } from '../providers/SpotifyAuthProvider';
import { GetSpotifyDevices } from '../services/api/SpotifyTrackApiService';
import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SpotifyDevice } from '@/models/interfaces/SpotifyDevice';

const SpotifyDeviceSelect = () => {
    const { spotifyUser, updateSpotifyUser } = useSpotifyAuth();
    const [devices, setDevices] = useState<SpotifyDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>("");

    const selectedColor = '#18181b';
    const bgDark = '#18181b';

    const fetchDevices = async () => {
            const devices: SpotifyDevice[] = await GetSpotifyDevices(spotifyUser);
            console.log("Fetched devices:", devices);
            if(!devices){
                console.error("No devices found or error fetching devices");
                return
            }
            setDevices(devices);
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
    }, [spotifyUser]);

    return (
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="bg-primary-element border border-subtle text-white rounded-lg">
                <SelectValue placeholder="Select a Spotify device" />
            </SelectTrigger>
            <SelectContent className="bg-primary-element border border-subtle text-white rounded-lg shadow-lg">
                {devices?.map(device => (
                    <SelectItem key={device.id} value={device.id} className="bg-primary-element text-white hover:bg-zinc-800 cursor-pointer"
                    style={{ backgroundColor: selectedDevice === device.id ? selectedColor : bgDark, color: 'white' }}>
                        {device.name} ({device.type})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default SpotifyDeviceSelect