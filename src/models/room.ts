export interface IRoom {
    id: string;
    name: string;
    owner_id: string;
    participants: string[];
    playback: string;
    playback_ms: string;
    isPlaying: boolean;
}
