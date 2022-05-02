import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  // useColorScheme,
  View,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackPlayer, {
  State,
  RepeatMode,
  Event,
  Capability,
  useProgress,
} from 'react-native-track-player';
import {
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player/lib/hooks';
// import {writeFile, MainBundlePath} from 'react-native-fs';
// var RNFS = require('react-native-fs');
import RNFS from 'react-native-fs';

const songs = [
  {
    id: 1,
    url: RNFS.MainBundlePath + '/sample.mp3',
    title: 'Therefore I Am',
    artist: 'Billie Eilish',
    album: 'while(1<2)',
    genre: 'Progressive House, Electro House',
    date: '2021-05-20T07:00:00+00:00',
    artwork:
      'https://res.cloudinary.com/jsxclan/image/upload/v1623987985/GitHub/Projects/Musicont/mock/images/therefore-i-am_t9xxfs.jpg',
    duration: 402,
  },
  {
    id: 2,
    url: 'https://res.cloudinary.com/jsxclan/video/upload/v1623986820/GitHub/Projects/Musicont/mock/audios/kungs-vs-cookin_gbvmhs.mp3',
    title: 'This Girl',
    artist: 'Kungs vs Cookin on 3 Burners',
    album: 'while(1<2)',
    genre: 'Progressive House, Electro House',
    date: '2021-05-20T07:00:00+00:00',
    artwork:
      'https://res.cloudinary.com/jsxclan/image/upload/v1623984884/GitHub/Projects/Musicont/mock/images/kungs-vs-cookin_yhuqv3.jpg',
    duration: 402,
  },
  {
    id: 3,
    url: 'https://res.cloudinary.com/jsxclan/video/upload/v1623986852/GitHub/Projects/Musicont/mock/audios/holiday_tbcj06.mp3',
    title: 'HOLIDAY',
    artist: 'Lil Nas X',
    album: 'while(1<2)',
    genre: 'Progressive House, Electro House',
    date: '2021-05-20T07:00:00+00:00',
    artwork:
      'https://res.cloudinary.com/jsxclan/image/upload/v1623984884/GitHub/Projects/Musicont/mock/images/holiday_vzyzke.jpg',
    duration: 402,
  },
];

// ネイティブ側のUIから操作する系
TrackPlayer.addEventListener('remote-seek', event => {
  TrackPlayer.seekTo(event.position);
});

TrackPlayer.addEventListener('remote-play', () => {
  TrackPlayer.play();
});

TrackPlayer.addEventListener('remote-pause', () => {
  TrackPlayer.pause();
});

TrackPlayer.addEventListener('remote-previous', () => {
  TrackPlayer.skipToPrevious();
});

TrackPlayer.addEventListener('remote-next', () => {
  TrackPlayer.skipToNext();
});

const togglePlayback = async playbackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack();

  if (currentTrack !== null) {
    if (playbackState === State.Paused || playbackState === State.Ready) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const App = () => {
  const [currentTrackId, setCurrentTrackId] = useState(0);
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [artwork, setArtwork] = useState();
  const [title, setTitle] = useState();
  const [artist, setArtist] = useState();

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'repeat' | 'track'>(
    'off',
  );

  const setUpPlayer = async () => {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.JumpBackward,
        Capability.JumpForward,
      ],
      compactCapabilities: [Capability.JumpBackward, Capability.JumpForward],
      stopWithApp: false,
    });
    await TrackPlayer.add(songs);
  };

  // useTrackPlayerEvents([Event.PlaybackState], async event => {
  //   console.log({event});
  // });

  // 次のトラックに遷移（シャッフルなしの場合）
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (!isShuffle) {
      const currentTrack = await TrackPlayer.getCurrentTrack();
      setCurrentTrackId(currentTrack);
      if (
        event.type === Event.PlaybackTrackChanged &&
        event.nextTrack !== null
      ) {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        const {title, artwork, artist} = track;
        setArtist(artist);
        setArtwork(artwork);
        setTitle(title);
      }
    }
  });

  useEffect(() => {
    setUpPlayer();
    TrackPlayer.setRepeatMode(RepeatMode.Off);
    // TrackPlayer.updateOptions({
    //   stopWithApp: false,
    // });
  }, []);

  // シャッフル時の挙動
  useEffect(() => {
    console.log(currentTrackId);
    const stop = async () => {
      if (
        repeatMode === 'off' &&
        isShuffle &&
        progress.position >= progress.duration
        // state === 'connecting'
      ) {
        const nextSongArray: number[] = [...Array(songs.length).keys()].reduce(
          (accumulator, currentValue) => {
            if (currentValue !== currentTrackId) {
              accumulator.push(currentValue);
            }
            return accumulator;
          },
          [],
        );

        const nextTrackId =
          nextSongArray[Math.floor(Math.random() * nextSongArray.length)];
        setCurrentTrackId(nextTrackId);
        await TrackPlayer.skip(nextTrackId);
        await TrackPlayer.play();
        const track = await TrackPlayer.getTrack(nextTrackId);
        const {title, artwork, artist} = track;
        setArtist(artist);
        setArtwork(artwork);
        setTitle(title);
      }
    };
    stop();
  }, [progress, isShuffle]);

  const offlineDownload = () => {
    // console.log(MainBundlePath);
    // const path = RNFS.MainBundlePath + 'song.mp3';
    // // var path = RNFS.DocumentDirectoryPath + '/test.txt';

    // // write the file
    // RNFS.writeFile(
    //   path,
    //   'https://res.cloudinary.com/jsxclan/video/upload/v1623988277/GitHub/Projects/Musicont/mock/audios/therefore-i-am_sea49g.mp3',
    // )
    //   .then(success => {
    //     console.log('FILE WRITTEN!');
    //   })
    //   .catch(err => {
    //     console.log(err.message);
    //   });
    const downloadDest = RNFS.MainBundlePath + '/sample.mp3';
    RNFS.downloadFile({
      fromUrl:
        'https://res.cloudinary.com/jsxclan/video/upload/v1623988277/GitHub/Projects/Musicont/mock/audios/therefore-i-am_sea49g.mp3',
      toFile: downloadDest,
    });
    console.log('asdfadfasf');
  };

  const readDownload = () => {
    RNFS.readDir(RNFS.MainBundlePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then(result => {
        console.log('GOT RESULT', JSON.stringify(result));

        // stat the first file
        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
      })
      .then(statResult => {
        if (statResult[0].isFile()) {
          // if we have a file, read it
          return RNFS.readFile(statResult[1], 'utf8');
        }

        return 'no file';
      })
      .then(contents => {
        // log the file contents
        console.log(contents);
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };

  const skipBack = async (trackId: number) => {
    if (trackId < 0) return;

    setCurrentTrackId(trackId);
    await TrackPlayer.skip(trackId);

    const track = await TrackPlayer.getTrack(trackId);
    const {title, artwork, artist} = track;
    setArtist(artist);
    setArtwork(artwork);
    setTitle(title);
  };

  const skipTo = async (trackId: number) => {
    if (trackId > songs.length - 1) return;

    setCurrentTrackId(trackId);
    await TrackPlayer.skip(trackId);

    const track = await TrackPlayer.getTrack(trackId);
    const {title, artwork, artist} = track;
    setArtist(artist);
    setArtwork(artwork);
    setTitle(title);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeatMode = () => {
    if (repeatMode === 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track');
    }
    if (repeatMode === 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }
    if (repeatMode === 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.artwork}
        source={{
          uri: artwork,
        }}
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.artist}>{artist}</Text>
        <View style={styles.playerContent}>
          <View style={styles.sliderContent}>
            <Text style={styles.current}>
              {new Date(progress.position * 1000).toISOString().substr(14, 5)}
            </Text>
            <Slider
              style={{width: 340, height: 40}}
              minimumValue={0}
              maximumValue={progress.duration}
              value={progress.position}
              minimumTrackTintColor="#50fa7b"
              maximumTrackTintColor="#e6e6e6"
              thumbTintColor="#50fa7b"
              onSlidingComplete={async value => {
                await TrackPlayer.seekTo(value);
              }}
            />
            <Text style={styles.remain}>
              -
              {new Date((progress.duration - progress.position) * 1000)
                .toISOString()
                .substr(14, 5)}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={toggleShuffle}>
              <Icon
                name="shuffle-sharp"
                color={isShuffle ? '#50fa7b' : '#bd93f9'}
                size={32}
                style={styles.playButton}
              />
            </TouchableOpacity>
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity
                onPress={() => skipBack(currentTrackId - 1)}
                disabled={currentTrackId === 0 ? true : false}>
                <Icon
                  name="play-skip-back-sharp"
                  color={currentTrackId === 0 ? '#524b5c' : '#bd93f9'}
                  size={32}
                  style={styles.playButton}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
                <Icon
                  name={
                    playbackState === State.Playing
                      ? 'pause-circle-sharp'
                      : 'play-circle-sharp'
                  }
                  color="#bd93f9"
                  size={56}
                  style={styles.playButton}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => skipTo(currentTrackId + 1)}
                disabled={currentTrackId + 1 >= songs.length ? true : false}>
                <Icon
                  name="play-skip-forward-sharp"
                  color={
                    currentTrackId + 1 >= songs.length ? '#524b5c' : '#bd93f9'
                  }
                  size={32}
                  style={styles.playButton}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleRepeatMode}>
              <MaterialIcon
                name={
                  repeatMode === 'off' || repeatMode === 'repeat'
                    ? 'repeat'
                    : 'repeat-once'
                }
                color={
                  repeatMode === 'track' || repeatMode === 'repeat'
                    ? '#50fa7b'
                    : '#bd93f9'
                }
                size={30}
                style={styles.playButton}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.buttonContainer, styles.subButtons]}>
            <TouchableOpacity onPress={offlineDownload}>
              <MaterialIcon
                name="download-circle"
                color="#50fa7b"
                size={30}
                style={styles.playButton}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={readDownload}>
              <MaterialIcon
                name="download-circle"
                color="#bd93f9"
                size={30}
                style={styles.playButton}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282a36',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#e6e6e6',
    padding: 30,
  },
  artwork: {
    width: '100%',
    height: 200,
    resizeMode: 'stretch',
    marginTop: 200,
    borderRadius: 5,
  },
  bottomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 100,
  },
  title: {
    color: '#e6e6e6',
    fontWeight: 'bold',
    fontSize: 15,
  },
  artist: {color: '#e6e6e6', marginTop: 8},
  buttonContainer: {
    width: 340,
    display: 'flex',
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  centerButtonContainer: {
    width: 200,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  sliderContent: {
    position: 'relative',
  },
  current: {
    position: 'absolute',
    left: -10,
    bottom: -15,
    color: '#ffffff',
  },
  remain: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    color: '#ffffff',
  },
  playButton: {
    marginTop: 20,
  },
  buttonText: {
    color: '#e6e6e6',
    fontSize: 20,
  },
  text: {
    color: '#e6e6e6',
  },
});

export default App;
