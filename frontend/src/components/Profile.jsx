import React, { useState, useEffect } from "react";

function Profile({ userData }) {
  const [quote, setQuote] = useState(null);

  useEffect(()=> {},[userData]);
  return (
    <>
      <div id="user_info">
        <h2>{userData.user}</h2>
        <div id="credits_div">
          <hr />
          {
            userData.isSuper ? (
              <p id="credits_p">Admin. No Credits required.</p>
            ) : null /*Change for regular user*/
          }
          <hr />
        </div>
        <div id="quote_div">
          <p id="quote">{quote}</p>
        </div>
      </div>
    </>
  );
}

export default Profile;
