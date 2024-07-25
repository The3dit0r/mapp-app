import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";

import UserDataContext from "../context/UserDataContext";
import MoreElaborateLoadingScreen from "../components/MoreElaborateLoadingScreen";
import ListPanel from "../components/ListPanel";
import Damn from "../components/Damn";
import ArtistList from "../components/ArtistList";
import { Link } from "react-router-dom";

export default function FavoritePanel({ toggleTrackContextMenu }) {
  const [filterData, setFilterData] = useState({
    username: "",
    id: "",
    coverUrl: "",
  });

  const userData = useContext(UserDataContext);
  const location = useLocation();

  const savedTracks = userData.savedItems.getType("tracks");

  useEffect(() => {
    const { filter_id = "", cover_url = "" } = extractQuery(location.search);

    const validArtists = getArtistsIDFromTrackList(savedTracks || []);
    const vaildID = Object.keys(validArtists);

    if (vaildID.includes(filter_id)) {
      setFilterData({
        ...validArtists[filter_id],
        coverUrl: cover_url ? "https://i.scdn.co/image/" + cover_url : "",
      });
    } else {
      setFilterData({ username: "", id: "", coverUrl: "" });
    }
  }, [location, savedTracks]);

  if (!userData.verifyUserLogin()) {
    // if (userData.isRetrievingData()) {
    return (
      <div className="main-panel">
        <MoreElaborateLoadingScreen />
      </div>
    );
    // }

    // return <Navigate to="/library"></Navigate>;
  }

  const { name } = userData;

  const renderArr = (savedTracks || []).filter(({ artists }) => {
    if (!filterData.id) return true;

    return artists.map((a) => a.id).includes(filterData.id);
  });
  const allArtistsID = Object.keys(getArtistsIDFromTrackList(renderArr));

  let panelTitle = <UglyComponent f={filterData} />;

  return (
    <div className="main-panel">
      <ListPanel
        renderArr={renderArr}
        // This is a comment
        title={panelTitle}
        subtitle={`${name} • ${renderArr.length} tracks`}
        coverUrl={
          filterData.coverUrl || window.location.origin + "/rnqa7yhv4il71.png"
        }
        displayType="compilation"
        type="favorite"
        //
        showItemCover={true}
        toggleTrackContextMenu={toggleTrackContextMenu}
        id={
          filterData.id
            ? `?filter_id=${filterData.id}&cover_url=${
                filterData.coverUrl.split("/image/")[1]
              }`
            : ""
        }
      >
        <ArtistList artists={allArtistsID} />
        <Damn height={60} />
      </ListPanel>
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
      artists[a.id] = a;
    });
  });

  return artists;
}

function extractQuery(str = "") {
  const query = str.slice(1, Infinity);
  const obj = {};

  const arr = query.split("&");

  arr.forEach((q) => {
    const o = q.split("=");
    obj[o[0]] = o[1];
  });

  return obj;
}

function UglyComponent({ f }) {
  return (
    <div>
      Liked tracks
      {f.id ? (
        <>
          {" "}
          by{" "}
          <Link
            to={"/artist/" + f.id}
            style={{ color: "#fae4af", fontStyle: "italic" }}
          >
            {f.username}
          </Link>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
