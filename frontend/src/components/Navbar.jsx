import React, { useState } from "react";
import Codex from "./Codex";
import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
function Navbar({ page, setPage }) {
  function renderPage() {
    switch (page) {
      case "codex":
        return <Codex />;
      case "login":
        return <Login setPage={setPage} />;
      case "register":
        return <Register setPage={setPage} />;
      case "default":
        return <Landing setPage={setPage} />;
    }
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg" id="head_navbar">
        <div>
          <ul className="navbar-nav mr-auto">
            <li className="nav-item" onClick={() => setPage("default")}>
              <img id="book_hub_image" src="/assets/main/BookHub_Icon.png" />
              Book Hub
            </li>
            <li className="nav-item" onClick={() => setPage("book_crate")}>
              <img
                id="book_crate_image"
                src="/assets/book_crate/Book_crate_base.png"
              />
              Book Crate
            </li>
            <li className="nav-item" onClick={() => setPage("readres_grove")}>
              <img
                id="readers_grove_image"
                src="/assets/readers_grove/Readers_Grove_Initial.png"
              />
              Reader's Grove
            </li>
            <li className="nav-item" onClick={() => setPage("codex")}>
              <img id="codex_image" src="/assets/codex/Codex_base.png" />
              Codex
            </li>
            <li className="nav-item">
              <input type="hidden" value="{{user.username}}" id="username" />
            </li>
            <li className="nav-item" id="logout">
              Logout
            </li>
            <li
              className="nav-item"
              id="login"
              onClick={() => setPage("login")}
            >
              Login
            </li>
            <li
              className="nav-item"
              id="register"
              onClick={() => setPage("register")}
            >
              Register
            </li>
          </ul>
        </div>
      </nav>
      <div>{renderPage()}</div>
    </>
  );
}
export default Navbar;
