import React from "react";
import ReactDOM from "react-dom";

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
      authorized: null
    };
  }

  componentDidMount() {

    window.addEventListener("focus", this.onFocus);

    fetch("/isAuthorized")
      .then(resp => resp.json())
      .then(respJson => {
        this.state["authorized"] = respJson["access_token"];
      });

    document.addEventListener("keypress", this.handleKeyPress.bind(this));
    fetch("/player/playerstate")
      .then(res => res.json())
      .then(songDetails => this.setState(songDetails));
  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus);
    document.removeEventListener("keypress", this.handleKeyPress.bind(this));
  }

  onFocus = () => {
    fetch("/player/playerstate")
      .then(res => res.json())
      .then(songDetails => this.setState(songDetails));
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

  isAuthorized() {
    fetch("/isAuthorized")
      .then(resp => resp.json())
      .then(respJson => {
        return respJson["access_token"];
      });
  }

  render() {
    // let authorized = null;
    // fetch("/isAuthorized")
    //   .then(resp => resp.json())
    //   .then(respJson => {
    //     authorized = respJson["access_token"];
    //     console.log("This is authroized in the promise: " + authorized);
    //   });
    // console.log("This is authorized: " + authorized);

    if (this.state.authorized) {
      return (
        <div>
          <img src={this.state.songImageURL} />
          <h1>{this.state.songName}</h1>
          <h2>{this.formatArtists()}</h2>
          <h2>{this.state.songAlbum}</h2>
          <h3> playing: {this.state.playing.toString()} </h3>
          <h4>
            shuffle: {this.state.shuffle.toString()} | repeat:{" "}
            {this.state.repeat}
          </h4>
        </div>
      );
    } else {
      return (
        <div>
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
