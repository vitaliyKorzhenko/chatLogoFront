import React, { useState } from 'react';
import './Login.css';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import speechLogo from './assets/speechLogo.jpeg';
import { FcGoogle } from 'react-icons/fc';
import { checkEmail, teacherInfo } from './axios/api';

interface LoginProps {
  updateSource: (source: string) => void;
}

const Login: React.FC<LoginProps> = ({updateSource}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [source, setSource] = useState<string | null>('ua');

  const handleGoogleLogin = async () => {
    if (!source) {
      setError('Please select a project.');
      return;
    }

    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      if (userEmail) {
        const teacherData = await teacherInfo(userEmail, source);
        if (!teacherData) {
          setError('Not Found Teacher with this email.');
          return;
        }
      }
      localStorage.setItem('source', source);
    } catch (error) {
      console.error('Error during sign-in:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleEmailSubmit = async () => {
    if (!source) {
      setError('Please select a project.');
      return;
    }

    try {
      const teacher = await checkEmail(email, source);
      //add source to local storage
      localStorage.setItem('source', source);
      if (teacher) {
        await handleFirebaseEmailLogin();
      } else {
        setError('Not Found Teacher with this email.');
      }
    } catch (error) {
      console.error('Error during email authentication:', error);
      setError('Email authentication failed. Please check your email and try again.');
    }
  };

  const handleFirebaseEmailLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, '12345678');
      localStorage.setItem('source', source);
      console.error('Email sign-in successful');
    } catch (error: any) {
      console.error('Error during email sign-in:', error);
        try {
          await createUserWithEmailAndPassword(auth, email, '12345678');
          await signInWithEmailAndPassword(auth, email, '12345678');
          localStorage.setItem('source', source);
        } catch (registerError) {
          setError('Failed to register with provided email. Please try again.');
        }
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <img src={speechLogo} alt="Logo" className="login-logo" />
        <h2 className="login-header">Chat for Speech Teacher</h2>
        <div className="project-selection-row">
          <label className="project-option ua">
            <input
              type="radio"
              value="ua"
              checked={source === 'ua'}
              onChange={() => {
                setSource('ua')
                updateSource('ua')
              }}
            />
            Мова-Промова
          </label>
          <label className="project-option main">
            <input
              type="radio"
              value="ru"
              checked={source === 'ru'}
              onChange={() =>{
                setSource('ru')
                updateSource('ru')
              }}
            />
            Говорика
          </label>
          <label className="project-option pl">
            <input
              type="radio"
              value="pl"
              checked={source === 'pl'}
              onChange={() => {
                setSource('pl')
                updateSource('pl')
              }}
            />
            Poland
          </label>
        </div>
        <div className="email-login">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="email-input"
          />
          <button onClick={handleEmailSubmit} className="login-button email-login-button">
            Sign in
          </button>
        </div>
        <button onClick={handleGoogleLogin} className="login-button google-login-button">
          <FcGoogle className="google-icon" /> Sign in with Google
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
