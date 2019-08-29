# SpotiVi

A custom made Spotify web client/interface using the Spotify Web API which provides music playback functionality using Vim hotkeys.

### Prerequisites
To use this, you need
* Node.js (version 10 or above)
* Chrome (this is the best browser to use for this)
* A Spotify Premium Account

### Installation
In order to use this with your Spotify account, we need to setup a Spotify app within your account which will allow this app to communicate with your account. To do this, do the following steps.
1. Go to the Spotify API Dashboard: https://developer.spotify.com/dashboard/ and log in
2. In the top right, there will be a "Create a Client ID" button. Click that
3. Fill out the following info, putting in honestly anything you want. To make it easy to remember, the name could be made "SpotiVi"
4. For the "What are you building?" option, it's easiest to put "I don't know" as it's not a commerical app anyways
5. Once created, it will redirect you to your app dashboard. You will see your Client ID and Client Secret tokens. 
6. In the `helpers/endpoints.js` file, there are two variables near the top of the file: `client_id` and  `client_secret`. Fill these in with the tokens from the dashboard.
7. Go back to the dashboard and click the "Edit Settings" button on the right of the screen. In the "Redirect URIs" field, enter `http://localhost:8888/callback` and add it to the app. The required setup on the Spotify API side is done.
8. Navigate to the root directory and run `npm install`. Once completed, navigate into the `client` directory and also run `npm install`
9. Now the app is finished installing. To launch it, navigate to the root directory and run the command `npm run spotivi`. This will launch the app in your default browser.
10. In order for the app to know which Spotify client to interact with, you will need to launch Spotify on your system and play any song. This will let Spotify know that there is an active device and the app will use cookies to remember that this is the device to be used from hereon. 

### Using SpotiVi
To use the app, similar to the installation step, navigate to the root directory and run the command `npm run spotivi`. This will open it in your default browser.

Once logged in, you will be redirected to the main player, which will display the player details. There are no clickable buttons, everything is used through hotkeys (so if you want to force yourself to get used to the hand placement on your keyboard, this might help). Currently, there are a few Vim hotkeys that are implemented, which provides the core functionality:
* `space`: Play/pause current track
* `l`: Play next track
* `h`: Start from beginning of track or play previous track
* `s`: Toggle shuffle on or off
* `r`: Toggle between no repeat, context repeat or track repeat

### Future Plans
Currently, the app only supports usage with a single playlist. In the future, I would like to add the following functionality:
* Ability to select playlists
* Ability to search for music
* Ability to go to the first song in the current playlist (Kind of equivalent to the `gg` command in Vim)

### Built With
* Node.js for handling all of the requests
* React (create-react-app) for the front-end
* Spotify Web API to communicate with Spotify

### Why did I Make This?
As a Vim user, my least favourite thing in the world is to take my hands off my keyboard to do anything. Coding? I use Vim. Navigating Chrome? I use this amazing Chrome extension called [Vimium](https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb?hl=en). But everytime I'm coding and listening to music on Spotify, I instinctively press `alt+tab` and try to press the `L` key (which is used in Vim to move the cursor to the right) to try and change the song. But it's infuriating that no matter how many times I press the `L` key, nothing happens. So I did what any logical developer would do, spend like 89 hours making something that would save me like 4 seconds.

### License
This project is licensed under the MIT License
