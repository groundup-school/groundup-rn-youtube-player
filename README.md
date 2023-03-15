#### Importing

```javascript
import YouTube from 'groundup-rn-youtube';
```


## Usage

```jsx
<YouTube
  apiKey="YOUR_API_KEY"
  videoId="KVZ-P-ZI6W4" // The YouTube video ID
  play // control playback of video with true/false
  fullscreen // control whether the video should play in fullscreen or inline
  loop // control whether the video should loop when ended
  onReady={e => this.setState({ isReady: true })}
  onChangeState={e => this.setState({ status: e.state })}
  onChangeQuality={e => this.setState({ quality: e.quality })}
  onError={e => this.setState({ error: e.error })}
  style={{ alignSelf: 'stretch', height: 300 }}
/>
```

Plase this in top level of your project **above** all other component you can wrap this in a view add custom control like play,
pause button and fullscreen button

#### Properties

- `apiKey` (string, _Android_): Your YouTube developer API Key. This parameter is **required**. [More Info](https://developers.google.com/youtube/android/player/register).
- `videoId` (string): The YouTube video ID to play. Can be changed while mounted to change the video playing.
- `videoIds` (strings array): YouTube video IDs to be played as an interactive playlist. Can be changed while mounted. Overridden at start by `videoId`.
- `playlistId` (string): A YouTube Playlist's ID to play as an interactive playlist.
  Can be changed while mounted. Overridden at start by `videoId` and `videoIds`.
- `play` (boolean): Controls playback of video with `true`/`false`. Setting it as `true` in the beginning itself makes the video autoplay on loading. Default: `false`.
- `loop` (boolean): Loops the video. Default: `false`.
- `fullscreen` (boolean): Controls whether the video should play inline or in fullscreen. Default: `false`.
- `controls` (number): Sets the player's controls scheme. Supported values are `0`, `1`, `2`. Default: `1`. On iOS the numbers conform to [These Parameters](https://developers.google.com/youtube/player_parameters?hl=en#controls). On Android the mapping is `0 = CHROMELESS`, `1 = DEFAULT`, `2 = MINIMAL` ([More Info](https://developers.google.com/youtube/android/player/reference/com/google/android/youtube/player/YouTubePlayer.PlayerStyle)).
- `showFullscreenButton` (boolean): Show or hide Fullscreen button. Default: `true`.
- `showinfo` (boolean, _iOS_): Setting the parameter's value to false causes the player to not display information like the video title and uploader before the video starts playing. Default: `true`.
- `modestbranding` (boolean, _iOS_): This parameter lets you use a YouTube player that does not show a YouTube logo. Default: `false`.
- `origin` (string, _iOS_): This parameter provides an extra security measure for the iFrame API.
- `rel` (boolean, _iOS_): Show related videos at the end of the video. Default: `true`.
- `resumePlayAndroid` (boolean, _Android_): Makes the video resume playback after the app resumes from background. Default: `true`.

The iOS implementation of this player uses the official YouTube iFrame under the hood, so most parameters behavior [can be further understood here.](https://developers.google.com/youtube/player_parameters)

#### Events

- `onReady`: Called once when the video player is setup.
- `onChangeState`: Sends the current state of the player on `e.state`. Common values are `buffering`/`playing`/`paused` and more (on Android there is also a `seeking` state that comes with the location of the playback in seconds on `e.currentTime`).
- `onChangeQuality`: Sends the current quality of video playback on `e.quality`.
- `onError`: Sends any errors before and during video playback on `e.error`.
- `onChangeFullscreen`: Called when the player enters or exits the fullscreen mode on `e.isFullscreen`.
- `onProgress` _(iOS)_: Called every 500ms with the time progress of the playback on `e.currentTime`.

#### Methods

- `seekTo(seconds)`: Seeks to a specified time in the video.
- `nextVideo()`: Skip to next video on a playlist (`videoIds` or `playlistId`). When `loop` is true, will skip to the first video from the last. If called on a single video, will restart the video.
- `previousVideo()`: opposite of `nextVideo()`.
- `playVideoAt(index)`: Will start playing the video at `index` (zero-based) position in a playlist (`videoIds` or `playlistId`. Not supported for `playlistId` on Android).
- `getVideosIndex()`: Returns a Promise that results with the `index` (zero-based) number of the video currently played in a playlist (`videoIds` or `playlistId`. Not supported for `playlistId` on Android) or errors with an errorMessage string.
- `getCurrentTime()`: Returns a Promise that results with the `currentTime` of the played video (in seconds) or errors with an errorMessage string. Should be used as an alternative for Android to `onProgress` event on iOS.
- `getDuration()`: Returns a Promise that results with the `duration` of the played video (in seconds) or errors with an errorMessage string. Should be used as an alternative for Android to `onProgress` event on iOS.
- `reloadIframe()` _(iOS)_: Specific props (`fullscreen`, `modestbranding`, `showinfo`, `rel`, `controls`, `origin`) can only be set at mounting and initial loading of the underlying WebView that holds the YouTube iFrame (Those are `<iframe>` parameters). If you want to change one of them during the lifecycle of the component, you should know the usability cost of loading the WebView again, and use this method right after the component received the updated prop.
