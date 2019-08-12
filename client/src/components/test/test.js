import React from "react";
import ReactDOM from "react-dom";
import "./test.css";

class SongDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      shuffle: false,
      repeat: null,
      playing: false,
      songName: null,
      songArtists: [],
      songAlbum: null,
      songImageURL: null,
      authorized: null,
      interval: 1000
    };

    this.updateSongInfo = this.updateSongInfo.bind(this);
  }

  componentDidMount() {
    window.addEventListener("focus", this.onFocus);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("keypress", this.handleKeyPress.bind(this));

    fetch("/isAuthorized")
      .then(resp => resp.json())
      .then(respJson => {
        this.state["authorized"] = respJson["access_token"];
      });

    fetch("/player/playerstate")
      .then(res => res.json())
      .then(songDetails => this.setState(songDetails));

    this.timer = setInterval(() => this.updateSongInfo(), this.state.interval);
  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("keypress", this.handleKeyPress.bind(this));
  }

  onFocus = () => {
    fetch("/player/playerstate")
      .then(res => res.json())
      .then(songDetails => this.setState(songDetails));

    this.timer = setInterval(() => this.updateSongInfo(), this.state.interval);
  };

  onBlur = () => {
    console.log("The blur happens");
    clearInterval(this.timer);
  };

  updateSongInfo = () => {
    console.log("Update song info is happening every second");
    fetch("/player/playerstate")
      .then(res => res.json())
      .then(songDetails => this.setState(songDetails));
  };

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

  isAuthorized() {
    fetch("/isAuthorized")
      .then(resp => resp.json())
      .then(respJson => {
        return respJson["access_token"];
      });
  }

  playing() {
    if (this.state.playing) {
      return (<i class="fas fa-play" id="play"></i>);
    } else {
      return (<i class="fas fa-pause" id="play"></i>)
    }
  }

  render() {
    if (this.state.authorized) {
      return (
        <div id="songDetails">
          <img src={this.state.songImageURL} id="albumImage" />
          <p> </p>
          <h1 id="songName">{this.state.songName}</h1>
          <h2 id="songArtists">{this.formatArtists()}</h2>
          <h2 id="songAlbum">{this.state.songAlbum}</h2>
          <h3 id="playingStatus"> playing: {this.state.playing.toString()} </h3>
          <h4>
            shuffle: {this.state.shuffle.toString()} | repeat:{" "}
            {this.state.repeat}
          </h4>
          <div class="playerControls">
            <i class="fas fa-random" id="shuffle"></i>
            <i class="fas fa-backward" id="previous"></i>
            {this.playing()}
            <i class="fas fa-forward" id="next"></i>
            <i class="fas fa-retweet" id="repeat"></i>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h1>SpotiVi</h1>
          <form action="http://localhost:8888/login" method="get">
            <input
              type="submit"
              value="Log in with Spotify"
              name="Submit"
              id="frm1_submit"
            />
          </form>
        </div>
      );
    }
  }
}

export default SongDetails;
