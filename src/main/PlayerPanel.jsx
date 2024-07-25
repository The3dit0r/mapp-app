import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";

import {
  TbMicrophone2,
  TbRepeat,
  TbRepeatOff,
  TbRepeatOnce,
  // TbVolume2,
  // TbVolume3,
  TbVolumeOff,
  TbVolume,
} from "react-icons/tb";

import {
  BsSkipStartFill,
  BsSkipEndFill,
  BsPauseCircleFill,
  BsPlayCircleFill,
  BsChevronUp,
  BsSuitHeartFill,
  BsSuitHeart,
  BsCheckCircle,
} from "react-icons/bs";

import { GiCardRandom } from "react-icons/gi";
import { FiMoreHorizontal } from "react-icons/fi";

import getEnhanced, { durationFormat, lyrics } from "../utilityFunction";

import {
  ArtistsDisplay,
  ArtistsDisplayLink,
  QueueIcon,
} from "../UtilityComponent";

import CustomSlider from "../components/CustomSlider";
import Damn from "../components/Damn";
import RowItem from "../components/RowItem";

import QueueContext from "../context/QueueContext";
import EmptyScreen from "../components/EmptyScreen";
import UserDataContext, { SaveButton } from "../context/UserDataContext";
import PopUpContext from "../context/PopUpContext";

// const cover = "https://f4.bcbits.com/img/a2908709993_65";

const loopIcon = [
  <TbRepeatOff />,
  <TbRepeat color="#fee39c" />,
  <TbRepeatOnce color="#fee39c" />,
];

const chaosIcon = [<GiCardRandom />, <GiCardRandom color="#fee39c" />];

// const queue = generateData();

export default function PlayerPanel({
  togglePlayerPanel,
  toggleTrackContextMenu,
}) {
  const queueSystem = useContext(QueueContext);
  const userData = useContext(UserDataContext);
  const popUp = useContext(PopUpContext);

  const [queue, setQueue] = useState(queueSystem.getItems());

  const [secondaryPanel, showSecondaryPanel] = useState(0);
  const [debug, setDebug] = useState(0);
  const [lyric, setLyric] = useState(0);

  const [volume, setVolume] = useState(0.6);

  const [coverIndex, setCoverIndex] = useState(1);
  const [touch, isTouching] = useState(false);

  useEffect(() => {
    function playerQueueChange(newQueue) {
      const current = queue[0] || {};

      setQueue(newQueue);

      if (!current.id) return;

      if (newQueue.length === 0) {
        getEnhanced(
          current.artists.map((a) => a.id),
          [current.id],
          50
        ).then((tracks) => {
          if (queueSystem.getLength() === 0)
            queueSystem.playItemsFromSource(
              tracks,
              {
                id: null,
                url: null,
                type: "radio",
                title: current.title,
              },
              0
            );
        });
      }
    }

    queueSystem.addEventListener("largequeue", playerQueueChange);

    return () => {
      queueSystem.removeEventListener("largequeue", playerQueueChange);
    };
  }, [queueSystem, queue]);

  useEffect(() => {
    const request = { valid: true };
    const current = queue[0];

    if (!current) return;

    async function fetchLyrics() {
      const newLyric = await lyrics.getLyricsV2(current.id);

      if (request.valid) setLyric(newLyric);
    }

    fetchLyrics();

    return () => {
      request.valid = false;
    };
  }, [queue]);

  let className = "main-panel player";
  if (secondaryPanel) {
    className += " show-secondary";
  }

  //? Display current track
  const current = queueSystem.getCurrent();

  let curCover = [],
    curTitle = "No track is currently playing",
    curSubtitle = "Add track to queue to start playing",
    curPlayingFromType = "Player",
    curPlayingFromName = "SPOTIFAKE",
    curAudioSrc = "",
    curIsSaved = false;

  if (current) {
    curCover = current.cover;

    curSubtitle = (
      <ArtistsDisplayLink
        artists={current.artists}
        onClick={() => togglePlayerPanel(false)}
      />
    );

    const curSrcAdd = queueSystem.queueSourceUrl;
    const curQType = queueSystem.queueSourceType;
    const curQTitle = queueSystem.queueSourceTitle;

    curTitle = <Link to={"/album/" + current.album.id}>{current.title}</Link>;
    curPlayingFromType =
      "Playing from " + (current.queued ? "queue" : curQType);
    curPlayingFromName =
      current.queued || !curSrcAdd ? (
        curQTitle
      ) : (
        <Link onClick={() => togglePlayerPanel(false)} to={curSrcAdd}>
          {curQTitle}
        </Link>
      );
    curAudioSrc =
      "https://3dit0r-glitch-audio.glitch.me/audio/" +
      current.id +
      "?type=audio";
    curIsSaved = userData.savedItems.isSaved(current.id);
  }

  //? Get previous and next cover
  const qLoop = queueSystem.loopMode;

  const prevCover =
    queue[queue.length - 1] && qLoop === 1 ? queue[queue.length - 1].cover : [];

  const nextCover = queue[1] ? queue[1].cover : [];

  const secBack = window.location.origin + "/back6.png";

  // // console.log(queue);

  //? RENDER
  return (
    <div className={className}>
      <img src={secBack} alt="" className="bg-img" />
      <img src={secBack} alt="" className="bg-img flip" />

      <audio
        onEnded={() => {
          if (qLoop === 2 || (qLoop === 1 && queue.length === 1)) {
            const player = document.getElementById("ap2");
            player.currentTime = 0;
            player.play();
          }
          queueSystem.skipNext(1, false);
        }}
        onPlay={(e) => {
          if (e.target.currentTime < 0.1) {
            userData.addToPlaybackHistory(current);
          }
        }}
        src={curAudioSrc}
        id={"ap2"}
        autoPlay
        volume={volume}
      />

      <div className="header upper">
        <div className="subtitle">{curPlayingFromType}</div>
        <div className="title line-ellipsis">{curPlayingFromName}</div>
      </div>

      <div className="cover-wrapper flex aictr jcctr upper">
        <SwipeableViews
          slideClassName="flex aictr jcctr"
          onTouchStart={() => isTouching(true)}
          onChangeIndex={(index) => {
            setCoverIndex(index);
            setTimeout(() => isTouching(false), 10);

            setTimeout(() => {
              if (queueSystem.loopMode !== 0 || index !== 0) {
                if (index === 0) {
                  queueSystem.skipPrev();
                } else {
                  queueSystem.skipNext(1, true);
                }
              } else {
                isTouching(true);
              }
              setTimeout(() => isTouching(true), 10);
              setCoverIndex(1);
            }, 200);
          }}
          index={coverIndex}
          animateTransitions={touch}
          disabled={!queue.length}
        >
          <PlayerCover cover={prevCover} />
          <PlayerCover cover={curCover} />
          <PlayerCover cover={nextCover} />
        </SwipeableViews>
      </div>

      <div className="general flex aictr spbtw upper">
        <div className="info">
          <div
            onClick={() => togglePlayerPanel(false)}
            className="title line-ellipsis"
          >
            {curTitle}
          </div>
          <div className="subtitle line-ellipsis">{curSubtitle}</div>
        </div>
        {current ? <SaveButton type="tracks" item={current} size={22} /> : ""}
      </div>

      {/* Only allow control when there is something playing */}
      {current ? (
        <>
          <PlayerTimestamp />
          <PlayerMainControl />
          <div className="more-control flex aictr spbtw lower">
            <div className="flex aictr" style={{ gap: 20 }}>
              <div
                style={{ fontSize: 28 }}
                className="zum flex aictr"
                onClick={() => {
                  const player = document.getElementById("ap2");

                  if (player.volume !== 0) {
                    player.volume = 0;
                  } else {
                    player.volume = 0.6;
                  }

                  setVolume(player.volume);
                }}
              >
                {volume !== 0 ? <TbVolume /> : <TbVolumeOff />}
              </div>
              <TbMicrophone2
                size={24}
                className="zum"
                onClick={() => showSecondaryPanel(2)}
              />
            </div>
            <div className="flex aictr" style={{ gap: 20 }}>
              <FiMoreHorizontal size={28} className="zum" />
              <QueueIcon
                onClick={() => showSecondaryPanel(1)}
                className="zum"
                size={27}
              />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      <div
        className="collapse-button flex aictr jcctr"
        onClick={() => {
          if (secondaryPanel) showSecondaryPanel(0);
          else togglePlayerPanel(false);
        }}
      >
        <BsChevronUp
          style={{
            transform: `translateY(-9px) rotate(${
              secondaryPanel ? 180 : 0
            }deg)`,
          }}
          size={20}
        />
      </div>

      <div
        className="secondary-panel"
        id="secondary-panel"
        onScroll={(e) => {
          const height = Math.round(e.target.scrollTop);

          //? Ignoring header height (80px) and Bottom Control Panel (135px) - Including padding and margin
          setDebug(Math.max(0, Math.ceil((height - 200) / window.innerHeight)));
        }}
      >
        {
          [
            <h3 className="header flex jcctr">
              Current queue ({queue.length - 1} tracks)
            </h3>,
            <div
              className="header flex jcctr coll"
              style={{ paddingTop: 10, fontSize: 12 }}
            >
              Lyrics
              <b>{curTitle}</b>
            </div>,
          ][secondaryPanel - 1]
        }

        {
          [
            <PlayerQueueSection
              showSecondaryPanel={showSecondaryPanel}
              togglePlayerPanel={togglePlayerPanel}
              queueSystem={queueSystem}
              debug={debug}
              queue={queue}
            />,
            <PlayerLyricsPanel queue={queue} lyric={lyric} />,
          ][secondaryPanel - 1]
        }

        <Damn height={210} />
      </div>
    </div>
  );
}

function PlayerCover({ cover = [] }) {
  const coversUrl = [
    ...cover.map((a) => `url('${a.url}')`),
    `url('${window.location.origin}/back2.png')`,
  ].join(", ");

  // if (!cover.length) return "";

  return <div className="cover" style={{ backgroundImage: coversUrl }}></div>;
}

const touching = {
  timeout: 0,
  is: false,
};

function PlayerLyricsPanel({ lyric }) {
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    function lyricsCurrentTime() {
      setCurrentLine(-1);

      if (!lyric?.lines?.length) return;
      if (lyric.kind === "TEXT") return;

      for (let i = 0; i < lyric.lines.length; i++) {
        if (player.currentTime < lyric.lines[i].time) {
          break;
        }
        setCurrentLine(i);
      }
    }

    const player = document.getElementById("ap2");
    player.addEventListener("timeupdate", lyricsCurrentTime);

    return () => {
      player.removeEventListener("timeupdate", lyricsCurrentTime);
      setCurrentLine(-1);
    };
  }, [lyric]);

  useEffect(() => {
    const li = Math.max(0, currentLine);
    // const targetLine = document.getElementById("ly-line-" + li);
    const target = document.getElementById("secondary-panel");

    if (touching.is) return;
    target.scrollTo({
      top: li * 38,
      behavior: "smooth",
    });

    // storage.setItem("lyric-line", li);
  }, [currentLine]);

  function getClass(il, ic) {
    if (ic === -1) {
      return "line no";
    }

    if (il === ic) {
      return "line now";
    } else if (il > ic && Math.abs(ic - il) > 1) {
      return "queued line";
    } else {
      if (Math.abs(ic - il) === 1) {
        return "near passed line";
      }
      return "passed line";
    }
  }

  if (!lyric)
    return (
      <EmptyScreen
        style={{
          fontSize: 11,
          marginTop: "calc(50% - 150px)",
          marginBottom: -210,
        }}
        text="Sorry, but we couldn't find the lyrics, you might have to figure this out on your own"
      />
    );

  return (
    <Damn
      height={150}
      onTouch={() => {
        touching.is = true;

        clearTimeout(touching.timeout);
        touching.timeout = setTimeout(() => (touching.is = false), 5000);
      }}
    >
      {lyric?.lines?.map((line, i) => {
        return (
          <div
            className={getClass(i, currentLine)}
            onClick={() => {
              if (!line.time) return;

              const player = document.getElementById("ap2");
              touching.is = false;
              player.currentTime = line.time;
            }}
            style={{
              animationDuration: 300 + Math.min(600, 100 * (i + 1)) + "ms",
            }}
            id={"ly-line-" + i}
            key={"ly-line-" + i}
          >
            {line.text}
          </div>
        );
      })}
      <div style={{ fontSize: 12, textAlign: "center", marginTop: 50 }}>
        <i>Lyrics kindly provided by MusixMatch</i>
      </div>
    </Damn>
  );
}

function PlayerQueueSection({
  showSecondaryPanel,
  togglePlayerPanel,
  queueSystem,
  queue,
  debug,
}) {
  const [loopMode, setLoopMode] = useState(queueSystem.loopMode);

  const handleQLoopDisplay = (i) => setLoopMode(i);

  useEffect(() => {
    queueSystem.addEventListener("loop", handleQLoopDisplay);

    return () => {
      queueSystem.removeEventListener("loop", handleQLoopDisplay);
    };
  }, [queueSystem]);

  const count = Math.ceil(window.innerHeight / 60);

  const sectionStart = Math.max(0, debug - 3);
  const sectionEnd = Math.max(0, debug + 3);

  if (queue.length < 2)
    return (
      <EmptyQueue
        showSecondaryPanel={showSecondaryPanel}
        togglePlayerPanel={togglePlayerPanel}
      />
    );

  const QSTitle = queueSystem.queueSourceTitle;
  const QSUrl = queueSystem.queueSourceUrl;

  let isDone = false,
    maxSourceIndex = -1e5;
  const h1 = <h4 className="queue-header">Next in queue</h4>;
  const h2 = (
    <h4
      className="queue-header"
      onClick={() => {
        showSecondaryPanel(false);
        togglePlayerPanel(false);
      }}
    >
      Next from: <Link to={QSUrl}>{QSTitle}</Link>
    </h4>
  );

  function getHeader(item, dft = "") {
    if (!item.queued && !isDone) {
      isDone = true;
      return h2;
    } else {
      return dft;
    }
  }

  return (
    <>
      {getHeader(queue[1], h1)}
      {queue.slice(1, Infinity).map((item, index) => {
        const sIndex = item?.sourceIndex;

        // // console.log(maxSourceIndex);
        //* Condition for looping display
        if (!item.queued) {
          if (maxSourceIndex < sIndex) {
            maxSourceIndex = item.sourceIndex;
          } else if (loopMode === 0) {
            return "";
          }
        }

        if (
          (count * sectionStart <= index && count * sectionEnd >= index) ||
          index <= count + 5
        ) {
          return (
            <span key={`queue-track-item-${index}`}>
              {getHeader(item)}

              <RowItem
                index={index + 1}
                title={item.title}
                showCover={false}
                subtitle={<ArtistsDisplay artists={item.artists} />}
                onClick={() => {
                  queueSystem.skipNext(index + 1, true);
                  showSecondaryPanel(0);
                }}
              />
            </span>
          );
        } else {
          return <Damn height={60} />;
        }
      })}
      <Damn height={120} />
    </>
  );
}

function PlayerTimestamp() {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function handlePlayerTimeChange({
    target = { duration: 1 / 1e16, currentTime: 0 },
  }) {
    setCurrentTime(target.currentTime);
    setDuration(Math.max(0, target.duration));
  }

  useEffect(() => {
    const player = document.getElementById("ap2");

    player.addEventListener("timeupdate", handlePlayerTimeChange);

    return () => {
      player.removeEventListener("timeupdate", handlePlayerTimeChange);
    };
  }, []);

  return (
    <div className="timestamp lower">
      <CustomSlider
        width="100%"
        value={currentTime}
        max={duration}
        onInputEnd={(e) => {
          const player = document.getElementById("ap2");
          player.currentTime = e.target.value;
        }}
      />
      <div className="prog flex aictr spbtw">
        <div>{durationFormat(currentTime, ":")}</div>
        <div>{durationFormat(duration, ":")}</div>
      </div>
    </div>
  );
}

function EmptyQueue({ showSecondaryPanel, togglePlayerPanel }) {
  return (
    <div className="flex aictr jcctr coll" style={{ textAlign: "center" }}>
      <Damn height={"calc(var(--main-height) * 0.5 - 300px)"} />

      <img
        src={window.location.origin + "/sleeping.png"}
        alt="sleeping"
        width={120}
        style={{ filter: "hue-rotate(210deg)", opacity: 0.4 }}
      />

      <h4>Oops, nothing to show here.</h4>
      <b>
        Queued track will be shown here, so . . . <br />
        <h2
          style={{ color: "#fee39c" }}
          onClick={() => {
            showSecondaryPanel(false);
            togglePlayerPanel(false);
          }}
        >
          <Link to="/search">GO ADD SOME</Link>
        </h2>
      </b>
    </div>
  );
}

function PlayerMainControl() {
  const queueSystem = useContext(QueueContext);
  const [chaosMode, setChaosMode] = useState(queueSystem.chaosMode);
  const [loopMode, setLoopMode] = useState(queueSystem.loopMode);
  const [paused, setPaused] = useState(true);

  const handleLoopMode = (newMode) => setLoopMode(newMode);
  const handleChaosMode = (newMode) => setChaosMode(newMode);

  const handleOnPause = () => setPaused(true);
  const handleOnPlaying = () => setPaused(false);

  const togglePlayPause = () => {
    const player = document.getElementById("ap2");

    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  };

  useEffect(() => {
    queueSystem.addEventListener("chaos", handleChaosMode);
    queueSystem.addEventListener("loop", handleLoopMode);

    const player = document.getElementById("ap2");
    player.addEventListener("pause", handleOnPause);
    player.addEventListener("playing", handleOnPlaying);

    setPaused(player.paused);

    return () => {
      queueSystem.removeEventListener("chaos", handleChaosMode);
      queueSystem.removeEventListener("loop", handleLoopMode);
      player.removeEventListener("pause", handleOnPause);
      player.removeEventListener("playing", handleOnPlaying);
    };
  }, [queueSystem]);

  return (
    <div className="control flex aictr spard lower">
      <div
        className="zum flex aictr"
        style={{ fontSize: 28 }}
        onClick={() => queueSystem.toggleLoopMode()}
      >
        {loopIcon[loopMode]}
      </div>

      <BsSkipStartFill
        size={40}
        className="zum"
        onClick={() => queueSystem.skipPrev(1)}
      />

      <div
        className="zum flex aictr jcctr"
        onClick={togglePlayPause}
        id="mpp-button"
      >
        {paused ? (
          <BsPlayCircleFill size={60} />
        ) : (
          <BsPauseCircleFill size={60} />
        )}
      </div>

      <BsSkipEndFill
        size={40}
        className="zum"
        onClick={() => queueSystem.skipNext(1, true)}
      />

      <div
        className="zum flex aictr jcctr"
        style={{ fontSize: 28 }}
        onClick={() => queueSystem.toggleChaosMode()}
      >
        {chaosIcon[chaosMode]}
      </div>
    </div>
  );
}
