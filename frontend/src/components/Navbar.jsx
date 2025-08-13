import React, { useEffect, useState, useRef } from "react";
import Codex from "./Codex";
import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
import Book from "./Book";
import Book_Crate from "./Book_Crate";
import Readers_Grove from "./Readers_Grove";
import User from "./User";
import Admin_Donations from "./Admin_Donations";
import Cart from "./Cart";
import Donations from "./Donations";
import Checkout from "./Checkout";

function Navbar({ page, setPage }) {
  const urlPrefix = "http://localhost:8000";
  const [isbn, setIsbn] = useState(null);
  const [userData, setUserData] = useState(null);
  const [logout, setLogout] = useState(false);
  const [profile, setProfile] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [bookCrateSource, setBookCrateSource] = useState(
    "/assets/book_crate/Initial.png"
  );
  const [readersGroveSource, setReadersGroveSource] = useState(
    "/assets/readers_grove/Initial.png"
  );
  const [codexSource, setCodexSource] = useState("/assets/codex/Initial.png");

  useEffect(() => {
    if (!userData || !userData?.isUser) return;
    fetch(`${urlPrefix}/logout`).then(() => {
      setUserData(null);
      setPage("default");
    });
  }, [logout]);

  function renderPage() {
    switch (page) {
      case "codex":
        return (
          <Codex setPage={setPage} setIsbn={setIsbn} userData={userData} />
        );
      case "login":
        return <Login setPage={setPage} setUserData={setUserData} />;
      case "register":
        return <Register setPage={setPage} setUserData={setUserData} />;
      case "default":
        return <Landing setPage={setPage} userData={userData} />;
      case "book":
        return (
          <Book
            isbn={isbn}
            setPage={setPage}
            userData={userData}
            setProfile={setProfile}
            setCheckoutItems={setCheckoutItems}
          />
        );
      case "user":
        return (
          <User
            setIsbn={setIsbn}
            setPage={setPage}
            userData={userData}
            profileData={profile}
          />
        );
      case "book_crate":
        return (
          <Book_Crate setPage={setPage} setIsbn={setIsbn} userData={userData} />
        );
      case "readers_grove":
        return (
          <Readers_Grove
            setPage={setPage}
            userData={userData}
            setIsbn={setIsbn}
            setProfile={setProfile}
            setUserData={setUserData}
          />
        );
      case "admin_donations":
        return (
          <Admin_Donations
            setPage={setPage}
            userData={userData}
            setIsbn={setIsbn}
          />
        );
      case "donations":
        return (
          <Donations setPage={setPage} userData={userData} setIsbn={setIsbn} />
        );
      case "cart":
        return (
          <Cart
            setPage={setPage}
            userData={userData}
            setIsbn={setIsbn}
            setCheckoutItems={setCheckoutItems}
            checkoutItems={checkoutItems}
          />
        );
      case "checkout":
        return (
          <Checkout
            setPage={setPage}
            userData={userData}
            setIsbn={setIsbn}
            checkoutItems={checkoutItems}
            setUserData={setUserData}
          />
        );
    }
  }
  const bookCrateTimeout = useRef(null);
  const readersGroveTimeout = useRef(null);
  const codexTimeout = useRef(null);

  function codexHover() {
    if (codexTimeout.current) {
      clearTimeout(codexTimeout.current);
      codexTimeout.current = null;
    }
    setCodexSource("/assets/codex/Animation_1.gif");
    codexTimeout.current = setTimeout(
      () => setCodexSource("/assets/codex/Animation_2.gif"),
      2050
    );
  }

  function codexLeave() {
    if (codexTimeout.current) {
      clearTimeout(codexTimeout.current);
      codexTimeout.current = null;
    }
    setCodexSource("/assets/codex/Initial.png");
  }

  function codexClick() {
    if (codexTimeout.current) {
      clearTimeout(codexTimeout.current);
      codexTimeout.current = null;
    }
    setCodexSource("/assets/codex/Final.png");
    setTimeout(() => setPage("codex"), 500);
  }

  function bookCrateHover() {
    if (bookCrateTimeout.current) {
      clearTimeout(bookCrateTimeout.current);
    }
    setBookCrateSource("/assets/book_crate/Animation.gif");
    bookCrateTimeout.current = setTimeout(
      () => setBookCrateSource("/assets/book_crate/Final.png"),
      1750
    );
  }

  function bookCrateLeave() {
    if (bookCrateTimeout.current) {
      clearTimeout(bookCrateTimeout.current);
      bookCrateTimeout.current = null;
    }
    setBookCrateSource("/assets/book_crate/Initial.png");
  }

  function bookCrateClick() {
    if (bookCrateTimeout.current) {
      clearTimeout(bookCrateTimeout.current);
      bookCrateTimeout.current = null;
    }
    setBookCrateSource("/assets/book_crate/Final.png");
    setTimeout(() => setPage("book_crate"), 500);
  }

  function readersGroveHover() {
    if (readersGroveTimeout.current) {
      clearTimeout(readersGroveTimeout.current);
      readersGroveTimeout.current = null;
    }
    setReadersGroveSource("/assets/readers_grove/Animation.gif");
    readersGroveTimeout.current = setTimeout(
      () => setReadersGroveSource("/assets/readers_grove/Final.png"),
      1450
    );
  }

  function readersGroveLeave() {
    if (readersGroveTimeout.current) {
      clearTimeout(readersGroveTimeout.current);
      readersGroveTimeout.current = null;
    }
    setReadersGroveSource("/assets/readers_grove/Initial.png");
  }

  function readersGroveClick() {
    if (readersGroveTimeout.current) {
      clearTimeout(readersGroveTimeout.current);
      readersGroveTimeout.current = null;
    }
    setReadersGroveSource("/assets/readers_grove/Click.png");
    setTimeout(() => setPage("readers_grove"), 500);
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
            <li
              className="nav-item"
              onMouseEnter={() => bookCrateHover()}
              onMouseLeave={() => bookCrateLeave()}
              onClick={() => bookCrateClick()}
            >
              <span className="nav-link" id="book_crate_link">
                <img id="book_crate_image" src={bookCrateSource} />
                Book Crate
              </span>
            </li>
            <li
              className="nav-item"
              onMouseEnter={() => readersGroveHover()}
              onMouseLeave={() => readersGroveLeave()}
              onClick={() => readersGroveClick()}
            >
              <span className="nav-link" id="readers_grove_link">
                <img id="readers_grove_image" src={readersGroveSource} />
                Reader's Grove
              </span>
            </li>
            <li
              className="nav-item"
              onMouseEnter={() => codexHover()}
              onMouseLeave={() => codexLeave()}
              onClick={() => codexClick()}
            >
              <span className="nav-link" id="codex_link">
                <img id="codex_image" src={codexSource} />
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
              <li
                className="nav-item"
                id="logout"
                onClick={() => {
                  setLogout(!logout);
                }}
              >
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
