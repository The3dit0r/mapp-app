import { useState } from "react";
import Damn from "../Damn";

import SwipeableViews from "react-swipeable-views";
import ArtistItem from "../ArtistItem";

export default function ArtistSwipePanel({ artists = [], onHold = () => {} }) {
  const [page, setPage] = useState(0);

  if (!Array.isArray(artists)) return "";
  const list = divideArrayIntoSections(artists, 5);

  return (
    <div className="appeared-artists" style={{ padding: "20px 0px" }}>
      <h3
        className="header flex aictr spbtw"
        style={{ margin: "0px 15px", fontSize: 18 }}
      >
        Similar artists
        <div className="flex aictr dots">
          {list.map((_, i) => {
            const c = {
              className: "dot" + (i <= page ? " on" : ""),
              onClick: () => setPage(i),
            };
            return <div {...c}>&bull;</div>;
          })}
        </div>
      </h3>
      <Damn height={20} />
      <SwipeableViews onChangeIndex={(i) => setPage(i)} index={page}>
        {list.map((arr) => {
          return (
            <div>
              {arr.map((artist) => (
                <ArtistItem {...artist} onHold={() => onHold(artist)} />
              ))}
            </div>
          );
        })}
      </SwipeableViews>
    </div>
  );
}

function divideArrayIntoSections(arr = [], sectionSize = 30) {
  const numSections = Math.ceil(arr.length / sectionSize);

  return Array.from({ length: numSections }, (_, i) =>
    arr.slice(i * sectionSize, (i + 1) * sectionSize)
  );
}
