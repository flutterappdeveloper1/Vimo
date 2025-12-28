
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { ref, onValue, off, onDisconnect, set, serverTimestamp, goOnline, goOffline, get, child, push, orderByChild, query, limitToLast } from 'firebase/database';
import type { VimoUser, ChatMessage, PresenceState, IncomingCall } from '../types';
import ContactList from './ContactList';
import ChatWindow from './ChatWindow';
import VideoCall from './VideoCall';
import type { Peer } from 'peerjs';

interface ChatContainerProps {
  currentUser: User;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<VimoUser[]>([]);
  const [presence, setPresence] = useState<PresenceState>({});
  const [selectedUser, setSelectedUser] = useState<VimoUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const peerRef = useRef<Peer | null>(null);
  const myStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState(false);

  const getChatId = (uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  // Initialize PeerJS and Firebase presence
  useEffect(() => {
    const peer = new (window as any).Peer(currentUser.uid, {
      host: 'localhost',
      port: 9000,
      path: '/myapp'
    });
    peerRef.current = peer;

    peer.on('call', (call) => {
      get(child(ref(db), `users/${call.peer}`)).then((snapshot) => {
        if (snapshot.exists()) {
          const caller = snapshot.val();
          setIncomingCall({ from: call.peer, fromName: caller.displayName, connection: call });
        }
      });
    });

    const userStatusDatabaseRef = ref(db, `/presence/${currentUser.uid}`);
    const isOfflineForDatabase = { state: 'offline', last_changed: serverTimestamp() };
    const isOnlineForDatabase = { state: 'online', last_changed: serverTimestamp() };

    onValue(ref(db, '.info/connected'), (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }
      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
        set(userStatusDatabaseRef, isOnlineForDatabase);
      });
    });
    
    goOnline(db);

    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData: VimoUser[] = [];
      snapshot.forEach(childSnapshot => {
        if (childSnapshot.key !== currentUser.uid) {
          usersData.push(childSnapshot.val());
        }
      });
      setUsers(usersData);
    });

    const presenceRef = ref(db, 'presence');
    onValue(presenceRef, (snapshot) => {
      const presenceData: PresenceState = {};
      snapshot.forEach(childSnapshot => {
        presenceData[childSnapshot.key!] = childSnapshot.val().state;
      });
      // FIX: Corrected typo 'presen ceData' to 'presenceData'
      setPresence(presenceData);
    });

    return () => {
      peer.destroy();
      goOffline(db);
      off(usersRef);
      off(presenceRef);
    };
  }, [currentUser.uid]);

  // Message listener
  useEffect(() => {
    if (!selectedUser) return;
    const chatId = getChatId(currentUser.uid, selectedUser.uid);
    const messagesRef = query(ref(db, `chats/${chatId}/messages`), orderByChild('timestamp'), limitToLast(50));
    
    const callback = onValue(messagesRef, (snapshot) => {
      const messagesData: ChatMessage[] = [];
      snapshot.forEach(childSnapshot => {
        messagesData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setMessages(messagesData);
    });

    return () => off(messagesRef, 'value', callback);
  }, [selectedUser, currentUser.uid]);


  const handleSendMessage = (text: string) => {
    if (!selectedUser) return;
    const chatId = getChatId(currentUser.uid, selectedUser.uid);
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
      text,
      senderId: currentUser.uid,
      timestamp: serverTimestamp()
    });
  };

  const handleStartCall = async (userToCall: VimoUser) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      myStreamRef.current = stream;
      const call = peerRef.current?.call(userToCall.uid, stream);
      call?.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        setActiveCall(true);
      });
       call?.on('close', endCall);
    } catch (error) {
      console.error("Failed to get local stream", error);
    }
  };

  const handleAnswerCall = async () => {
    if (!incomingCall) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myStreamRef.current = stream;
        incomingCall.connection.answer(stream);
        incomingCall.connection.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            setActiveCall(true);
            setIncomingCall(null);
        });
        incomingCall.connection.on('close', endCall);
    } catch (error) {
        console.error("Failed to answer call", error);
    }
  };

  const handleRejectCall = () => {
    incomingCall?.connection.close();
    setIncomingCall(null);
  };
  
  const endCall = useCallback(() => {
    myStreamRef.current?.getTracks().forEach(track => track.stop());
    myStreamRef.current = null;
    setRemoteStream(null);
    setActiveCall(false);
    // This is tricky, we need to close all connections.
    // A better approach would be to track all active calls in a state array.
    peerRef.current?.connections[Object.keys(peerRef.current?.connections)[0]]?.[0].close();
  }, []);

  const handleLogout = () => {
    goOffline(db);
    auth.signOut();
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {activeCall && myStreamRef.current && (
          <VideoCall 
              myStream={myStreamRef.current}
              remoteStream={remoteStream}
              onEndCall={endCall}
          />
      )}
      
      {incomingCall && !activeCall && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <h3 className="text-2xl mb-4">Incoming Call from {incomingCall.fromName}</h3>
                <div className="flex justify-center space-x-4">
                    <button onClick={handleAnswerCall} className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600">Answer</button>
                    <button onClick={handleRejectCall} className="bg-red-500 px-6 py-2 rounded-lg hover:bg-red-600">Reject</button>
                </div>
            </div>
        </div>
      )}

      <ContactList
        users={users}
        presence={presence}
        currentUser={currentUser}
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
        onLogout={handleLogout}
      />
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onStartCall={handleStartCall}
      />
    </div>
  );
};

export default ChatContainer;