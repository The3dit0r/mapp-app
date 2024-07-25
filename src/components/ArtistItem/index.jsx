import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import { useNavigate } from "react-router";

// const testUrl =
//   "https://yt3.googleusercontent.com/ytc/AGIKgqOLSVl9XaK-3K-ncoKn4h8pqLNwv6UosaT6VUCeuw=s900-c-k-c0x00ffffff-no-rj";

const img = "/noavatar.png";

const cover = window.location.origin + "/noavatar.png";

export default function ArtistItem({
  id = "",
  name = "",
  followers = {
    total: -1,
  },
  images = [],
  onHold = () => {},
}) {
  const navigate = useNavigate();
  // const [artistData, setArtistData] = useState({
  //   id: "",
  //   name: "",
  //   followers: -1,
  //   avatarUrl: img,
  // });

  // useEffect(() => {
  //   const request = { valid: true };

  //   async function getArtistDetail() {
  //     try {
  //       const result = (
  //         await axios.get(`${apiUrl}/artist/${id}/general`)
  //       ).data.data;

  //       if (request.valid) {
  //         setArtistData({
  //           id: result.id,
  //           name: result.name,
  //           followers: result.followers.total,
  //           avatarUrl: result.images[2]?.url || img,
  //         });
  //       }
  //     } catch (err) {
  //       setArtistData({
  //         name: "Unknown artist",
  //         followers: -1,
  //         avatarUrl: img,
  //         id: "",
  //       });
  //     }
  //   }

  //   if (id.length !== 22 || artistData.id === id) return;

  //   getArtistDetail();

  //   return () => {
  //     request.valid = false;
  //   };
  // }, [id, artistData.id]);

  const coversUrl = [
    ...images.map((a) => `url('${a.url}')`),
    `url('${cover}')`,
  ].join(", ");

  return (
    <div
      className="artist-item"
      onClick={() => navigate(`/artist/${id}`)}
      onContextMenu={(e) => {
        e.preventDefault();
        onHold();
      }}
    >
      <div className="cover-wrapper">
        <div
          className="cover"
          style={{
            backgroundImage: coversUrl,
          }}
        ></div>
      </div>

      <div className="info">
        <div className="username title">{name}</div>
        {followers.total > -1 ? (
          <div className="followers subtitle">
            {followers.total.toLocaleString()} followers
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
