import React from "react";

// Complete Setup
function Login({ setPage }) {
  return (
    <>
      <div id="login_wrapper">
        <div id="login_body_div">
          <h2>Login</h2>
          <form action="/login" method="post" id="login_form">
            <div className="form-group">
              <input
                autofocus
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
              Don't have an account? &nbsp;
              <p onClick={() => setPage("register")}> Register here.</p>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
