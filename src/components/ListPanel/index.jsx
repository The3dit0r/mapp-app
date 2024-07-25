import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  AiOutlineArrowLeft,
  AiOutlineSearch,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { FiMoreHorizontal } from "react-icons/fi";
import { GiCardRandom } from "react-icons/gi";

import "./index.css";

import RowItem from "../RowItem";
import Damn from "../Damn";

import { PlayButton, ArtistsDisplay } from "../../UtilityComponent";

import QueueContext from "../../context/QueueContext";
import { durationFormat } from "../../utilityFunction";
import { BsSuitHeartFill } from "react-icons/bs";
import { SaveButton } from "../../context/UserDataContext";

export default function ListPanel({
  toggleTrackContextMenu = () => {},
  toggleListContextMenu = () => {},

  title = "",
  subtitle = "",
  cover = [],
  renderArr = [],
  coverUrl = null,
  type = "",
  displayType = "",
  children = "",
  id = "",

  isArtist = false,
  favBtt = <BsSuitHeartFill size={30} color="#999" />,
  showItemCover = false,
  upperPart = "",
  playlistAdd = "",
}) {
  const queueSystem = useContext(QueueContext);

  const [debug, setDebug] = useState(0);
  const [headerShown, showHeader] = useState(false);
  const [query, setQuery] = useState("");

  const [paused, setPaused] = useState(false);
  const handleOnPause = () => setPaused(true);
  const handleOnPlaying = () => setPaused(false);
  const [shuffleEnabled, toggleShuffle] = useState(false);

  const [current, setCurrent] = useState(queueSystem.getCurrent());
  const listHandleCurrent = (queue) => {
    setCurrent(queue[0] || {});
  };

  const navigate = useNavigate();

  useEffect(() => {
    const player = document.getElementById("ap2");

    player.addEventListener("pause", handleOnPause);
    player.addEventListener("playing", handleOnPlaying);
    queueSystem.addEventListener("largequeue", listHandleCurrent);

    setPaused(player.paused);

    return () => {
      player.removeEventListener("pause", handleOnPause);
      player.removeEventListener("playing", handleOnPlaying);
      queueSystem.removeEventListener("largequeue", listHandleCurrent);
    };

    // eslint-disable-next-line
  }, []);

  const count = Math.ceil(window.innerHeight / 70);
  const sectionStart = Math.max(0, debug - 3);
  const sectionEnd = Math.max(0, debug + 3);

  const coversUrl = coverUrl
    ? `url(${coverUrl})`
    : [...cover.map((a) => `url('${a.url}')`), "url('cover.png')"].join(", ");

  let headerClass = "header flex aictr jcctr";
  if (headerShown) {
    headerClass += " active";
  }

  const queueSameSource = current?.sourceID === id;

  function handlePlay(index = 0) {
    const player = document.getElementById("ap2");

    if (queueSameSource && (index === current?.sourceIndex || index === -1)) {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    } else {
      queueSystem.playItemsFromSource(
        [...renderArr],
        { id, title, type },
        Math.max(0, index)
      );

      if (!shuffleEnabled) return;
      queueSystem.shuffleItems(5);
    }
  }

  function handleInput(e) {
    setQuery(e.target.value);
  }

  let duration = 0;
  renderArr.forEach((item) => (duration += item.duration.ms));

  return (
    <div
      className={"list-panel" + (isArtist ? " artist" : "")}
      onScroll={(e) => {
        const height = Math.round(e.target.scrollTop);
        const infoBox = document.getElementById("list-info-box");

        //? Ignoring header height (80px) and Bottom Control Panel (135px) - Including padding and margin
        setDebug(Math.max(0, Math.ceil((height - 200) / window.innerHeight)));

        if (infoBox) {
          const info = infoBox.getBoundingClientRect();

          if (info.y < 50) {
            if (!headerShown) showHeader(true);
          } else {
            if (headerShown) showHeader(false);
          }
        }
      }}
    >
      <div className={headerClass}>
        <AiOutlineArrowLeft
          className="ico zum"
          onClick={() => navigate(-1)}
          size={30}
        />
        <div className="info flex aictr coll jcctr">
          <div className="type">{displayType || type}</div>
          <div className="title line-ellipsis">{title}</div>
        </div>
      </div>

      <div className="cover-wrapper"></div>
      <div className="cover" style={{ backgroundImage: coversUrl }}></div>

      <div className="general flex aictr spbtw upper">
        <div className="info" id="list-info-box">
          <div className="title" style={{ lineHeight: 1.2 }}>
            <span>{title}</span>
          </div>
          <div className="subtitle">{subtitle}</div>
        </div>
        <div className="favorite"></div>
      </div>

      <div className="upper-part">{upperPart}</div>

      <div className="control aictr spbtw">
        <div className="flex aictr" style={{ gap: 15 }}>
          {favBtt}

          <FiMoreHorizontal
            size={28}
            className="zum"
            onClick={toggleListContextMenu}
          />
        </div>

        {/* <span
          onClick={() => toggleShuffle(!shuffleEnabled)}
          className="flex aictr zum"
          style={{ fontSize: 35 }}
        >
          {shuffleEnabled ? <GiCardRandom /> : <GiCardRandom color="#fee39c" />}
        </span> */}
      </div>

      <PlayButton
        playing={!paused && queueSameSource}
        size={55}
        onClick={() => handlePlay(-1)}
        className="zum play-pause"
        style={{ display: !renderArr.length ? "none" : "" }}
      />

      <div className="search-bar flex aictr">
        <AiOutlineSearch size={25} />
        <input
          onChange={handleInput}
          onInput={handleInput}
          inputMode="search"
          placeholder={`${renderArr.length} tracks, ${durationFormat(
            duration / 1000,
            "min",
            "sec"
          )}`}
          value={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
        {!(query !== "") || (
          <AiOutlineCloseCircle
            size={18}
            className="zum"
            onClick={() => setQuery("")}
          />
        )}
      </div>

      <div className="playlist-add">{playlistAdd}</div>

      <div style={{ fontSize: 12, padding: "0px 15px" }} className="fade">
        {renderArr
          .sort((a) => (a.id ? -1 : 0))
          .filter((track) => {
            const filter = query.trim();

            let override = false;

            const filtr = filter.toLowerCase().trim();
            const title = track.title.toLowerCase();
            track.artists.forEach((artist) => {
              const a_name = artist.username.toLowerCase();

              if (a_name.includes(filtr)) {
                override = true;
              }
            });

            const album = track.album.title.toLowerCase();

            return album.includes(filtr) || title.includes(filtr) || override;
          })
          .map((item, renderIndex) => {
            const listIndex = item.index > -1 ? item.index : renderIndex;

            if (
              (count * sectionStart <= renderIndex &&
                count * sectionEnd >= renderIndex) ||
              renderIndex <= count + 5
            ) {
              let textColor = "#fff",
                displayIndex = listIndex + 1;

              if (
                current?.sourceID === id &&
                listIndex === current?.sourceIndex
              ) {
                textColor = "#fee39c";
                if (!paused) displayIndex = <PlayingIcon />;
              }

              return (
                <RowItem
                  title={item.title}
                  subtitle={<ArtistsDisplay artists={item.artists} />}
                  onHold={() => toggleTrackContextMenu(item)}
                  onClick={() => handlePlay(listIndex)}
                  height={"60px"}
                  //
                  showCover={showItemCover}
                  cover={showItemCover ? item.cover : []}
                  //
                  style={{ color: textColor }}
                  index={displayIndex}
                  key={`list-item-${item.id}-${renderIndex}`}
                  other={
                    <div
                      className="flex aictr spbtw"
                      style={{ width: 60, color: "#fff", gap: 8 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SaveButton item={item} type="tracks" size={20} />
                      {item.duration.display}
                    </div>
                  }
                  className={item.id ? "" : "disabled"}
                />
              );
            } else {
              return <RowItem height={"60px"} loading={true} />;
            }
          })}
      </div>
      <div style={{ overflow: "hidden", background: "#561995" }}>
        {children}
      </div>
    </div>
  );
}

function PlayingIcon() {
  return (
    <img
      src={window.location.origin + "/play.gif"}
      alt=""
      width={15}
      style={{ filter: "hue-rotate(280deg) brightness(1.6)" }}
    />
  );
}
