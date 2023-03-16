import React, { Component } from "react";
import { View, Image, TouchableOpacity, Text, Dimensions } from "react-native";
import YouTube from "./YouTube";
import SeekBar from "./SeekBar";

const { width, height } = Dimensions.get("window")
const pauseIcon = require("./images/pause.png");
const playIcon = require("./images/play.png");
const previousIcon = require("./images/previous.png");
const nextIcon = require("./images/next.png");
const fullscreenIcon = require("./images/fullscreen.png");

const heightedWidth = height > width ? height - 160 : width - 160;
const normalWidth = width < height ? width - 40 : height - 40;

const timeFormat = (duration) => {  
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

const formatDuration = (d) => {
    if(typeof d != 'string')return '00:00:00';
    let maxLength = 8;
    let rmlength = maxLength - d.length;
    let ap = '';
    for(let i = 1; i <= rmlength; i++){
        if(i%3 === 0){
            ap += `:`;
        }else{
            ap += `0`;
        }
    }
    return ap + d;
}

export default class YouTubePlayer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			onReadyProgress: false,
			currentTime: 0,
			totalDuration: 0,

			isPlaying: false,
			isFullScreen: false,

			progress: 0,
			isReady: false,

			formattedTime: ''
		};
		this.watchSeconds = 0;
		this.completed = false;
	}

	componentDidMount() {
		if(this.props?.play)this.setState({
			isPlaying: true
		})
	}

	componentDidUpdate(prevProps) {
		//Typical usage, don't forget to compare the props
		if (this.props.play !== prevProps.play) {
			this.togglePlay(this.props.play);
		}

		if (this.props.videoId !== prevProps.videoId) {
			this.setState({
				currentTime: 0,
				totalDuration: 0,
				isReady: false,
				formattedTime: '',
				onReadyProgress: false
			}, () => {
				this.watchSeconds = 0;
				this.completed = false;
				this.setDuration(0, 0);
			})
		}
	}

	componentWillUnmount() {
		this.stopListener();
	}

	fullScreen = () => {
		this.setState({
			isFullScreen: this.props?.fullscreen || false,
		});
	};

	togglePlay = (p) => {
		if (p) this.pause();
		else this.play();
	};

	playPrevious = () => {
		if (this.props?.onPlayPrevious) this.props?.onPlayPrevious();
	};

	onPlayerReady = (e) => {
		this.setState(
			{
				isReady: true,
			},
			() => {
				this.setTime();
				if (this.props?.onReady) {
					this.props.onReady(e);					
				}
			}
		);
	};

	play = () => {
		this.setState({ isPlaying: true });
	};

	pause = () => {
		this.setState({ isPlaying: false });
	};

	playNext = () => {
		if (this.props?.onPlayNext) this.props?.onPlayNext();
	};

	playPause = () => {
		this.togglePlay(this.state.isPlaying);
	};

	startListener = () => {
		this.currentInterval = setInterval(async () => {
			let totalDuration = this.state.totalDuration;
			if (!totalDuration) {
				totalDuration = await this.currentPlayer.getDuration();
				this.setState({ totalDuration });
			}
			const currentTime = await this.currentPlayer.getCurrentTime();
			this.setDuration(currentTime, totalDuration);
		}, 1000);
	};

	stopListener = () => {
		clearInterval(this.currentInterval);
	};

	setFullscreen = () => {
		if(this.props?.onFullScreenPress){
			this.props.onFullScreenPress();
		}else{
			this.setState({
				isFullScreen: true,
			});
		}	
	};

	handleStateChange = ({ state }) => {
		if (state === "playing") {
			this.startListener();
		} else {
			this.stopListener();
		}
		this.setState({
			isPlaying: (state !== "stopped" && state !== "paused")
		})
	};

	setTime = async () => {
		totalDuration = await this.currentPlayer.getDuration();
		const currentTime = await this.currentPlayer.getCurrentTime();
		const formattedTime = `${timeFormat(currentTime)} / ${timeFormat(totalDuration)}`;
		this.setState({
			formattedTime
		})
	}

	setDuration = (currentTime, totalDuration) => {
		if(!totalDuration)this.setState({ progress: 0, formattedTime: '' }, () => {
			this.watchSeconds = 0;
			this.completed = false;
		});
		this.watchSeconds++;
		let progress = (currentTime / totalDuration) * 100;
		let lastProgress = this.state.lastProgress;
		const _currentTime = timeFormat(currentTime);
		const formattedTime = `${_currentTime} / ${timeFormat(totalDuration)}`;
		this.setState({
			progress,
			formattedTime
		}, () => {
			if(this.state.onReadyProgress){
				let p = this.state.onReadyProgress
				this.setState({
					onReadyProgress: false
				}, () => {
					this.seekBarTo(p);
				}) 
			}
			if(this.watchSeconds >= (this.props?.notifyAfterSeconds || 60)){				
				this.props?.onWatchedSeconds({
					currentTime, 
					currentTimeString: formatDuration(_currentTime),
					watchedSeconds: this.watchSeconds
				});
				this.watchSeconds = 0;
			}

			if(progress > (this.props?.markAsCompleteAfterPercent || 90) && this.props?.onCompleted && !this.completed){
				this.completed = true;
				this.props?.onCompleted({
					progress,
					currentTime,
					totalDuration
				});
			}
		});
	}

	seekBarTo = (progress, callback = false) => {
		const { totalDuration, isReady } = this.state;
		if(!totalDuration || !isReady)this.setState({ progress: 0 });
		const seconds = Math.round((progress / 100) * totalDuration);
		this.currentPlayer.seekTo(seconds);
		const fseconds = timeFormat(seconds);
		const formattedTime = `${fseconds} / ${timeFormat(totalDuration)}`;
		this.setState({
			formattedTime
		}, () => {
			if(this.props?.onSeek){
				this.props?.onSeek(
					formatDuration(fseconds)
				);
			}
		})
	}

	attachProgressOnReady = (onReadyProgress = 0) => {
		this.setState({
			onReadyProgress
		});
	}

	render() {
		const { formattedTime, isPlaying, isFullScreen, progress } = this.state;
		const {
			tintColor = "white",
			progressBackgroundColor = "#FFFFFF",
			progressColor = "#FE0002",
			timeStyle,
			fullscreen = false
		} = this.props;
		return (
			<View style={this.props.style}>
				<YouTube
					{...this.props}
					play={isPlaying}
					controls={0}
					fullscreen={isFullScreen}
					loop={true}
					onChangeFullscreen={(e) => {
						this.setState({ isFullScreen: e.isFullscreen });
					}}
					onChangeState={this.handleStateChange}
					onReady={this.onPlayerReady}
					ref={(ref) => (this.currentPlayer = ref)}
					style={{ alignSelf: "stretch", height: "100%" }}
				/>

				{fullscreen ?
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center' }}>
					  <TouchableOpacity
							onPress={this.playPause}
							style={[style.button, { width: 30, height: 30}]}
						>
							<Image
								source={isPlaying ? pauseIcon : playIcon}
								tintColor={tintColor}
								style={style.icon}
							/>
						</TouchableOpacity>
						<SeekBar
						style={{ marginTop: 5, paddingHorizontal: 10, width: heightedWidth }}
						min={0}
						max={100}
						progress={progress}
						progressHeight={4}
						progressBackgroundColor={progressBackgroundColor}
						progressColor={progressColor}
						thumbSize={10}
						thumbColor={progressColor}
						thumbColorPressed={progressColor}
						onProgressChanged={(progress) =>
							this.seekBarTo(progress, true)
						}
					/>
						<Text style={[style.formattedTime2, { color: tintColor, width: 80 }, timeStyle]}>
							{formattedTime}
						</Text>
				</View>
				: <View style={style.options}>
					<SeekBar
						style={{ marginTop: 5, paddingHorizontal: 10, width: normalWidth }}
						min={0}
						max={100}
						progress={progress}
						progressHeight={4}
						progressBackgroundColor={progressBackgroundColor}
						progressColor={progressColor}
						thumbSize={10}
						thumbColor={progressColor}
						thumbColorPressed={progressColor}
						onProgressChanged={(progress) =>
							this.seekBarTo(progress, true)
						}
					/>

					<Text style={[style.formattedTime, { color: tintColor }, timeStyle]}>
						{formattedTime}
					</Text>
					<View style={style.controls}>
						<TouchableOpacity
							onPress={this.playPrevious}
							style={style.button}
						>
							<Image
								source={previousIcon}
								tintColor={tintColor}
								style={style.icon}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={this.playPause}
							style={[style.button, { marginHorizontal: 20 }]}
						>
							<Image
								source={isPlaying ? pauseIcon : playIcon}
								tintColor={tintColor}
								style={style.icon}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={this.playNext}
							style={style.button}
						>
							<Image
								source={nextIcon}
								tintColor={tintColor}
								style={style.icon}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={this.setFullscreen}
							style={style.fullScreenButton}
						>
							<Image
								source={fullscreenIcon}
								tintColor={tintColor}
								style={style.icon}
							/>
						</TouchableOpacity>
					</View>
				</View>}
			</View>
		);
	}
}

const style = {
	formattedTime: {
		fontSize: 13,
		position: 'absolute',
		left: 10,
		top: 23,
		fontWeight: 'bold'
	},
	formattedTime2: {
		fontSize: 13,
		fontWeight: 'bold'
	},
	options: {
		marginTop: 5,
		width: "100%",
		height: 80,
		justifyContent: "center"
	},
	controls: {
		top: 5,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	button: {
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
	icon: {
		resizeMode: "contain",
		width: 17,
		height: 17,
	},
	fullScreenButton: {
		position: "absolute",
		width: 29,
		height: 50,
		justifyContent: "center",
		right: 0,
	},
};
