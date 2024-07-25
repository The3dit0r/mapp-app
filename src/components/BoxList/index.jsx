import "./index.css";

import BoxItem from "../BoxItem";
import { ArtistsDisplay } from "../../UtilityComponent";

export default function BoxList({
  renderArr = [],
  size = 160,
  title = "Box List",
  renderFunc = null,
  onClick = ({ e, item, index }) => {},
  onHold = ({ e, item, index }) => {},
}) {
  const defaultRenderFunc = (item, index) => {
    const { title, artists, cover } = item || {};

    return (
      <BoxItem
        title={title}
        subtitle={<ArtistsDisplay artists={artists} />}
        cover={cover}
        size={size}
        onClick={(e) => onClick({ e, item, index })}
        onHold={(e) => onHold({ e, item, index })}
      />
    );
  };

  return (
    <div className="box-list" style={{ height: size + 60, fontSize: 12 }}>
      <div className="title header">{title}</div>
      <div className="container">
        {renderArr.map(
          renderFunc
            ? (item, index) =>
                renderFunc({ item, index, onClick, onHold, size })
            : defaultRenderFunc
        )}
      </div>
    </div>
  );
}
