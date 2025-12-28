
import React, { useState, useEffect } from 'react';
// FIX: Update imports for Firebase v8 compatibility.
import firebase from 'firebase/app';
import 'firebase/auth';
import { auth, isConfigPlaceholder } from './config/firebase';
import Auth from './components/Auth';
import ChatContainer from './components/ChatContainer';
import Spinner from './components/Spinner';

const FirebaseSetupMessage: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-red-500">Configuration Required</h1>
      <p className="text-lg mb-2">
        Welcome to Vimo! To enable chat and video functionality, you need to connect to a Firebase project.
      </p>
      <p className="mt-4 text-gray-300">
        Please open the file <code className="bg-gray-700 text-yellow-400 p-1 rounded-md">config/firebase.ts</code> and replace the placeholder values with your actual Firebase project configuration.
      </p>
       <p className="mt-2 text-sm text-gray-400">
        You can find these credentials in your project's settings in the Firebase Console.
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  // FIX: Use firebase.User for the user type.
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  if (isConfigPlaceholder) {
    return <FirebaseSetupMessage />;
  }

  useEffect(() => {
    // FIX: Use the v8 syntax for onAuthStateChanged.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-screen font-sans">
      {user ? <ChatContainer currentUser={user} /> : <Auth />}
    </div>
  );
};

export default App;
