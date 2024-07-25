import React from "react";

import "./index.css";

// import { FiMoreVertical } from "react-icons/fi";
const noCover = window.location.origin + "/back.png";

export default function RowItem({
  cover = [""],
  title = "",
  subtitle = "",
  onClick = (e) => {},
  onHold = (e) => {},
  showCover = true,
  index = "",
  height = "",
  style = {},
  other = "",
  loading = false,
  className = "",
}) {
  const renderCover = cover.length > 1 ? cover.slice(2, 3) : cover;

  const coversUrl = showCover
    ? [...renderCover.map((a) => `url('${a.url}')`), `url('${noCover}')`].join(
        ", "
      )
    : "";

  function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    onHold(e);
  }

  function handleClick(e) {
    onClick(e);
  }

  if (loading) {
    return (
      <div className="row-item load" style={{ "--height": height, ...style }}>
        <div style={{ width: 10 }}></div>
        <div className="cover an"></div>
        <div className="inf">
          <div className="title an"></div>
          <div className="subtitle an"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={(className + " row-item").trim()}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      style={{ "--height": height, ...style }}
    >
      {showCover ? (
        <div className="flex aictr" style={{ gap: 5 }}>
          <div className="index flex aictr">{index}</div>

          <div
            className="cover"
            style={{ backgroundImage: coversUrl, backgroundSize: "cover" }}
          ></div>
        </div>
      ) : (
        <div className="index flex aictr">{index}</div>
      )}
      <div className="info line-ellipsis">
        <div className="title">{title}</div>
        <div className="subtitle" style={{ color: "#fff" }}>
          {subtitle}
        </div>
      </div>
      <div>{other}</div>
    </div>
  );
}
