import React, { useState } from "react";
import Codex from "./Codex";
import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
import Book from "./Book";
import Book_Crate from "./Book_Crate";

function Navbar({ page, setPage }) {
  const [isbn, setIsbn] = useState(null);
  const [userData, setUserData] = useState(null);
  function renderPage() {
    switch (page) {
      case "codex":
        return <Codex setPage={setPage} setIsbn={setIsbn} />;
      case "login":
        return <Login setPage={setPage} setUserData={setUserData} />;
      case "register":
        return <Register setPage={setPage} />;
      case "default":
        return <Landing setPage={setPage} />;
      case "book":
        return <Book isbn={isbn} />;
      case "book_crate":
        return <Book_Crate setPage={setPage} setIsbn={setIsbn} />;
    }
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg" id="head_navbar">
        <div>
          <ul className="navbar-nav mr-auto">
            <li className="nav-item" onClick={() => setPage("default")}>
              <span id="main_page_link" className="nav-link">
                <img id="book_hub_image" src="/assets/main/BookHub_Icon.png" />
                Book Hub
              </span>
            </li>
            <li className="nav-item" onClick={() => setPage("book_crate")}>
              <span className="nav-link" id="book_crate_link">
                <img
                  id="book_crate_image"
                  src="/assets/book_crate/Book_crate_base.png"
                />
                Book Crate
              </span>
            </li>
            <li className="nav-item" onClick={() => setPage("readers_grove")}>
              <span className="nav-link" id="readers_grove_link">
                <img
                  id="readers_grove_image"
                  src="/assets/readers_grove/Readers_Grove_Initial.png"
                />
                Reader's Grove
              </span>
            </li>
            <li className="nav-item" onClick={() => setPage("codex")}>
              <span className="nav-link" id="codex_link">
                <img id="codex_image" src="/assets/codex/Codex_base.png" />
                Codex
              </span>
            </li>
            {userData?.isUser ? (
              <li
                className="nav-item"
                id="display_username"
                onClick={() => setPage("readers_grove")}
              >
                <span className="nav-link">{userData.user}</span>
              </li>
            ) : null}
            {userData?.isUser ? (
              <li className="nav-item" id="logout" onClick={() => {
                setUserData(null);
                setPage("default");
                }}>
                <span className="nav-link">Logout</span>
              </li>
            ) : null}
            {!userData?.isUser ? (
              <li
                className="nav-item"
                id="login"
                onClick={() => setPage("login")}
              >
                <span className="nav-link">Login</span>
              </li>
            ) : null}
            {!userData?.isUser ? (
              <li
                className="nav-item"
                id="register"
                onClick={() => setPage("register")}
              >
                <span className="nav-link">Register</span>
              </li>
            ) : null}
          </ul>
        </div>
      </nav>
      <div>{renderPage()}</div>
    </>
  );
}
export default Navbar;
