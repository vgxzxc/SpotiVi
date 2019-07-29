import React from "react";
import ReactDOM from "react-dom";
import keydown from "react-keydown";

class SongDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      shuffle: null,
      repeat: null,
      playing: null,
      songName: null,
      songArtists: [],
      songAlbum: null,
      songImageURL: null
    };
  }

  componentDidMount() {
    document.addEventListener("keypress", this.handleKeyPress.bind(this));
    fetch("/player/playerstate")
      .then(res => res.json())
      .then(
        songDetails => this.setState(songDetails),
        () => console.log("Now Playing details have been updated")
      );
  }

  formatArtists() {
    return this.state.songArtists.join(", ");
  }

  handleKeyPress(evt) {
    console.log("The key that was pressed was: " + evt.key);
    fetch("/command", {
      method: "POST",
      // body: evt.key,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        key: evt.key
      })
    })
      .then(resp => resp.json())
      .then(respJson => this.setState(respJson));
  }

  render() {
    return (
      <div>
        <img src={this.state.songImageURL} />
        <h1>{this.state.songName}</h1>
        <h2>{this.formatArtists()}</h2>
        <h2>{this.state.songAlbum}</h2>
      </div>
    );
  }
}

export default SongDetails;
