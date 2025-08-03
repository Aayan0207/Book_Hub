import React from "react";

function Register({ setPage }) {
  return (
    <>
      <div id="register_wrapper">
        <div id="register_body_div">
          <h2>Register</h2>
          <form action="/register" method="post" id="register_form">
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
          <p>
            Already have an account?&nbsp;
            <a onClick={() => setPage("login")}>Log In here.</a>
          </p>
        </div>
      </div>
    </>
  );
}
export default Register;
