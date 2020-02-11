import { v4 as uuid } from 'uuid';
import { v4 } from 'uuid/interfaces';

export interface IRoom {
    ID: v4;
    Name: string;
    OwnerID: string;
    LastPlayed: string;
    PlaybackMS: string;
    IsPlaying: boolean;
}
