
import React from 'react';
// FIX: Update imports for Firebase v8 compatibility.
import firebase from 'firebase/app';
import 'firebase/auth';
import type { VimoUser, PresenceState } from '../types';
import { LogoutIcon } from './icons';

interface ContactListProps {
  users: VimoUser[];
  presence: PresenceState;
  // FIX: Use firebase.User for the user type.
  currentUser: firebase.User;
  onSelectUser: (user: VimoUser) => void;
  selectedUser: VimoUser | null;
  onLogout: () => void;
}

const ContactList: React.FC<ContactListProps> = ({ users, presence, currentUser, onSelectUser, selectedUser, onLogout }) => {
  return (
    <div className="w-full md:w-1/4 bg-gray-800 p-4 flex flex-col h-full border-r border-gray-700">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Vimo Contacts</h2>
      <div className="flex-grow overflow-y-auto">
        <ul>
          {users.map((user) => (
            <li
              key={user.uid}
              onClick={() => onSelectUser(user)}
              className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${selectedUser?.uid === user.uid ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <div className="relative">
                <img
                  src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className={`absolute bottom-0 right-3 block h-3 w-3 rounded-full border-2 border-gray-800 ${presence[user.uid] === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </div>
              <span className="font-medium">{user.displayName}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto border-t border-gray-700 pt-4 flex items-center justify-between">
        <div className="flex items-center">
             <img src={currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`} alt="current user" className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-semibold">{currentUser.displayName}</p>
                <p className="text-xs text-gray-400">{currentUser.email}</p>
            </div>
        </div>
        <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white" title="Logout">
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
};

export default ContactList;
