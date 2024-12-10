import React, { useState } from 'react';
import './Login.css';
import { getAuth, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import speechLogo from './assets/speechLogo.jpeg';
import { FcGoogle } from 'react-icons/fc';
import { checkEmail, teacherInfo } from './axios/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Successfully logged in with Google', result);
      
      // Check if teacher exists in the system
      const userEmail = result.user.email;
      if (userEmail) {
        try {
          const teacherData = await teacherInfo(userEmail);
          if (!teacherData) {
            setError('Not Found Teacher with this email.');
            return;
          }
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            setError('Not Found Teacher with this email.');
            return;
          } else {
            console.error('Error fetching teacher info:', error);
            setError('Error fetching teacher info. Please try again.');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleFirebaseEmailLogin = async () => {
    const auth = getAuth();
    try {
      // Try to sign in with email and default password
      await signInWithEmailAndPassword(auth, email, '12345678');
      console.log('Successfully logged in with email');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || 'auth/invalid-credential') {
        // If user does not exist, create a new one
        try {

          await createUserWithEmailAndPassword(auth, email, '12345678');
          console.log('Successfully registered and logged in with email');
        } catch (registerError) {
          console.error('Error during email registration:', registerError);
          setError('Failed to register with provided email. Please try again.');
        }
      } else {
        console.error('Error during email sign-in:', error);
        setError('Failed to log in with provided email. Please try again.');
      }
    }
  };



  const handleEmailSubmit = async () => {
    try {
      const teacher = await checkEmail(email);
      console.log('Teacher data:', teacher);
      if (teacher) {
        // If teacher data exists, attempt to log in
        await handleFirebaseEmailLogin();
      } else {
        setError('Not Found Teacher with this email.');
      }

    } catch (error) {
      console.error('Error during email authentication:', error);
      setError('Email authentication failed. Please check your email and try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <img src={speechLogo} alt="Logo" className="login-logo" />
        <h2 className="login-header">Chat for Speech teacher</h2>
        <div className="email-login">
          <div className="email-login-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="email-input"
            />
            <button onClick={handleEmailSubmit} className="login-button email-login-button">
              Sign in with Email
            </button>
          </div>
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