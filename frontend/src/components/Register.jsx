import React, { useState } from "react";
import getToken from "./getToken.jsx";

function Register({ setPage, setUserData }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [invalid, setInvalid] = useState(null);

  function submitForm(event) {
    event.preventDefault();
    setInvalid(null);
    const form = event.target;

    fetch(`${urlPrefix}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
      body: JSON.stringify({
        username: form.querySelector("[name='username']").value,
        email: form.querySelector("[name='email']").value,
        password: form.querySelector("[name='password']").value,
        confirmation: form.querySelector("[name='confirmation']").value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data?.isUser) {
          setInvalid(data.message);
          return;
        }
        setUserData(data);
        setPage("readers_grove");
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      <div id="register_wrapper">
        <div id="register_body_div">
          <h2>Register</h2>
          <form
            action="/register"
            method="post"
            id="register_form"
            onSubmit={(event) => submitForm(event)}
          >
            <div className="form-group">
              <input
                className="form-control"
                autoFocus
                type="text"
                name="username"
                placeholder="Username"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="Email Address"
                autoComplete="off"
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
            <div className="form-group">
              <input
                className="form-control"
                type="password"
                name="confirmation"
                placeholder="Confirm Password"
                autoComplete="off"
              />
            </div>
            <input className="btn btn-primary" type="submit" value="Register" />
          </form>
          {invalid ? <p>{invalid}</p> : null}
          <p>
            Already have an account?&nbsp;
            <a onClick={() => setPage("login")}>Login here.</a>
          </p>
        </div>
      </div>
    </>
  );
}
export default Register;
