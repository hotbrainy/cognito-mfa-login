import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
ReactDOM.render(
  <>
    <GoogleOAuthProvider clientId="247778479085-pl9e0beo95bfncauto4isrnq6fgkqq4g.apps.googleusercontent.com">
      <GlobalStyles />
      <App />
    </GoogleOAuthProvider>
  </>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
