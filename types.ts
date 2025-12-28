
import firebase from 'firebase/app';
import 'firebase/auth';
import type { MediaConnection } from 'peerjs';

// FIX: Use firebase.User for FirebaseUser type with v8.
export type FirebaseUser = firebase.User;

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
