import { useContext, useEffect, useState } from "react";
import "./index.css";

import { BsPlayFill, BsPauseFill, BsSkipEndFill } from "react-icons/bs";

import { ArtistsDisplay } from "../../UtilityComponent";

import QueueContext from "../../context/QueueContext";
import UserDataContext, { SaveButton } from "../../context/UserDataContext";

const hs = 31;

export default function MiniPlayer({ togglePlayerPanel }) {
  const queueSystem = useContext(QueueContext);
  const userData = useContext(UserDataContext);

  const [current, setCurrent] = useState(queueSystem.getCurrent());

  const [paused, setPaused] = useState(true);
  const handleOnPause = () => setPaused(true);
  const handleOnPlaying = () => setPaused(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1 / 1e3);
  const handleTimeUpdate = ({ target = { currentTime: 0, duration: 0 } }) => {
    setCurrentTime(target.currentTime);
    setDuration(Math.max(1 / 1e4, target.duration));
  };

  function miniPlayerListener(queue) {
    if (!queue.length) return setCurrent({});
    setCurrent(queue[0]);
  }

  useEffect(() => {
    queueSystem.addEventListener("largequeue", miniPlayerListener);

    const player = document.getElementById("ap2");

    player.addEventListener("pause", handleOnPause);
    player.addEventListener("playing", handleOnPlaying);
    player.addEventListener("timeupdate", handleTimeUpdate);

    setPaused(player.paused);

    return () => {
      queueSystem.removeEventListener("largequeue", miniPlayerListener);
      player.removeEventListener("pause", handleOnPause);
      player.removeEventListener("playing", handleOnPlaying);
      player.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [queueSystem]);

  //? Display current track

  let coversUrl = `url('${window.location.origin}/back3.png')`,
    curTitle = "No track is currently playing",
    curSubtitle = "Add track to queue to start playing",
    curControlDisplay = "none";

  if (current?.id) {
    coversUrl = [
      ...current.cover.map((a) => `url('${a.url}')`),
      "url('cover.png')",
    ].join(", ");

    curSubtitle = (
      <ArtistsDisplay
        artists={current.artists}
        onClick={() => togglePlayerPanel(false)}
      />
    );

    curTitle = current.title;
    curControlDisplay = "flex";
  }

  function togglePlayPause() {
    const player = document.getElementById("ap2");

    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  }

  return (
    <div
      className="mini-player flex aictr"
      onClick={() => togglePlayerPanel(true)}
    >
      <div
        className="cover"
        style={{ backgroundImage: coversUrl, backgroundSize: "cover" }}
      ></div>
      <div className="info">
        <div className="title line-ellipsis">{curTitle}</div>
        <div className="subtitle line-ellipsis">{curSubtitle}</div>
      </div>
      <div
        className="control flex aictr flend"
        onClick={(e) => e.stopPropagation()}
        style={{ display: curControlDisplay }}
      >
        <SaveButton type="tracks" item={current} size={hs - 8} />

        <div className="flex aictr zum" onClick={togglePlayPause}>
          {paused ? (
            <BsPlayFill size={hs + 5} className="zum" />
          ) : (
            <BsPauseFill size={hs + 5} className="zum" />
          )}
        </div>
        <BsSkipEndFill
          size={hs + 2}
          className="zoom"
          onClick={() => queueSystem.skipNext(1, true)}
        />
      </div>
      <div
        className="mini-prog"
        style={{ "--cur": `${(currentTime * 100) / duration}%` }}
      ></div>
    </div>
  );
}
