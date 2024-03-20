import React from "react";
import ReactDOM from "react-dom";
import "./player.css";

class SongPlayer extends React.Component {
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
          this.setState({"device_id": null});
        } else {
          this.setState(songDetails);
          this.setCookie("device_id", this.state.device_id);
        }
      });
  }

  setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  componentDidMount() {
    window.addEventListener("focus", this.onFocus);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("keypress", this.handleKeyPress.bind(this));

    fetch("/isAuthorized")
      .then(resp => resp.json())
      .then(respJson => {
        this.setState({"authorized": respJson["access_token"]});
      });

    this.getPlayerState();
    setTimeout(() => {
      this.setState({ loading: false });
    }, 200);

  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("keypress", this.handleKeyPress.bind(this));
  }

  onFocus = () => {
    this.getPlayerState();

    this.timer = setInterval(() => this.updateSongInfo(), this.state.interval);
  };

  onBlur = () => {
    clearInterval(this.timer);
  };

  updateSongInfo = () => {
    this.getPlayerState();
    this.forceUpdate();
  };

  formatArtists() {
    return this.state.songArtists.join(", ");
  }

  handleKeyPress(evt) {
    console.log("The key that was pressed was: " + evt.key);
    fetch("/command", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        key: evt.key,
        device_id: this.getCookie("device_id")
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
      return <i className="fas fa-pause fa-3x" id="play" />;
    } else {
      return <i className="fas fa-play fa-3x" id="play" />;
    }
  }

  shuffle() {
    if (this.state.shuffle) {
      return <i className="fas fa-random active" id="shuffle" />;
    } else {
      return <i className="fas fa-random" id="shuffle" />;
    }
  }

  repeat() {
    if (this.state.repeat === "track") {
      return <i className="fas fa-retweet active" id="repeat" />;
    } else if (this.state.repeat === "context") {
      return <i className="fas fa-retweet semi-active" id="repeat" />;
    } else {
      return <i className="fas fa-retweet" id="repeat" />;
    }
  }

  render() {
    if (this.state.loading === true) {
      return <h1> </h1>;
    } else {
      if (this.state.authorized !== null) {
        if (this.state.device_id !== null) {
          return (
            <div className="main">
              <div>
                <img src={this.state.songImageURL} id="albumImage" />
                <hr/>
                <h1 id="songName">{this.state.songName}</h1>
                <h2 id="songArtists">{this.formatArtists()}</h2>
                <h2 id="songAlbum">{this.state.songAlbum}</h2>
                <div className="playerControls">
                  {this.shuffle()}
                  <i className="fas fa-backward fa-2x" id="previous" />
                  {this.playing()}
                  <i className="fas fa-forward fa-2x" id="next" />
                  {this.repeat()}
                </div>
              </div>

              {/* <div className="status-line">
                <div className="help">
                  <h6>Press "?" for Help</h6>
                </div>
              </div> */}
            </div>
          );
        } else {
          return (
            <div className="main">
              <h1>There is no active device</h1>
              <h2>The device has probably timed out due to inactivity</h2>
              <h2>
                If the local device has been activated, press the space key to
                resume playback
              </h2>
            </div>
          );
        }
      } else {
        return (
          <div className="main">
            <h1 id="title">
              Spoti<span id="Vi-title">Vi</span>
            </h1>
            <form action="http://localhost:7900/login" method="get">
              <input
                type="submit"
                value="Log in with Spotify"
                name="Submit"
                id="login-button"
                className="btn btn-secondary btn-lg"
              />
            </form>

            <div className="disclosure">
              <h6>Made by Russell Islam</h6>
              <h6>I am not a UX designer by any means</h6>
            </div>
          </div>
        );
      }
    }
  }
}

export default SongPlayer;
