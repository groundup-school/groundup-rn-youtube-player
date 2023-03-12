import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  View,
  StyleSheet,
  requireNativeComponent,
  UIManager,
  NativeModules,
  BackHandler,
} from 'react-native';

const RCTYouTube = requireNativeComponent('ReactYouTube', YouTube, {
  nativeOnly: {
    onYouTubeError: true,
    onYouTubeErrorReady: true,
    onYouTubeErrorChangeState: true,
    onYouTubeErrorChangeQuality: true,
    onYouTubeChangeFullscreen: true,
  },
});

export default class YouTube extends React.Component {
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    videoId: PropTypes.string,
    videoIds: PropTypes.arrayOf(PropTypes.string),
    playlistId: PropTypes.string,
    play: PropTypes.bool,
    loop: PropTypes.bool,
    fullscreen: PropTypes.bool,
    controls: PropTypes.oneOf([0, 1, 2]),
    showFullscreenButton: PropTypes.bool,
    onError: PropTypes.func,
    onReady: PropTypes.func,
    onChangeState: PropTypes.func,
    onChangeQuality: PropTypes.func,
    onChangeFullscreen: PropTypes.func,
    style: PropTypes.object,
  };

  static defaultProps = {
    showFullscreenButton: true,
  };

  _nativeComponentRef = React.createRef();

  constructor(props) {
    super(props);

    BackHandler.addEventListener('hardwareBackPress', this._backPress);

    this.state = {
      fullscreen: props.fullscreen,
    };
  }

  componentDidUpdate(prevProps) {
    // Translate next `fullscreen` prop to state
    if (prevProps.fullscreen !== this.props.fullscreen) {
      this.setState({ fullscreen: this.props.fullscreen });
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._backPress);
  }

  _backPress = () => {
    if (this.state.fullscreen) {
      this.setState({ fullscreen: false });

      return true;
    }

    return false;
  };

  _onError = (event) => {
    if (this.props.onError) {
      this.props.onError(event.nativeEvent);
    }
  };

  _onReady = (event) => {
    if (this.props.onReady) {
      this.props.onReady(event.nativeEvent);
    }
  };

  _onChangeState = (event) => {
    if (this.props.onChangeState) {
      this.props.onChangeState(event.nativeEvent);
    }
  };

  _onChangeQuality = (event) => {
    if (this.props.onChangeQuality) {
      this.props.onChangeQuality(event.nativeEvent);
    }
  };

  // _onChangeFullscreen = (event) => {
  //   const { isFullscreen } = event.nativeEvent;
  //   if (this.state.fullscreen !== isFullscreen) {
  //     this.setState({ fullscreen: isFullscreen });
  //   }

  //   if (this.props.onChangeFullscreen) {
  //     this.props.onChangeFullscreen(event.nativeEvent);
  //   }
  // };

  seekTo(seconds) {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
      UIManager.getViewManagerConfig('ReactYouTube').Commands.seekTo,
      [seconds],
    );
  }

  nextVideo() {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
      UIManager.getViewManagerConfig('ReactYouTube').Commands.nextVideo,
      [],
    );
  }

  previousVideo() {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
      UIManager.getViewManagerConfig('ReactYouTube').Commands.previousVideo,
      [],
    );
  }

  playVideoAt(index) {
    UIManager.dispatchViewManagerCommand(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
      UIManager.getViewManagerConfig('ReactYouTube').Commands.playVideoAt,
      [parseInt(index, 10)],
    );
  }

  getVideosIndex = () =>
    NativeModules.ReactNativeYouTubePlayerModule.getVideosIndex(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
    );

  getDuration = () =>
    NativeModules.ReactNativeYouTubePlayerModule.getDuration(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
    );

  getCurrentTime = () =>
    NativeModules.ReactNativeYouTubePlayerModule.getCurrentTime(
      ReactNative.findNodeHandle(this._nativeComponentRef.current),
    );

  render() {
    return (
      <View onLayout={this._onLayout} style={[styles.container, this.props.style]}>
        <RCTYouTube
          ref={this._nativeComponentRef}
          {...this.props}
          // fullscreen={this.state.fullscreen}
          style={styles.module}
          onYouTubeError={this._onError}
          onYouTubeReady={this._onReady}
          onYouTubeChangeState={this._onChangeState}
          // onYouTubeChangeQuality={this._onChangeQuality}
          // onYouTubeChangeFullscreen={this._onChangeFullscreen}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  module: {
    flex: 1,
  },
});
