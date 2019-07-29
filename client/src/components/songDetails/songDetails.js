// import React from "react";
// import ReactDOM from "react-dom";
// import "./songDetails.css";

// class songDetails extends React.Component {
//   constructor() {
//     super();
//     this.state = {
//       shuffle: null,
//       repeat: null,
//       playing: null,
//       songName: null,
//       songArtists: [],
//       songAlbum: null,
//       songImageURL: null
//     };
//   }

//   // componentDidMount() {
//   //   fetch("/player/playerstate")
//   //     .then(res => res.json())
//   // }

//   render() {
//     return (
//       <div>
//         <h1>This is from the songDetails component</h1>
//       </div>
//     );
//   }
// }

// export default songDetails;

import React from "react";
import ReactDOM from "react-dom";

class SongDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      index: 0
    };
  }

  render() {
    return (
      <div>
        <h2>Song Details</h2>
        <h1>{this.state.index}</h1>
      </div>
    );
  }
}

export default SongDetails;
