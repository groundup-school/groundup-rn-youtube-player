#### Importing

```javascript
import YouTube from 'groundup-rn-youtube-player';
```


## Usage

```jsx
<YouTube
  play={true}
  
  apiKey="YOUR_API_KEY"
  
  videoId="VIDEO_ID"

  markAsCompleteAfterPercent={90} //Percent from [0 - 100]
  onCompleted={() => {
    console.log('ON Completed');
  }}

  notifyAfterSeconds={3} //In Seconds
  onWatchedSeconds={(watchedSeconds) => {
    console.log('Watched:', watchedSeconds)
  }}


  style={{
    width,
    height: 300
  }}
/>
```
