import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

import MoreElaborateLoadingScreen from "../components/MoreElaborateLoadingScreen";
import ListPanel from "../components/ListPanel";

import { ArtistsDisplayLink } from "../UtilityComponent";
import { getEnhanced } from "../utilityFunction";
import BoxList from "../components/BoxList";
import ArtistList from "../components/ArtistList";
import { SaveButton } from "../context/UserDataContext";

import { apiUrl } from "../config";

export default function AlbumPanel({
  toggleArtistContextMenu,
  toggleTrackContextMenu,
  toggleAlbumContextMenu,
}) {
  const [generalData, setGeneralData] = useState(0);
  const [albumTracks, setAlbumTracks] = useState(0);
  const [albumRelate, setAlbumRelate] = useState(0);
  const [discography, setDiscography] = useState(0);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const request = { valid: true };
    const controller = new AbortController();

    async function getGeneral() {
      const result = (
        await axios.get(`${apiUrl}/album/${id}/general`, {
          signal: controller.signal,
        })
      ).data;

      if (request.valid) {
        setGeneralData(result.data);
        getArtistAlbums(result.data.artists[0].id);
      }
    }

    async function getTracks() {
      const result = (
        await axios.get(`${apiUrl}/album/${id}/tracks`, {
          signal: controller.signal,
        })
      ).data;

      const items = result.data.items;

      setAlbumTracks([...items]);
      getRelated(
        ...items
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.ceil(items.length / 2))
      );
    }

    async function getRelated(...tracks) {
      // return;

      setAlbumRelate(0);
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

        // Filter out tracks with the same album ID
        setAlbumRelate(all.filter((a) => a.album.id !== id));
      });
    }

    async function getArtistAlbums(id) {
      if (id === "0LyfQWJT6nXafLPZqxe9Of") return;

      const results = (
        await axios.get(`${apiUrl}/artist/${id}/released?limit=10`, {
          signal: controller.signal,
        })
      ).data.data;

      if (request.valid) {
        setDiscography(results.items);
      }
    }

    setGeneralData(0);

    getGeneral();
    getTracks();

    return () => {
      request.valid = false;
      controller.abort();
    };
  }, [id]);

  if (!generalData)
    return (
      <div className="main-panel">
        <MoreElaborateLoadingScreen />
      </div>
    );

  const {
    title = "",
    cover = [],
    artists = [],
    copyrights = [],
    type = "Album",
  } = generalData;

  // const relatingAlbum = getAlbumsFromTrackList(albumRelate || [], id);
  const appearedArtists = getArtistsIDFromTrackList(albumTracks || []);
  const mainArtists = artists[0];

  return (
    <div className="main-panel">
      <ListPanel
        title={title}
        subtitle={<ArtistsDisplayLink artists={artists} />}
        cover={cover}
        renderArr={albumTracks || []}
        type={"album"}
        displayType={type}
        id={id}
        //
        toggleTrackContextMenu={toggleTrackContextMenu}
        toggleListContextMenu={() =>
          toggleAlbumContextMenu(generalData, albumTracks)
        }
        favBtt={<SaveButton type="albums" item={generalData} size={32} />}
        extractColorFrom={cover[0]?.url}
      >
        <CopyrightsInformation copyrights={copyrights} />

        <ArtistList
          artists={appearedArtists}
          onHold={toggleArtistContextMenu}
          maxDisplay={Math.round((window.innerHeight - 300) / 85)}
        />

        <BoxList
          renderArr={albumRelate || []}
          size={150}
          title="People also listen to"
          onClick={({ item }) => navigate("/album/" + item.album.id)}
          onHold={({ item }) => toggleTrackContextMenu(item)}
        />
        {mainArtists.id !== "0LyfQWJT6nXafLPZqxe9Of" ? (
          <BoxList
            size={150}
            title={"More from " + mainArtists.username}
            renderArr={discography || []}
            onClick={({ item }) => navigate("/album/" + item.id)}
            onHold={({ item }) => toggleAlbumContextMenu(item)}
          />
        ) : (
          ""
        )}
        {/* <BoxList
          renderArr={relatingAlbum || []}
          size={150}
          title={"Similar album"}
          onClick={({ item }) => navigate("/album/" + item.id)}
        /> */}
      </ListPanel>
    </div>
  );
}

// /**
//  * Get all albums from track list
//  * @param {Array} list List of tracks
//  * @param {String} id Ignore album with this ID
//  * @returns {Array}
//  */
// function getAlbumsFromTrackList(list = [], id = "") {
//   const appearingAlbum = list
//     ? list.map((a) => {
//         return {
//           ...a.album,
//           cover: a.cover,
//         };
//       })
//     : [];

//   const ids = [];
//   const main = [];

//   appearingAlbum.forEach((a) => {
//     if (ids.includes(a.id) || a.id === id) return;

//     main.push(a);
//     ids.push(a.id);
//   });

//   return main.sort((a) => Math.random() - Math.PI);
// }

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

function CopyrightsInformation({ copyrights = [] }) {
  return (
    <div className="copyrights">
      {copyrights.map((c, i) => (
        <div className="label flex aictr" key={`cinfo-${i}`}>
          {{ C: "©", P: "℗" }[c.type]}
          <span>{c.text}</span>
        </div>
      ))}
    </div>
  );
}
