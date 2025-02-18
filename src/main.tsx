import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import isMobile from 'is-mobile';
import MobileAppAndroid from './mobile/AppMobile.tsx';
import MobileAppIOS from './mobile/AppMobileIos.tsx';

// Проверка Android / iOS в Chrome
const userAgent = navigator.userAgent.toLowerCase();
const isAndroid = userAgent.includes('android');
const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');

createRoot(document.getElementById('root')!).render(
  <>
    {isMobile() ? (isAndroid ? <MobileAppAndroid /> : <MobileAppIOS />) : <App />}
  </>
);
