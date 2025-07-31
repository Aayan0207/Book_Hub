import React, { useState } from "react";
import Codex from "./Codex";
import Landing from "./Landing";
function Navbar() {
  const [page, setPage] = useState("default");

  function renderPage() {
    switch (page) {
      case "codex":
        return <Codex />;
      case "default":
        return <Landing />;
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
            {/* {% if user.is_authenticated %}
                    <li className="nav-item">
                        <input type="hidden" value="{{user.username}}" id="username">
                        
                    </li>
                {% endif %}
                {% if user.is_authenticated %}
                    <li className="nav-item" id="logout">
                        
                    </li>
                {% else %}
                    <li className="nav-item" id="login">
                        
                    </li>
                    <li className="nav-item" id="register">
                        
                    </li>
                {% endif %} */}
          </ul>
        </div>
      </nav>
      <div>{renderPage()}</div>
    </>
  );
}
export default Navbar;
