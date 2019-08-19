import React from "react";
import logo from "./logo.svg";
import "./App.css";
import SongPlayer from "./components/player/player";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <SongPlayer />
      </header>
    </div>
  );
}

export default App;
