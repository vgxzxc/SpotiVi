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
      device_id: null,
      interval: 1000,
      loading: true
    };

    this.updateSongInfo = this.updateSongInfo.bind(this);
    this.getPlayerState = this.getPlayerState.bind(this);
  }

  getPlayerState() {
    fetch("/player/playerstate")
      .then(res => res.json())
      .then(songDetails => {
        if (songDetails === null) {
          this.state["device_id"] = null;
        } else {
          this.setState(songDetails);
          this.setCookie();
        }

        console.log(document.cookie);
      });
  }

  setCookie() {
    if (document.cookie === "") {
      if (this.state.device_id !== null) {
        document.cookie = "device_id=" + this.state.device_id;
      }
    }
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

    this.getPlayerState();
    setTimeout(() => {
      this.setState({ loading: false });
    }, 200);

    // this.timer = setInterval(() => this.updateSongInfo(), this.state.interval);
  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("keypress", this.handleKeyPress.bind(this));
  }

  onFocus = () => {
    console.log("The focus happens");
    this.getPlayerState();

    this.timer = setInterval(() => this.updateSongInfo(), this.state.interval);
  };

  onBlur = () => {
    console.log("The blur happens");
    clearInterval(this.timer);
  };

  updateSongInfo = () => {
    console.log("Update song info is happening every second");
    this.getPlayerState();
    // this.forceUpdate();
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
      return <i class="fas fa-pause fa-3x" id="play" />;
    } else {
      return <i class="fas fa-play fa-3x" id="play" />;
    }
  }

  shuffle() {
    if (this.state.shuffle) {
      return <i class="fas fa-random active" id="shuffle" />;
    } else {
      return <i class="fas fa-random" id="shuffle" />;
    }
  }

  repeat() {
    if (this.state.repeat == "track") {
      return <i class="fas fa-retweet active" id="repeat" />;
    } else if (this.state.repeat == "context") {
      return <i class="fas fa-retweet semi-active" id="repeat" />;
    } else {
      return <i class="fas fa-retweet" id="repeat" />;
    }
  }

  render() {
    if (this.state.loading === true) {
      return <h1> </h1>;
    } else {
      if (this.state.authorized !== null) {
        if (this.state.device_id !== null) {
          return (
            <div class="main">
              <div>
                <img src={this.state.songImageURL} id="albumImage" />
                <hr />
                <h1 id="songName">{this.state.songName}</h1>
                <h2 id="songArtists">{this.formatArtists()}</h2>
                <h2 id="songAlbum">{this.state.songAlbum}</h2>
                <div class="playerControls">
                  {this.shuffle()}
                  <i class="fas fa-backward fa-2x" id="previous" />
                  {this.playing()}
                  <i class="fas fa-forward fa-2x" id="next" />
                  {this.repeat()}
                </div>
              </div>

              {/* <div class="status-line">
              <div class="help">
                <h6>Press "?" for Help</h6>
              </div>
            </div> */}
            </div>
          );
        } else {
          return (
            <div class="main">
              <h1>There is no active device</h1>
              <h2>
                If the local device has been activated, press the space key to
                resume playback
              </h2>
            </div>
          );
        }
      } else {
        return (
          <div class="main">
            <h1 id="title">
              Spoti<span id="Vi-title">Vi</span>
            </h1>
            <form action="http://localhost:8888/login" method="get">
              <input
                type="submit"
                value="Log in with Spotify"
                name="Submit"
                id="login-button"
                class="btn btn-secondary btn-lg"
              />
            </form>

            <div class="disclosure">
              <h6>Made by Russell Islam</h6>
              <h6>I am not a UX designer by any means</h6>
            </div>
          </div>
        );
      }
    }
  }
}

export default SongDetails;
