import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";

import MoreElaborateLoadingScreen from "../components/MoreElaborateLoadingScreen";
import ListPanel from "../components/ListPanel";
import BoxList from "../components/BoxList";
import ArtistSwipePanel from "../components/ArtistSwipePanel";

import UserDataContext, { SaveButton } from "../context/UserDataContext";

import { apiUrl } from "../config";
import RowItem from "../components/RowItem";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";

export default function ArtistPanel({
  toggleTrackContextMenu,
  toggleArtistContextMenu,
  toggleAlbumContextMenu,
}) {
  const [relatedArtists, setRelatedArtists] = useState(0);
  const [generalData, setGeneralData] = useState(0);
  const [famousTrack, setFamousTrack] = useState(0);
  const [discography, setDiscography] = useState(0);

  const navigate = useNavigate();

  const { id } = useParams();

  const userData = useContext(UserDataContext);

  useEffect(() => {
    const request = { valid: true };
    const controller = new AbortController();

    async function getGeneral() {
      const results = (
        await axios.get(`${apiUrl}/artist/${id}/general`, {
          signal: controller.signal,
        })
      ).data;

      if (request.valid) setGeneralData(results.data);
    }

    async function getTopTracks() {
      const results = (
        await axios.get(`${apiUrl}/artist/${id}/top_tracks`, {
          signal: controller.signal,
        })
      ).data.data.items;

      if (request.valid) setFamousTrack(results);
    }

    async function getArtistAlbums() {
      // if (id === "0LyfQWJT6nXafLPZqxe9Of") return;

      const results = (
        await axios.get(`${apiUrl}/artist/${id}/released?limit=10`, {
          signal: controller.signal,
        })
      ).data.data;

      if (request.valid) {
        setDiscography(results.items);
      }
    }

    async function getRelatedArtists() {
      const results = (
        await axios.get(`${apiUrl}/artist/${id}/related_artists`, {
          signal: controller.signal,
        })
      ).data;

      if (request.valid) {
        setRelatedArtists(results.data.items);
      }
    }

    if (id === generalData?.id) return;
    setGeneralData(0);
    setFamousTrack(0);
    setDiscography(0);
    setRelatedArtists(0);

    getGeneral();
    getTopTracks();
    getArtistAlbums();
    getRelatedArtists();

    return () => {
      request.valid = false;
      controller.abort();
    };

    //eslint-disable-next-line
  }, [id]);

  if (!generalData) {
    return (
      <div className="main-panel">
        <MoreElaborateLoadingScreen />
      </div>
    );
  }

  const {
    images = [],
    name = "",
    type = "artist",
    followers = { total: 0 },
  } = generalData;

  const savedTracks = userData.savedItems.getType("tracks");
  const fromArtist = savedTracks.filter(({ artists = [] }) => {
    return artists.map((a) => a.id).includes(id);
  });

  return (
    <div className="main-panel">
      <ListPanel
        cover={images}
        title={name}
        subtitle={followers.total.toLocaleString() + " followers"}
        type="Artist"
        renderArr={famousTrack || []}
        isArtist={true}
        id={id}
        //

        showItemCover={true}
        toggleTrackContextMenu={toggleTrackContextMenu}
        toggleListContextMenu={() =>
          toggleArtistContextMenu(generalData, famousTrack)
        }
        favBtt={<SaveButton type="artists" item={generalData} size={32} />}
        //
        upperPart={
          <div
            style={{ fontSize: 12, display: fromArtist.length ? "" : "none" }}
          >
            <RowItem
              title={`You have ${fromArtist.length} favorite tracks`}
              subtitle={"by " + name}
              cover={[{ url: window.location.origin + "/rnqa7yhv4il71.png" }]}
              onClick={() =>
                navigate(
                  `/favorite?filter_id=${id}&cover_url=${
                    images.length ? images[0].url.split("image/")[1] : ""
                  }`
                )
              }
              style={{ padding: "0px 20px" }}
            />
          </div>
        }
      >
        <BoxList
          size={150}
          title={
            <div className="flex aictr spbtw">
              Released albums
              <Link className="flex aictr zum" to={"/artist_albums/" + id}>
                <BsArrowRight size={25} style={{ marginRight: 20 }} />
              </Link>
            </div>
          }
          renderArr={discography || []}
          onClick={({ item }) => navigate("/album/" + item.id)}
          onHold={({ item }) => toggleAlbumContextMenu(item)}
        />

        <ArtistSwipePanel
          artists={relatedArtists}
          onHold={toggleArtistContextMenu}
        />
      </ListPanel>
    </div>
  );
}
