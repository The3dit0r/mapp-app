import { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate, useParams } from "react-router";

import { apiUrl } from "../config";
import MoreElaborateLoadingScreen from "../components/MoreElaborateLoadingScreen";
import RowItem from "../components/RowItem";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function ArtistAlbums({ toggleAlbumContextMenu }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [discography, setDiscography] = useState([]);

  const [loading, setLoading] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const request = { valid: true };

    // async function getGeneral() {
    //   const results = (
    //     await axios.get(`${apiUrl}/artist/${id}/general`, {
    //       signal: controller.signal,
    //     })
    //   ).data;

    //   if (request.valid) setGeneralData(results.data);
    // }

    async function getDiscography() {
      const results = (
        await axios.get(`${apiUrl}/artist/${id}/released?limit=100`, {
          signal: controller.signal,
        })
      ).data.data;

      if (request.valid) {
        setDiscography(results.items);
      }

      setLoading(0);
    }

    setLoading(1);
    getDiscography();

    return () => {
      request.valid = false;
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="main-panel">
        <MoreElaborateLoadingScreen />
      </div>
    );
  }

  const recent = discography.filter((a) => {
    const release_date = new Date(a.release_date).getTime();
    const current_date = new Date().getTime();

    if (current_date - release_date < 2_419_200_000) {
      return true;
    }

    return false;
  });

  const recentIDs = recent.map((a) => a.id);

  const filterFunc = (type) => (a) =>
    a.type === type && !recentIDs.includes(a.id);

  const albums = discography.filter(filterFunc("album"));
  const singles = discography.filter(filterFunc("single"));

  const f = { toggleAlbumContextMenu };

  return (
    <div className="main-panel" style={{ overflow: "auto" }}>
      <div
        className="header flex aictr spbtw"
        style={{
          background: "linear-gradient(#481785 20%, #0000)",
        }}
      >
        <AiOutlineArrowLeft
          className="zum"
          onClick={() => navigate("/artist/" + id)}
        />
        <b style={{ fontSize: 18 }}>Released album</b>
        <AiOutlineArrowLeft opacity={0} />
      </div>
      <Container title="Recently released" arr={recent} {...f} />
      <Container title="Albums" arr={albums} {...f} />
      <Container title="Singles" arr={singles} {...f} />
    </div>
  );
}

function Container({ arr = [], title = "", toggleAlbumContextMenu }) {
  const navigate = useNavigate();

  const renderFunc = (item) => {
    const release_date = new Date(item.release_date);

    return (
      <RowItem
        height="80px"
        cover={item.cover}
        title={item.title}
        subtitle={release_date.getFullYear()}
        onClick={() => navigate("/album/" + item.id)}
        onHold={() => toggleAlbumContextMenu(item, [])}
      />
    );
  };

  if (!arr.length) return "";

  return (
    <div className="artist-albums-container">
      <b>{title}</b>
      {arr.map(renderFunc)}
    </div>
  );
}
