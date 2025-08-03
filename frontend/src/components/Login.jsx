import React, { useState, useEffect } from "react";
import getToken from "./getToken.jsx";

// Complete Setup
function Login({ setPage, setUserData }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [payload, setPayload] = useState({});
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    if (!payload?.username || !payload?.password) return;
    fetch(`${urlPrefix}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials:"include",
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.isUser) {
          setInvalid(true);
          return;
        }
        setUserData(data);
        setPage("readers_grove");
      })
      .catch((error) => console.log(error));
  }, [payload]);

  function submitForm(event) {
    event.preventDefault();
    setInvalid(false);
    const form = event.target;
    const details = {
      username: form.querySelector("[name='username']").value,
      password: form.querySelector("[name='password']").value,
    };
    setPayload(details);
  }

  return (
    <>
      <div id="login_wrapper">
        <div id="login_body_div">
          {invalid ? <p>Invalid Username and/or Password</p> : null}
          <h2>Login</h2>
          <form
            action="/login"
            method="post"
            id="login_form"
            onSubmit={(event) => submitForm(event)}
          >
            <div className="form-group">
              <input
                autoFocus
                className="form-control"
                type="text"
                name="username"
                autoComplete="off"
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="off"
              />
            </div>
            <input className="btn btn-primary" type="submit" value="Login" />
            <p>
              Don't have an account?
              <a onClick={() => setPage("register")} style={{color:"gold", cursor:"pointer"}}> Register here.</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
