import React,{useState} from "react";
import Navbar from "./components/Navbar";

function App() {
  const [page, setPage] = useState("default");

  return (
    <div>
      <Navbar page={page} setPage={setPage}/>
    </div>
  );
}

export default App;
