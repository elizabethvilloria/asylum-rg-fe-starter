import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from 'antd';

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return <Button style={{color: 'white'}} type={'link'} className='login-btn' onClick={() => loginWithRedirect()}>Log In</Button>;
};

export default Login;