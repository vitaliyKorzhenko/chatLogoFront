import React from 'react';
import './Login.css';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import speechLogo from './assets/speechLogo.jpeg';
import { FcGoogle } from 'react-icons/fc';

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      console.log('Successfully logged in');
      // add your post-login logic here
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <img src={speechLogo} alt="Logo" className="login-logo" />
        <h2 className="login-header">Chat for Speech Therapist</h2>
        <button onClick={handleGoogleLogin} className="login-button">
          <FcGoogle className="google-icon" /> Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;