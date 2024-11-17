import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import { auth } from './firebaseConfig';
import Chat from './ChatComponent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //email user
  const [email, setEmail] = useState(''); // email state

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        //save user email
        if (user.email) {
          setEmail(user.email);
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', padding: 0, margin: 0, overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      {isLoggedIn ? (
        <Chat email={email} />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
