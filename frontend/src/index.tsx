import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import { RegisterPage } from './pages/Register';
import { LoginPage } from './pages/Login';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>,
)
