import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

//Profile page component, displayed when we are logged in
const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }
  return (
    isAuthenticated && (
      <div style={{margin: '0 auto', padding: '50px'}}>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

export default Profile;