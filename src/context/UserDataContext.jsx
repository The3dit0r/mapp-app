import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";

import PopUpContext from "./PopUpContext";

import { storage } from "../utilityFunction";

import { userDataUrl } from "../config";
import { BiErrorCircle } from "react-icons/bi";
import { FaHeartBroken } from "react-icons/fa";

const UserDataContext = createContext();

export function UserDataProvider({ children }) {
  const popUp = useContext(PopUpContext);

  const [loggedIn, toggleLoggedIn] = useState(false);
  const [logInAttempting, toggleLoginAttempting] = useState(false);
  const [timeout, toggleTimeout] = useState(false);

  const [userData, setUserData] = useState({
    id: "",
    name: "",
    username: "",
    joinDate: -1,
    savedItems: {
      playlists: [],
      artists: [],
      albums: [],
      tracks: [],
    },
    createdPlaylist: [],
    playbackHistory: [],
  });

  const updateUserData = (newUserData) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      ...newUserData,
    }));
  };

  const savedItemsFunc = {
    /**
     * Check if an item is saved
     * @param {String} id System ID
     * @returns {String}
     */
    async syncSavedItems(type) {
      if (!verifyUserLogin()) return null;

      try {
        const results = await axios.post(`${userDataUrl}/${type}/saved`, {
          access_token: getUserToken(),
        });

        const newSavedItems = userData.savedItems;
        newSavedItems[type] = results.data.data.items.map((i) => i.id);

        updateUserData({ savedItems: newSavedItems });

        return results.data.data;
      } catch (err) {
        return null;
      }
    },

    /**
     * Check if an item is saved
     * @param {String} id System ID
     * @returns {String}
     */
    isSaved(id) {
      const types = Object.keys(userData.savedItems);

      for (let i = 0; i < types.length; i++) {
        if (userData.savedItems[types[i]].map((c) => c.id).includes(id)) {
          return types[i];
        }
      }

      return null;
    },

    /**
     * Save an item
     * @param {String} type Item's type
     * @param {String} id Item's ID
     * @returns {Object}
     */
    async saveItem(type = "tracks", track = {}) {
      if (!verifyUserLogin() || timeout) return null;
      const oldSavedItems = { ...userData.savedItems };

      if (type === "playlists") {
        const idList = userData.createdPlaylist.map((a) => a.id);

        if (idList.includes(track.id)) {
          return null;
        }
      }

      try {
        const newSavedItems = userData.savedItems;
        newSavedItems[type].push(track);

        updateUserData({ savedItems: newSavedItems });

        toggleTimeout(true);
        const results = await axios.post(`${userDataUrl}/me/${type}/save`, {
          access_token: getUserToken(),
          id: track.id,
        });

        newSavedItems[type].pop();
        newSavedItems[type].push(results.data.data);
        updateUserData({ savedItems: newSavedItems });

        toggleTimeout(false);

        return results.data.data;
      } catch (err) {
        updateUserData({ savedItems: oldSavedItems });

        toggleTimeout(false);
        return null;
      }
    },

    /**
     * Unsave an item
     * @param {String} type Item's type
     * @param {String} id Item's ID
     * @returns {Object}
     */
    async unsaveItem(type = "tracks", id = "") {
      if (!verifyUserLogin() || timeout) return null;
      const oldSavedItems = { ...userData.savedItems };

      try {
        const newSavedItems = userData.savedItems;
        newSavedItems[type] = newSavedItems[type].filter((t) => t.id !== id);
        updateUserData({ savedItems: newSavedItems });

        toggleTimeout(true);
        const results = await axios.post(`${userDataUrl}/me/${type}/unsave`, {
          access_token: getUserToken(),
          id: id,
        });

        toggleTimeout(false);
        return results.data.data;
      } catch (err) {
        updateUserData({ savedItems: oldSavedItems });

        toggleTimeout(false);
        return null;
      }
    },

    getType(type = "tracks") {
      return userData.savedItems[type];
    },
  };

  useEffect(() => {
    const request = { valid: true };
    const controller = new AbortController();

    toggleLoggedIn(false);
    toggleLoginAttempting(true);

    async function getUserInfo() {
      try {
        const results = (
          await axios.post(
            `${userDataUrl}/me/info`,
            { access_token: getUserToken() },
            { signal: controller.signal }
          )
        ).data.data;

        if (request.valid) {
          setUserData(results);

          // console.log(results);
          toggleLoggedIn(true);
          setTimeout(() => toggleLoginAttempting(false), 1000);
        }
      } catch {
        toggleLoggedIn(false);
        toggleLoginAttempting(false);

        if (!getUserToken()) return;

        storage.setItem("accessToken", "");

        popUp.setPopPanel({
          title: "Authentication failed, please login again",
          icon: <BiErrorCircle size={25} />,
        });
      }
    }

    getUserInfo();

    return () => {
      request.valid = false;
      controller.abort();
    };

    // eslint-disable-next-line
  }, []);

  function getUserToken() {
    // return "3ZkzakhN5mvTcARmuk1YdA0lVge0Q78j2EqxqCl8ot9S0HfOPyE0uXcpCSwnQSsJ";
    return storage.getItem("accessToken");
  }

  function verifyUserLogin() {
    return loggedIn && getUserToken();
  }

  function isRetrievingData() {
    return logInAttempting;
  }

  function getUserDisplay() {
    return {
      username: userData.username,
      displayName: userData.name,
      id: userData.id,
    };
  }

  function playlistIsMadeByUser(id) {
    return userData.createdPlaylist.map((pl) => pl.id).includes(id);
  }

  async function addToPlaybackHistory(item) {
    if (userData.playbackHistory[0]?.id === item.id || timeout) return;
    const oldPlaybackHistory = [...userData.playbackHistory];

    try {
      toggleTimeout(true);

      const newPlaybackHistory = [...userData.playbackHistory];
      newPlaybackHistory.unshift(item);
      updateUserData({ playbackHistory: newPlaybackHistory });

      const results = await axios.post(`${userDataUrl}/me/playback_history`, {
        access_token: getUserToken(),
        id: item.id,
      });

      if (results.data.data !== null) {
        newPlaybackHistory.shift();
        newPlaybackHistory.unshift(results.data.data);

        updateUserData({ playbackHistory: newPlaybackHistory });
        toggleTimeout(false);
      }
    } catch (err) {
      updateUserData({ playbackHistory: oldPlaybackHistory });
      toggleTimeout(false);
    }
  }

  async function addToPlaylist({ id = "", items = [] }) {
    // console.log(id, items);

    if (!id.length === 23 || !items.length) return; // console.log("Failed 1");
    if (!id.endsWith("cP-")) return; // console.log("Failed 2");
    if (!playlistIsMadeByUser(id)) return; // console.log("Failed 3");

    // console.log(items);

    try {
      const request = await axios.post(`${userDataUrl}/me/playlist/add`, {
        data: { items: items, id: id },
        access_token: getUserToken(),
      });

      // console.log(request.data);
      return true;
    } catch {
      return false;
    }
  }

  const value = {
    ...userData,
    loggedIn,

    savedItems: {
      ...userData.savedItems,
      ...savedItemsFunc,
    },

    verifyUserLogin,
    getUserToken,
    isRetrievingData,
    getUserDisplay,
    addToPlaybackHistory,

    // Playlist
    playlistIsMadeByUser,
    addToPlaylist,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

function GetHeart({ con, size }) {
  return !con ? (
    <BsSuitHeart size={size} />
  ) : (
    <BsSuitHeartFill size={size} color="#fee39c" />
  );
}

export function SaveButton({ type = "", item = {}, size = 30 }) {
  const userData = useContext(UserDataContext);
  const popUp = useContext(PopUpContext);

  const isSaved = userData.savedItems.isSaved(item.id);

  const handleOnClick = (e) => {
    e.stopPropagation();

    if (isSaved) {
      userData.savedItems.unsaveItem(type, item.id);

      popUp.setPopPanel({
        title: "Item removed from favorite",
        icon: <FaHeartBroken size={22} color="var(--back-color)" />,
      });
    } else {
      userData.savedItems.saveItem(type, item);

      popUp.setPopPanel({
        title: "Item added to favorite",
        icon: <BsSuitHeartFill size={22} color="#000" />,
      });
    }
  };

  if (!userData.verifyUserLogin()) return <div></div>;

  return (
    <div className="flex aictr jcctr zum" onClick={handleOnClick}>
      <GetHeart con={isSaved} size={size} />
    </div>
  );
}

export default UserDataContext;
