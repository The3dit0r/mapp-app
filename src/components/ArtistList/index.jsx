import axios from "axios";
import { useEffect, useState } from "react";
import ArtistItem from "../ArtistItem";

import { apiUrl } from "../../config";

export default function ArtistList({
  artists = [],
  maxDisplay = 10,
  onHold = () => {},
  toggle,
}) {
  const [renderArr, setRenderArr] = useState([]);
  const [showAll, toggleShowAll] = useState(false);

  const differentiateString = artists
    .sort((a, b) => (a > b ? 1 : -1))
    .join("-");

  useEffect(() => {
    const request = { valid: true };
    const controller = new AbortController();

    async function getArtistsGeneral() {
      const result = await axios.post(
        `${apiUrl}/artists`,
        { artists: artists },
        { signal: controller.signal }
      );

      if (request.valid) {
        setRenderArr(result.data.items);
      }
    }

    getArtistsGeneral();

    return () => {
      request.valid = false;
      controller.abort();
    };

    // eslint-disable-next-line
  }, [differentiateString]);

  const sliceIndex = showAll ? renderArr.length : maxDisplay;

  return (
    <div className="appeared-artists">
      <h4 className="header">Appearing artists</h4>
      {renderArr.slice(0, sliceIndex).map((artist, index) => (
        <ArtistItem
          {...artist}
          onHold={() => onHold(artist)}
          key={`artist-list-${artist.id}-${index}`}
        />
      ))}
      <h4
        onClick={() => toggleShowAll(!showAll)}
        className="zum"
        style={{
          "--active-scale": 0.97,
          margin: "20px 0px 0px 10px",
          display: renderArr.length > maxDisplay ? "block" : "none",
        }}
      >
        {showAll
          ? "Hide list"
          : `Show ${renderArr.length - maxDisplay} more artists`}
      </h4>
    </div>
  );
}
