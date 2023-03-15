import React, { Component } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import YouTube from "./YouTube";
import SeekBar from "./SeekBar";

const pauseIcon = require("./images/pause.png");
const playIcon = require("./images/play.png");
const previousIcon = require("./images/previous.png");
const nextIcon = require("./images/next.png");
const fullscreenIcon = require("./images/fullscreen.png");

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

export default class YouTubePlayer extends Component {
	constructor(props) {
		super(props);
		this.state = {
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
			if(this.watchSeconds >= (this.props?.notifyAfterSeconds || 60)){				
				this.props?.onWatchedSeconds({
					currentTime, 
					currentTimeString: _currentTime,
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

	seekBarTo = (progress) => {
		const { totalDuration, isReady } = this.state;
		if(!totalDuration || !isReady)this.setState({ progress: 0 });
		const seconds = Math.round((progress / 100) * totalDuration);
		this.currentPlayer.seekTo(seconds);
		const formattedTime = `${timeFormat(seconds)} / ${timeFormat(totalDuration)}`;
		this.setState({
			formattedTime
		})
	}

	render() {
		const { formattedTime, isPlaying, isFullScreen, progress } = this.state;
		const {
			tintColor = "white",
			progressBackgroundColor = "#FFFFFF",
			progressColor = "#FE0002",
			timeStyle			
		} = this.props;
		return (
			<View style={this.props.style}>
				<YouTube
					{...this.props}
					play={isPlaying}
					controls={isFullScreen ? 2 : 0}
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
				<View style={style.options}>
					<SeekBar
						style={{ marginTop: 5, paddingHorizontal: 10 }}
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
							this.seekBarTo(progress)
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
				</View>
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
