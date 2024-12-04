import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import { auth } from './firebaseConfig';
import Chat from './ChatComponent';
import { teacherInfo } from './axios/api';
import { ChatClient } from './typeClient';
import { LiaChalkboardTeacherSolid } from 'react-icons/lia';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [chatClients, setChatClients] = useState<ChatClient[]>([]);
  //email user
  const [email, setEmail] = useState(''); // email state

  const [teacherId, setTeacherId] = useState<number>(1);

  const [source, setSource] = useState<string>('');

  React.useEffect( () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        //save user email
        if (user.email) {
          setEmail(user.email);
        }

        try {
          teacherInfo(user.email).then((data: any) => {
            console.log('Teacher info:', data);
        
            if (data && data.customers) {
             let currentClients = data.customers.map((customer: any) => {
                return {
                  id: customer.customerId,
                  name: customer.customerName,
                  unread: 0
                };
              });
              setChatClients(currentClients);
            }
            setTeacherId(data.teacherId);
            setSource(data.source);
            setIsLoggedIn(true);
          }).catch((error) => {
            console.error('Error fetching data:', error);
            setIsLoggedIn(false);
          });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', padding: 0, margin: 0, overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      {isLoggedIn ? (
        <Chat
         email={email}
         clients={chatClients}
         id={teacherId}
         source={source}
          />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
