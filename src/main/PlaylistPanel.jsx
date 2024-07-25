import { useContext, useEffect, useState } from "react";
import SwipeableViews from "react-swipeable-views";
import { useParams } from "react-router";
import axios from "axios";

import {
  AiOutlineCloseCircle,
  AiOutlineClose,
  AiOutlineSearch,
  AiFillEdit,
  AiOutlinePlusCircle,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import {
  BsHeartFill,
  BsStars,
  BsCheckCircle,
  BsCheckCircleFill,
} from "react-icons/bs";
import { MdHistory } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";

import MoreElaborateLoadingScreen from "../components/MoreElaborateLoadingScreen";
import LoadingIcon from "../components/LoadingIcon";
import ArtistList from "../components/ArtistList";
import ListPanel from "../components/ListPanel";
import RowItem from "../components/RowItem";
import Damn from "../components/Damn";

import UserDataContext, { SaveButton } from "../context/UserDataContext";
import PopUpContext from "../context/PopUpContext";

import { ArtistsDisplay } from "../UtilityComponent";
import { generateData, getEnhanced } from "../utilityFunction";

import { apiUrl } from "../config";

export default function PlaylistPanel({
  toggleTrackContextMenu,
  toggleArtistContextMenu,
}) {
  const userData = useContext(UserDataContext);
  const popUp = useContext(PopUpContext);

  const [generalData, setGeneralData] = useState(0);
  const [playlistTracks, setPlaylistTracks] = useState(0);
  const [searchPanel, toggleSearchPanel] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState([]);

  const [additionalTracks, setAdditionalTracks] = useState([]);

  const { id } = useParams();

  const madeByUser = userData.playlistIsMadeByUser(id);

  const addAdditionalTrack = ({ finishLoading, item }) => {
    const existed = (playlistTracks || []).concat(additionalTracks);
    const existedIDs = existed.map((a) => a.id);

    const exec = async () => {
      if (existedIDs.includes(item.id)) {
        popUp.setPopPanel({
          title: item.title + " is already in the playlist",
        });

        finishLoading(false);
      } else {
        const result = await userData.addToPlaylist({
          id: id,
          items: [item.id],
        });

        if (result) {
          popUp.setPopPanel({
            title: item.title + " added to the playlist",
            icon: <BsCheckCircle size={27} />,
          });

          setAdditionalTracks((ad) => [...ad, item]);
        } else {
          popUp.setPopPanel({
            title: "Failed to reach the server, please try again",
          });
        }

        finishLoading(result);
      }
    };

    setTimeout(exec, 100);
  };

  useEffect(() => {
    const request = { valid: true };

    async function getGeneral() {
      const result = (await axios.get(`${apiUrl}/playlist/${id}/general`)).data;

      if (request.valid) setGeneralData(result.data);
    }

    async function getTracks() {
      const result = (await axios.get(`${apiUrl}/playlist/${id}/tracks`)).data;
      const items = result.data.items;

      setPlaylistTracks([...items]);

      items.sort(() => 0.5 - Math.random());

      if (madeByUser) {
        getRecommended(...items.slice(0, Math.min(items.length / 2, 5)));
      }
    }

    async function getRecommended(...tracks) {
      // return;

      setRecommendedTracks(generateData(20));
      const promiseArr = [];

      while (tracks.length > 0) {
        promiseArr.push(
          getEnhanced(
            [],
            tracks.splice(0, 3).map((t) => t.id)
          )
        );
      }

      // // console.log(promiseArr);
      Promise.allSettled(promiseArr).then((res) => {
        const all = [];

        res.forEach((r) => {
          if (r.status === "rejected") return 0;

          all.push(
            ...r.value
              .sort(() => 0.5 - Math.random())
              .slice(0, Math.ceil(30 / res.length))
          );
        });

        //// Filter out tracks with the same album ID
        setRecommendedTracks(all);
      });
    }

    setGeneralData(0);

    getGeneral();
    getTracks();

    return () => {
      request.valid = false;
    };

    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    const target = document.getElementById("main-container");

    if (searchPanel) {
      target.classList.add("hide-bottom");
    } else {
      target.classList.remove("hide-bottom");
    }
  }, [searchPanel]);

  if (!generalData)
    return (
      <div className="main-panel">
        <MoreElaborateLoadingScreen />
      </div>
    );

  const {
    title = "",
    cover = [],
    author = {},
    type = "Album",
    description = "",
  } = generalData;
  const appearedArtists = getArtistsIDFromTrackList(playlistTracks || []);

  if (searchPanel)
    return (
      <div className="main-panel">
        <MiniSearchPanel
          addAdditionalTrack={addAdditionalTrack}
          toggleSearchPanel={toggleSearchPanel}
          recommendedTracks={recommendedTracks}
        />
      </div>
    );

  const renderArr = (playlistTracks || []).concat(additionalTracks);

  return (
    <div className="main-panel">
      <ListPanel
        title={title}
        subtitle={
          <div>
            <div>{author.username}</div>
            <Damn height={20}>
              <hr />
              <i style={{ fontSize: 13 }}>{description}</i>
              <hr />
            </Damn>
          </div>
        }
        renderArr={renderArr}
        cover={cover}
        type={type}
        id={id}
        //
        toggleTrackContextMenu={toggleTrackContextMenu}
        favBtt={
          madeByUser ? (
            <AiFillEdit className="zum" size={32} />
          ) : (
            <SaveButton type="playlists" item={generalData} size={32} />
          )
        }
        showItemCover={true}
        playlistAdd={
          madeByUser ? (
            <RowItem
              style={{ padding: "0px 20px", fontSize: 12 }}
              title="Add track to playlist"
              height="60px"
              cover={[{ url: window.location.origin + "/add.png" }]}
              onClick={() => toggleSearchPanel(true)}
            />
          ) : (
            ""
          )
        }
      >
        <ArtistList
          artists={appearedArtists}
          onHold={toggleArtistContextMenu}
          maxDisplay={Math.round((window.innerHeight - 300) / 85)}
        />
      </ListPanel>
    </div>
  );
}

function MiniSearchPanel({
  addAdditionalTrack,
  toggleSearchPanel,
  recommendedTracks,
}) {
  const userData = useContext(UserDataContext);
  const popUp = useContext(PopUpContext);

  const [section, setSection] = useState(0);
  const [page, setPage] = useState(0);

  const playbackHistory = removeDuplicated(
    userData.playbackHistory,
    (a) => a.id
  ).slice(0, 20);

  const savedTracks = userData.savedItems.getType("tracks").slice(0, 30);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [secRes, setSecRes] = useState(null);
  const [secResID, setSecResID] = useState("");
  const [secResTitle, setSecResTitle] = useState("");

  function handleInput({ target = { value: "" } }) {
    setQuery(target.value);
  }

  useEffect(() => {
    const request = { isValid: true };
    const controller = new AbortController();

    const searchTerm = query.trim();

    async function search(q) {
      setLoading(true);
      const result = await axios.post(
        `${apiUrl}/search`,
        { query: q, limit: 20 },
        { signal: controller.signal }
      );

      if (request.isValid) {
        setResult(result.data);
      }
      setLoading(false);
    }

    if (!searchTerm.length) return;

    const timeout = setTimeout(() => {
      search(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timeout);
      request.isValid = false;
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!secResID) return () => {};

    const request = { valid: true };
    const controller = new AbortController();

    let typeURI = "tracks";
    if (secResID.includes("artist")) typeURI = "top_tracks";

    const requestUrl = `${apiUrl}/${secResID}/${typeURI}`;

    async function getItems() {
      setSecRes(1);

      try {
        const result = (
          await axios.get(requestUrl, {
            signal: controller.signal,
          })
        ).data.data.items;

        if (request.valid) {
          setSecRes(result);
        }
      } catch {
        setSecRes(null);
        setSecResID("");
      }
    }

    getItems();

    return () => {
      request.valid = false;
      controller.abort();
    };
  }, [secResID]);

  let renderArr = [];

  if (!result) {
    renderArr = [
      <ItemContainer
        items={playbackHistory}
        title={<Title icon={<MdHistory size={25} />} text="Recently played" />}
        onPlusClick={addAdditionalTrack}
      />,
      <ItemContainer
        items={recommendedTracks}
        title={
          <Title icon={<BsStars size={25} />} text="Recommended for you" />
        }
        onPlusClick={addAdditionalTrack}
      />,
      <ItemContainer
        items={savedTracks}
        title={<Title icon={<BsHeartFill size={20} />} text="Liked tracks" />}
        onPlusClick={addAdditionalTrack}
      />,
    ];
  } else {
    const getSectionClass = (i) => {
      return {
        className: "option " + (i === section ? "selected" : ""),
        onClick: () => setSection(i),
      };
    };

    const type = ["tracks", "albums", "artists"];

    if (result.tracks.length) {
      renderArr.push(
        <ItemContainer
          items={result[type[section]]}
          title={
            <div className="result-filter flex jcctr" style={{ "--c": 3 }}>
              <button {...getSectionClass(0)}>Tracks</button>
              <button {...getSectionClass(1)}>Albums</button>
              <button {...getSectionClass(2)}>Artists</button>
            </div>
          }
          onClick={(item) => {
            const nav = {
              playlist: "playlist",
              album: "album",
              single: "album",
              compilation: "album",
              artist: "artist",
            };

            setSecResID(`${nav[item.type]}/${item.id}`);
            setSecResTitle(`${item.name || item.title}`);

            setPage(1);
          }}
          onPlusClick={addAdditionalTrack}
        />
      );
    }

    // console.log(secRes);

    if (Array.isArray(secRes)) {
      renderArr.push(
        <ItemContainer
          items={secRes}
          title={
            <div className="flex aictr" style={{ gap: 20 }}>
              <AiOutlineArrowLeft
                onClick={() => setPage(0)}
                className="zum"
                size={25}
              />
              <div className="line-ellipsis">{secResTitle}</div>
            </div>
          }
          onPlusClick={addAdditionalTrack}
        />
      );
    }

    if (secRes === 1) {
      renderArr.push(
        <div
          style={{ height: "calc(var(--main-height) - 210px)" }}
          className="container"
        >
          <MoreElaborateLoadingScreen />
        </div>
      );
    }
  }

  const secResIndex = result ? (secRes ? 1 : 0) : Infinity;
  const pageIndex = Math.min(page, renderArr.length - 1, secResIndex);

  return (
    <div className="float-menu playlist">
      <h4 className="flex aictr jcctr">
        <div style={{ position: "absolute", top: 20, left: 10 }}>
          <AiOutlineClose
            onClick={() => toggleSearchPanel(false)}
            className="zum"
            size={25}
          />
        </div>
        Add tracks to playlist
      </h4>

      <div className="search-bar flex aictr" style={{ height: 50 }}>
        <AiOutlineSearch size={30} color={"#000"} />
        <input
          onChange={handleInput}
          onInput={handleInput}
          inputMode="search"
          placeholder="What do you want?"
          value={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
        {!(query !== "") || (
          <AiOutlineCloseCircle
            size={25}
            className="zum"
            onClick={() => {
              setQuery("");
              setResult(null);
            }}
            color="#000"
          />
        )}
      </div>

      {loading ? (
        <div
          style={{ height: "calc(var(--main-height) - 200px)" }}
          className="container"
        >
          <MoreElaborateLoadingScreen />
        </div>
      ) : (
        <>
          <SwipeableViews
            containerStyle={{ height: "calc(100%)" }}
            style={{ height: "calc(100% - 160px)" }}
            onChangeIndex={(index) => setPage(index)}
            slideStyle={{ height: "calc(100%)" }}
            index={pageIndex}
          >
            {renderArr}
          </SwipeableViews>
          <div className="flex aictr jcctr" style={{ gap: 5 }}>
            {renderArr.map((_, i) => {
              const c = {
                style: { fontSize: 30, transform: "translateY(-20px)" },
                className: "dot" + (i === pageIndex ? " on" : ""),
                onClick: () => setPage(i),
              };
              return <div {...c}>&bull;</div>;
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Title({ icon, text }) {
  return (
    <div className="flex aictr jcctr" style={{ gap: 10 }}>
      {icon}
      {text}
    </div>
  );
}

function ItemContainer({
  items = [],
  title = "",
  onClick = () => {},
  onPlusClick = () => {},
}) {
  const notTrack = ["artist", "album", "single", "compilation"];

  const [loadingItems, setLoadingItems] = useState([]);
  const [succeeded, setSucceeded] = useState([]);

  function getSubtitle(item) {
    switch (item.type) {
      case "artists":
        return item.followers.total + "followers";

      default:
        return <ArtistsDisplay artists={item.artists} />;
    }
  }

  function getCover(item) {
    const cover = item.cover || item.images || [];

    if (!cover.length) return [];
    return [cover[cover.length - 1]];
  }

  function getScale(item) {
    if (notTrack.includes(item.type)) return "";
    return "nozum";
  }

  function getOther(item) {
    if (notTrack.includes(item.type))
      return <FaArrowRight size={20} className="zum" />;

    if (loadingItems.includes(item.id))
      return <LoadingIcon size={55} style={{ marginRight: -15 }} />;

    if (succeeded.includes(item.id)) {
      return <BsCheckCircleFill size={21} />;
    }

    return (
      <AiOutlinePlusCircle
        size={25}
        className="zum"
        onClick={(e) => {
          setLoadingItems((prevLoad) => [...prevLoad, item.id]);

          function finishLoading(succeeded = false) {
            if (succeeded) {
              setSucceeded((p) => [...p, item.id]);
            }

            setLoadingItems((prevLoad) =>
              [...prevLoad].filter((i) => i !== item.id)
            );
          }

          if (typeof onPlusClick === "function") {
            onPlusClick({ e, finishLoading, item });
          }
        }}
      />
    );
  }

  function getOnClick(item) {
    if (!notTrack.includes(item.type)) return () => {};
    return () => onClick(item);
  }

  return (
    <div className="container">
      <h1 className="type-header">{title}</h1>
      {items.map((item) => (
        <RowItem
          height="60px"
          title={item.title || item.name}
          cover={getCover(item)}
          subtitle={getSubtitle(item)}
          className={getScale(item)}
          other={getOther(item)}
          onClick={getOnClick(item)}
        />
      ))}
      <Damn height={10} />
      <div className="fade"></div>
    </div>
  );
}

/**
 * Get all artists from track list
 * @param {Array} list List of tracks
 * @returns
 */
function getArtistsIDFromTrackList(list = []) {
  const artists = {};

  list.forEach((track) => {
    track.artists.forEach((a) => {
      artists[a.id] = a.username;
    });
  });

  return Object.keys(artists);
}

function removeDuplicated(a, func) {
  const arr = [...a];
  const obj = {};

  arr.forEach((a, index) => {
    const i = func(a);
    if (obj[i]) {
      arr.splice(index, 1, 0);
    } else {
      obj[i] = true;
    }
  });

  return arr.filter((a) => a !== 0);
}
