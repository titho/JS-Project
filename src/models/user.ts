import { v4 as uuid } from 'uuid';
import { v4 } from 'uuid/interfaces';

export interface IUser {
    ID: v4;
    SpotifyID: string;
    Email: string;
    Username: string;
    Password: string;
}
