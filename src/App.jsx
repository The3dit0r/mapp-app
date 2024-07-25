import { useContext, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

import BottomNavBar from "./BottomNavBar";
import { ArtistsDisplayLink } from "./UtilityComponent";

import ContextMenu from "./components/ContextMenu";
import MiniPlayer from "./components/MiniPlayer";
import LoadingIcon from "./components/LoadingIcon";

import useContextMenu from "./hook/useContextMenu";

import UserDataContext from "./context/UserDataContext";
import QueueContext from "./context/QueueContext";
import PopUpContext from "./context/PopUpContext";

// import { PlayButton } from "./UtilityComponent";
import { MdPlaylistPlay, MdPlaylistAdd, MdRadio } from "react-icons/md";
import {
  BsStars,
  BsCheckCircle,
  BsSuitHeartFill,
  BsSuitHeart,
} from "react-icons/bs";
import { AiFillPlayCircle } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { BiAlbum } from "react-icons/bi";
import { FiRadio } from "react-icons/fi";

import LibraryPanel from "./main/LibraryPanel";
import SearchPanel from "./main/SearchPanel";
import PlayerPanel from "./main/PlayerPanel";
import HomePanel from "./main/HomePanel";
import AlbumPanel from "./main/AlbumPanel";
import PlaylistPanel from "./main/PlaylistPanel";
import ArtistPanel from "./main/ArtistPanel";

import getEnhanced from "./utilityFunction";
import FavoritePanel from "./main/FavoritePanel";

import { apiUrl } from "./config";
import SettingsPanel from "./main/SettingsPanel";
import ArtistAlbums from "./main/ArtistAlbums";

export default function App() {
  const queueSystem = useContext(QueueContext);
  const popUp = useContext(PopUpContext);
  const userData = useContext(UserDataContext);

  // // console.log(popUp);

  const [contextData, contextFunc] = useContextMenu();

  const [playerPanelShown, togglePlayerPanel] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    function handleResize(e) {
      const standard = 900;
      let { width, height } = window.visualViewport;
      const zoom = Math.round((height / standard) * 100) / 100;

      const body = document.body;

      const el = document.activeElement;
      if (el.tagName === "INPUT") return;

      // body.style.setProperty("--main-height", height + "px");
      // body.style.setProperty("--main-width", width + "px");
      body.style.setProperty("--main-height", height / zoom - 2 + "px");
      body.style.setProperty("--main-width", width / zoom - 2 + "px");

      body.style.setProperty("--zoom", zoom);

      document
        .querySelector("meta[name=viewport]")
        .setAttribute(
          "content",
          "height=" +
            height +
            ", width=device-width, initial-scale=1.0, user-scalable=0"
        );

      handleScroll();
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    function handleScroll() {
      window.scrollTo(0, 0);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleVisit(type, id) {
    const curLoc = window.location.pathname;
    const path = "/" + type + "/" + id;

    if (!curLoc.includes(path)) {
      navigate(path);
    } else {
      // alert("You are already here !!");
    }
  }

  function getFavoriteContextButton(type = "", item = {}) {
    if (!userData.verifyUserLogin()) return 0;

    const isSaved = userData.savedItems.isSaved(item.id) ? 1 : 0;
    const statement = ["added to", "removed from"][isSaved];

    const handleOnClick = () => {
      try {
        if (isSaved) {
          userData.savedItems.unsaveItem(type.toLowerCase(), item.id);
        } else {
          userData.savedItems.saveItem(type.toLowerCase(), item);
        }
        popUp.setPopPanel({
          title: "Item " + statement + " favorite",
          icon: <BsCheckCircle size={27} />,
        });
      } catch (err) {
        // // console.log(err);
        popUp.setPopPanel({ title: "Failed to execute action" });
      }
    };

    return {
      text: ["Add to", "Remove from"][isSaved] + " favorite",
      icon: <GetHeart con={isSaved} size={32} />,
      onClick: handleOnClick,
    };
  }

  function toggleTrackContextMenu(track) {
    if (!track?.id) return;

    contextFunc.toggleMenu({
      title: track.title,
      subtitle: <ArtistsDisplayLink artists={track.artists} />,
      cover: track.cover,
      buttons: [
        {
          text: "Play track",
          icon: <AiFillPlayCircle size={32} />,
          onClick: async () => {
            queueSystem.playItem(track);
            popUp.setPopPanel({
              title: "Playing " + track.title,
              icon: <AiFillPlayCircle size={28} />,
            });
          },
        },
        {
          text: "Play after current track",
          icon: <MdPlaylistPlay size={32} />,
          onClick: () => {
            queueSystem.topItems(track);
            popUp.setPopPanel({
              title: "Track added to top of queue",
              icon: <BsCheckCircle size={27} />,
            });
          },
        },
        {
          text: "Add to queue",
          icon: <MdPlaylistAdd size={32} />,
          onClick: () => {
            queueSystem.addItems(track);
            popUp.setPopPanel({
              title: "Track added to queue",
              icon: <BsCheckCircle size={26} />,
            });
          },
        },
        {
          text: "Enhance queue",
          icon: <BsStars size={32} />,
          onClick: async () => {
            popUp.setPopPanel({
              icon: <LoadingIcon size={50} />,
              title: "Adding some flavor to your queue...",
              duration: 2e4,
            });

            const items = await getEnhanced(
              track.artists.slice(0, 2).map((a) => a.id),
              [track.id],
              9
            );

            queueSystem.addItems(track, ...items);

            popUp.setPopPanel({
              icon: <BsCheckCircle size={27} />,
              title: "10 tracks have been added to queue",
              duration: 2e3,
            });
          },
        },
        {
          text: "Start track's radio",
          icon: <FiRadio size={32} />,
          onClick: () => {
            popUp.setPopPanel({ title: "Function is not available" });
          },
        },
        getFavoriteContextButton("tracks", track),
        {
          text: "Visit album's page",
          icon: <BiAlbum size={32} />,
          onClick: () => handleVisit("album", track.album.id),
        },
        {
          text: "Visit track radio's page",
          icon: <MdRadio size={32} />,
          onClick: () => {
            popUp.setPopPanel({ title: "Function is not available" });
          },
        },
      ],
    });
  }

  function toggleAlbumContextMenu(album, items = []) {
    if (!album?.id) return;

    async function getTracks() {
      if (items?.length) return items;

      const result = (await axios.get(`${apiUrl}/album/${album.id}/tracks`))
        .data;

      return result.data.items;
    }

    contextFunc.toggleMenu({
      type: `${album.type} (${album.track_count})`,
      title: album.title,
      subtitle: <ArtistsDisplayLink artists={album.artists} />,
      cover: album.cover,
      buttons: [
        {
          text: "Play album",
          icon: <AiFillPlayCircle size={32} />,
          onClick: async () => {
            const items = await getTracks();
            queueSystem.playItemsFromSource(
              items,
              { ...album, type: "album" },
              0
            );
            popUp.setPopPanel({
              title: "Playing " + album.title,
              icon: <BsCheckCircle size={26} />,
            });
          },
        },
        {
          text: "Play after current track",
          icon: <MdPlaylistPlay size={32} />,
          onClick: async () => {
            const items = await getTracks();
            queueSystem.topItems(...items);
            popUp.setPopPanel({
              title: "Album added to top of queue",
              icon: <BsCheckCircle size={27} />,
            });
          },
        },

        {
          text: "Add to queue",
          icon: <MdPlaylistAdd size={32} />,
          onClick: async () => {
            const items = await getTracks();

            queueSystem.addItems(...items);
            popUp.setPopPanel({
              title: "Album added to queue",
              icon: <BsCheckCircle size={27} />,
            });
          },
        },
        {
          text: "Enhance queue",
          icon: <BsStars size={32} />,
          onClick: () => {
            popUp.setPopPanel({ title: "Function is not available" });
          },
        },
        getFavoriteContextButton("albums", album),
        {
          text: "Visit album's page",
          icon: <BiAlbum size={32} />,
          onClick: () => handleVisit("album", album.id),
        },
      ],
    });
  }

  function toggleArtistContextMenu(artist, items = []) {
    if (!artist?.id) return;

    async function getTracks() {
      if (items?.length) return items;

      const result = (
        await axios.get(`${apiUrl}/artist/${artist.id}/top_tracks`)
      ).data.data.items;

      return result;
    }

    contextFunc.toggleMenu({
      type: "Artist",
      title: artist.name,
      subtitle: `${artist.followers.total.toLocaleString()} followers`,
      cover: artist.images,
      buttons: [
        {
          text: "Play artist's top tracks",
          icon: <AiFillPlayCircle size={32} />,
          onClick: async () => {
            const items = await getTracks();

            queueSystem.playItemsFromSource(
              items,
              { ...artist, title: artist.name },
              0
            );
            popUp.setPopPanel({
              title: "Playing top tracks from " + artist.name,
              icon: <BsCheckCircle size={26} />,
            });
          },
        },
        {
          text: "Play after current track",
          icon: <MdPlaylistPlay size={32} />,
          onClick: async () => {
            const items = await getTracks();

            queueSystem.topItems(...items);
            popUp.setPopPanel({
              title: "Artist's top tracks added to top of queue",
              icon: <BsCheckCircle size={27} />,
            });
          },
        },

        {
          text: "Add to queue",
          icon: <MdPlaylistAdd size={32} />,
          onClick: async () => {
            const items = await getTracks();

            queueSystem.addItems(...items);
            popUp.setPopPanel({
              title: "Artist's top tracks added to queue",
              icon: <BsCheckCircle size={27} />,
            });
          },
        },
        {
          text: "Enhance queue",
          icon: <BsStars size={32} />,
          onClick: () => {
            popUp.setPopPanel({ title: "Function is not available" });
          },
        },
        getFavoriteContextButton("artists", artist),
        {
          text: "Visit artist's page",
          icon: <FaUserCircle size={32} />,
          onClick: () => handleVisit("artist", artist.id),
        },
      ],
    });
  }

  const f = {
    toggleArtistContextMenu,
    toggleTrackContextMenu,
    toggleAlbumContextMenu,
    togglePlayerPanel,

    contextFunc,
    popUp,
  };

  return (
    <div id="main-container" className={playerPanelShown ? "player-shown" : ""}>
      <Routes>
        {/* Redirect routes*/}
        <Route path="/playlist/favorite" element={<RedirectPlaylist />} />
        <Route path="/compilation/:id" element={<RedirectAlbum />} />
        <Route path="/single/:id" element={<RedirectAlbum />} />
        {/* Main routes */}
        <Route path="/search" element={<SearchPanel {...f} />} />
        <Route path="/home" element={<HomePanel {...f} />} />
        <Route path="/library" element={<LibraryPanel {...f} />} />
        <Route path="/album/:id" element={<AlbumPanel {...f} />} />
        <Route path="/playlist/:id" element={<PlaylistPanel {...f} />} />
        <Route path="/artist/:id" element={<ArtistPanel {...f} />} />
        <Route path="/artist_albums/:id" element={<ArtistAlbums {...f} />} />
        <Route path="/favorite" element={<FavoritePanel {...f} />} />
        {/* Other routes */}
        <Route path="/settings" element={<SettingsPanel />} />
        <Route path="*" element={<LibraryPanel {...f} />} />
      </Routes>
      <BottomNavBar />
      <MiniPlayer {...f} />
      <PlayerPanel {...f} />
      <ContextMenu {...contextData} {...contextFunc} />
    </div>
  );
}

function RedirectAlbum() {
  const { id } = useParams();

  return <Navigate to={"/album/" + id}></Navigate>;
}

function RedirectPlaylist() {
  return <Navigate to={"/favorite"}></Navigate>;
}

function RedirectLibrary() {
  return <Navigate to={"/library"}></Navigate>;
}

function GetHeart({ con, size }) {
  return !con ? <BsSuitHeart size={size} /> : <BsSuitHeartFill size={size} />;
}
