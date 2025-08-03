import React, { useState, useEffect } from "react";
import getToken from "./getToken.jsx";

// Complete Setup
function Login({ setPage, setUserData }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [payload, setPayload] = useState({});
  const [invalid, setInvalid] = useState(null);

  useEffect(() => {
    if (!payload?.username || !payload?.password) return;
    fetch(`${urlPrefix}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!data.isUser) {
          setInvalid(data.message);
          return;
        }
        setUserData(data);
        setPage("readers_grove");
      })
      .catch((error) => console.log(error));
  }, [payload]);

  function submitForm(event) {
    event.preventDefault();
    setInvalid(null);
    const form = event.target;
    const details = {
      username: form.querySelector("[name='username']").value.trim(),
      password: form.querySelector("[name='password']").value.trim(),
    };
    setPayload(details);
  }

  return (
    <>
      <div id="login_wrapper">
        <div id="login_body_div">
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
            {invalid ? <p>{invalid}</p> : null}
            <p>
              Don't have an account?
              <a onClick={() => setPage("register")}> Register here.</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
