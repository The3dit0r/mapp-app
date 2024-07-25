import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { AiOutlineClose } from "react-icons/ai";
import { BiLibrary } from "react-icons/bi";
import { HiFilter } from "react-icons/hi";

import { ArtistsDisplay } from "../UtilityComponent";

import MoreElaborateLoadingScreen from "../components/MoreElaborateLoadingScreen";
import HomeLogin from "../components/HomeLogin";
import BoxItem from "../components/BoxItem";
import Damn from "../components/Damn";
import EmptyScreen from "../components/EmptyScreen";

import UserDataContext from "../context/UserDataContext";
import QueueContext from "../context/QueueContext";

const uglyLongText = (
  <span>
    Go create <span style={{ color: "#fee39c" }}>an account</span> you something
    something.
  </span>
);

export default function LibraryPanel(props) {
  const userData = useContext(UserDataContext);

  return !userData.verifyUserLogin() ? (
    <div className="main-panel">
      {userData.getUserToken() ? (
        <MoreElaborateLoadingScreen />
      ) : (
        <HomeLogin text={uglyLongText} />
      )}
    </div>
  ) : (
    <MainPanel {...props} />
  );
}

function MainPanel({
  toggleArtistContextMenu,
  toggleTrackContextMenu,
  toggleAlbumContextMenu,
}) {
  const userData = useContext(UserDataContext);
  const queueSystem = useContext(QueueContext);

  const current = queueSystem.getCurrent();
  const currentSrcID = current?.sourceID;

  const savedAlbums = userData.savedItems.getType("albums");
  const savedArtists = userData.savedItems.getType("artists");
  const savedPlaylists = userData.savedItems.getType("playlists");
  const savedTracks = userData.savedItems.getType("tracks");
  const createdPlaylist = userData.createdPlaylist;

  const [itemFilter, setItemFilter] = useState(-1);
  const checkCon = (t) => t === itemFilter || itemFilter === -1;

  const renderPl = [...savedPlaylists, ...createdPlaylist];
  renderPl.sort((a, b) => (a.addedDate < b.addedDate ? 1 : -1));

  if (savedTracks.length > 0) {
    renderPl.push({
      type: "playlist",
      title: "Liked tracks",
      track_count: savedTracks.length,
      items: savedTracks.length,
      cover: [{ url: `${window.location.origin}/rnqa7yhv4il71.png` }],
      id: "favorite",
      addedDate: 0,
    });
  }

  const renderArr = [].concat(
    checkCon(0) ? renderPl : [],
    checkCon(1) ? savedAlbums : [],
    checkCon(2) ? savedArtists : []
  );

  renderArr.sort((a, b) => (a.addedDate < b.addedDate ? 1 : -1));

  function renderFunction({ item, boxSize }) {
    const Title = ({ children = "" }) => {
      const style = { color: "#ffffff" };

      if (item.id === currentSrcID) {
        style.color = "#fee39c";
      }

      return <span style={style}>{children}</span>;
    };

    if (item.type === "artist") {
      return (
        <BoxItem
          title={<Title>{item.name}</Title>}
          cover={item.images}
          className="artist"
          size={boxSize - 10}
          onClick={() => navigate(`/artist/${item.id}`)}
          onHold={() => toggleArtistContextMenu(item)}
        />
      );
    }

    const toggleTypePanel = {
      album: toggleAlbumContextMenu,
      compilation: toggleAlbumContextMenu,
      single: toggleAlbumContextMenu,

      playlist: () => {},
    };

    const nav = {
      playlist: "playlist",
      album: "album",
      single: "album",
      compilation: "album",
    };

    let subtitle = <ArtistsDisplay artists={item.artists} />;
    if (item.type === "playlist") {
      subtitle = item.track_count + " tracks";
    }

    return (
      <BoxItem
        title={<Title>{item.title}</Title>}
        subtitle={subtitle}
        onClick={() => navigate(`/${nav[item.type]}/${item.id}`)}
        onHold={() => toggleTypePanel[item.type](item)}
        size={boxSize - 10}
        cover={item.cover}
      />
    );
  }

  const navigate = useNavigate();
  const secBack = window.location.origin + "/back6.png";

  return (
    <div className="main-panel library" style={{ overflow: "auto" }}>
      <h2 className="header">
        <img src={secBack} alt="" className="bg-img flip" height="100%" />
        <div className="flex aictr spbtw" style={{ flex: 1 }}>
          <div className="flex aictr" style={{ gap: 10 }}>
            <BiLibrary size={40} />
            Your library
          </div>
          <div>
            <UserAvatar />
          </div>
        </div>
      </h2>

      <div className="filter-bar">
        <div className="filter-btt" onClick={() => setItemFilter(-1)}>
          {itemFilter !== -1 ? <AiOutlineClose size={15} /> : <HiFilter />}
        </div>

        {(() => {
          return ["Playlists", "Albums", "Artists"].map((a, i) => {
            let className = "fixed filter-btt";
            const stl = { transform: "" };

            if (itemFilter === i) {
              className += " active";
              stl.transform = `translateX(${-90 * i}px)`;
            } else if (itemFilter !== -1) {
              className += " inactive";
            }

            return (
              <div
                className={className}
                onClick={() => setItemFilter(i)}
                style={stl}
              >
                {a}
              </div>
            );
          });
        })()}
      </div>

      {renderArr.length ? (
        <StaticBoxList
          renderArr={renderArr}
          onClick={({ item }) => {
            navigate(`/artist/${item.id}`);
          }}
          renderFunc={renderFunction}
        />
      ) : (
        <EmptyScreen
          text={
            <>
              <div style={{ fontSize: 15 }}>
                You haven't saved any yet, so... But they will appear here as
                soon as you do it
              </div>
              <Damn height={30} />
              <Link
                style={{ color: "#fee39c", textDecoration: "underline" }}
                to="/search"
              >
                SEARCH FOR MORE
              </Link>
            </>
          }
        />
      )}
    </div>
  );
}

function StaticBoxList({
  renderArr = [],
  renderFunc = null,
  onClick = ({ e, item, index }) => {},
  onHold = ({ e, item, index }) => {},
}) {
  const [boxSize, setBoxSize] = useState(120);
  const [boxCount, setBoxCount] = useState(3);

  useEffect(() => {
    function handleResize() {
      const cssW = document.body.style.getPropertyValue("--main-width");
      const width = Number(cssW.split("px")[0]) - 30;

      const [newSize, newCount] = findDivisor(width || 1, 120, 180);

      setBoxSize(newSize);
      setBoxCount(newCount);
    }

    window.addEventListener("resize", handleResize);

    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [boxCount]);

  const dvded = divideArrayIntoSections(renderArr, boxCount);

  const defaultRenderFunc = (item, index) => {
    if (typeof renderFunc === "function") {
      return renderFunc({ item, index, boxSize, onClick, onHold });
    }

    const { title, artists, cover } = item || {};

    return (
      <BoxItem
        title={title}
        subtitle={<ArtistsDisplay artists={artists} />}
        cover={cover}
        size={boxSize - 10}
        onClick={(e) => onClick({ e, item, index })}
        onHold={(e) => onHold({ e, item, index })}
      />
    );
  };

  return (
    <div className="static-box-list" style={{ fontSize: 11 }}>
      {dvded.map((arr) => {
        return (
          <div className="flex" style={{ gap: 10, marginBottom: 20 }}>
            {arr.map(defaultRenderFunc)}
          </div>
        );
      })}
    </div>
  );
}

function findDivisor(dividend, minRange, maxRange) {
  let closestQuotient = minRange;
  let closestDivisor = dividend / minRange;

  let divisor = 1;
  let quotient = dividend / divisor;

  while (divisor < dividend && (quotient <= minRange || quotient >= maxRange)) {
    divisor++;
    quotient = dividend / divisor;

    if (quotient > minRange && quotient <= maxRange) {
      if (quotient - minRange < closestQuotient - minRange) {
        closestQuotient = quotient;
        closestDivisor = divisor;
      } else if (maxRange - quotient < maxRange - closestQuotient) {
        closestQuotient = quotient;
        closestDivisor = divisor;
      }
    }
  }

  const fraction = closestDivisor % 1;

  if (fraction > 0.8) {
    closestDivisor = Math.ceil(closestDivisor);
  } else {
    closestDivisor = Math.floor(closestDivisor);
  }

  return [closestQuotient, Math.max(1, closestDivisor)];
}

function divideArrayIntoSections(arr = [], sectionSize = 30) {
  const numSections = Math.ceil(arr.length / sectionSize);

  return Array.from({ length: numSections }, (_, i) =>
    arr.slice(i * sectionSize, (i + 1) * sectionSize)
  );
}

function UserAvatar() {
  return (
    <Link to="/settings">
      <div
        className="zum"
        style={{
          backgroundImage:
            "url('https://cdn.discordapp.com/avatars/539784616517566474/cbe2fc58edcd456d967a07b7db2a6f96.webp')",
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundSize: "cover",
        }}
      ></div>
    </Link>
  );
}
