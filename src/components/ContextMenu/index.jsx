import React, { useEffect, useMemo, useState } from "react";

import "./index.css";
import Damn from "../Damn";

import { AiFillInfoCircle } from "react-icons/ai";

// const host = window.location.host;

// const testOptions = [
//   "Play now",
//   "Add to queue",
//   "Add to top",
//   "Play track's radio",
//   "Enhance queue",
//   "Goto album's page",
//   "Goto artist's page",
//   "Goto radio's page",
// ];

const ani = {
  animationName: "fly-in",
  animationDuration: "4s",
};

export default function ContextMenu({
  hidden,
  toggleHidden,
  cover = [],
  title,
  subtitle,
  buttons = [],
  type = "Track",
}) {
  const [animationKey, setAnimationKey] = useState(0);
  let clss = "context-menu";

  useEffect(() => {
    const target = document.getElementById("main-content-context-menu");

    if (!target || hidden) return;
    target.scrollTop = 0;
    setAnimationKey((prevKey) => prevKey + 1);
  }, [hidden]);

  if (hidden) {
    clss += " hidden";
  }

  const coversUrl = [
    ...cover.map((a) => `url('${a.url}')`),
    "url('cover.png')",
  ].join(", ");

  const renderArr = buttons;

  return (
    <div className={clss} onClick={() => toggleHidden(true)}>
      <div className="main" id="main-content-context-menu">
        <Damn height={150} />
        <div className="header">{type}</div>
        <div className="cover-wrapper flex aictr jcctr" style={{ ani }}>
          <div
            className={"cover " + type.toLowerCase()}
            style={{ backgroundImage: coversUrl }}
          ></div>
        </div>
        <div className="info" style={{ ani }}>
          <div className="title">{title}</div>
          <div className="subtitle">{subtitle}</div>
        </div>
        <div className="options" key={animationKey}>
          {renderArr.map((o, i) => {
            if (!o) return "";

            return (
              <div
                key={`context-option-${i}`}
                className="option"
                style={{
                  animationName: "fly-in",
                  animationDuration: 500 + Math.min(1000, (i + 1) * 200) + "ms",
                }}
                onClick={o.onClick}
              >
                {o.icon || <AiFillInfoCircle size={35} />}
                {o.text}
              </div>
            );
          })}
        </div>
        <Damn height={100} />
      </div>

      <div className="fader"></div>
    </div>
  );
}
