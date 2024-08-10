import React from 'react';
import { Image } from 'antd';
import { Link } from 'react-router-dom';
import Logo from '../../styles/Images/WhiteLogo.png';
import { colors } from '../../styles/data_vis_colors';
import { useAuth0 } from '@auth0/auth0-react';
import Login from '../pages/Profile/Login';

const { primary_accent_color } = colors;

function HeaderContent() {

  // Use the useAuth0 hook to access authentication functions and state
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: primary_accent_color,
      }}
    >
      <div className="hrf-logo">
        <a href="https://www.humanrightsfirst.org/">
          <Image width={100} src={Logo} preview={false} alt="HRF logo white" />
        </a>
      </div>
      <div>
        <Link to="/" style={{ color: '#E2F0F7', paddingRight: '75px' }}>
          Home
        </Link>
        <Link to="/graphs" style={{ color: '#E2F0F7' }}>
          Graphs
        </Link>

        {isAuthenticated && (
          <Link to="/profile" style={{ color: '#E2F0F7', paddingRight: '20px', paddingLeft: '70px' }}>
            Profile
          </Link>
        )}

        {isAuthenticated ? (
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            style={{ color: '#E2F0F7', background: 'none', border: 'none', cursor: 'pointer', paddingLeft: '70px' }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            style={{ color: '#E2F0F7', background: 'none', border: 'none', cursor: 'pointer', paddingLeft: '70px' }}
          >
            Login
          </button>
        )}
      </div>
    </div>
    
  );
}

export { HeaderContent };
