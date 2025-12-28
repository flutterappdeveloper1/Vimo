
import { User as FirebaseUser } from 'firebase/auth';
import type { MediaConnection } from 'peerjs';

export interface VimoUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
}

export interface PresenceState {
  [key: string]: 'online' | 'offline';
}

export interface IncomingCall {
    from: string;
    fromName: string;
    connection: MediaConnection;
}
