import User from "./user";

export default interface Room {
    Id: string;
    Name: string;
    OwnerID: string;
    LastPlayed: string;
    PlaybackMS: string;
    IsPlaying: boolean;
    Participants: string[];
    Queue: string[];
}
