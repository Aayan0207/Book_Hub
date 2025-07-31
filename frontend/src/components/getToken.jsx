import React, { useState, useEffect } from "react";
function useCSRFToken() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    fetch("http://localhost:8000/csrf_token", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then(() => {
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrftoken="))
          .split("=")[1];
        setToken(cookie);
      });
  }, []);
  return token;
}
export default useCSRFToken;
