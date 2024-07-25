import { useState, useEffect } from "react";

//? Icons import
import { BsCheckSquare, BsSquare, BsArrowDownShort } from "react-icons/bs";
import { MdExpandMore, MdClear } from "react-icons/md";
import { FaPause, FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";

function TabHeader({ text = "", style = {}, right = "" }) {
  return (
    <div className="tab-header" style={style}>
      <div className="flex aictr spbtw">
        <h1>{text}</h1>
        {right}
      </div>
      <hr />
    </div>
  );
}

function GetColon({ text = "" }) {
  return (
    <span>
      <span style={{ marginRight: 50 }}>:</span>
      {text}
    </span>
  );
}

function SectionBox(props) {
  const border = props.border !== undefined ? props.border : true;
  let className = "section-box ";

  if (!border) {
    className += "no-border ";
  }

  return (
    <div
      className={className + (props.className || "")}
      style={{
        ...props.style,
      }}
    >
      <h1 className="special-header">{props.title || ""}</h1>
      {props.children}
    </div>
  );
}

function SelectBox({
  text = "",
  style = {},
  valueBoxWidth = "300px",
  option = [],
  onInput = () => {},
  value,
}) {
  const [choice, setChoice] = useState(isNaN(value) ? -1 : value);
  const [shown, showPopUp] = useState(0);

  useEffect(() => {
    if (shown) {
      const t = setTimeout(
        () => (document.body.onclick = () => showPopUp(false))
      );
      return () => {
        document.body.onclick = () => {};
        clearTimeout(t);
      };
    }
  }, [shown]);

  useEffect(() => {
    setChoice(isNaN(value) ? -1 : value);
  }, [value]);

  let className = "default-select flex aictr spbtw";
  if (shown) className += " active";

  return (
    <div className="flex aictr spbtw" style={style}>
      <strong style={{ fontSize: 20 }}>{text}</strong>
      <div
        className={className}
        style={{
          "--width": valueBoxWidth,
        }}
        onClick={(e) => {
          showPopUp(!shown);
        }}
      >
        <div className="text">
          {choice > -1 ? option[choice]?.text : "Select a value"}
        </div>
        <MdExpandMore size={30} className="zoom" />
        {shown ? (
          <div className="pop-up">
            {option.map((a, i) => (
              <div
                className={"option " + (choice === i ? "active" : "")}
                onClick={(e) => {
                  setChoice(i);
                  showPopUp(0);

                  if (typeof onInput === "function") {
                    onInput({
                      ...e,
                      target: {
                        value: a.value,
                      },
                    });
                  }
                }}
              >
                {a.text}
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

function PlayButton({
  playing = false,
  size = 60,
  className = "",
  onClick = () => {},
  style = {},
}) {
  return (
    <div
      className={className + " flex aictr jcctr zoom"}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#fee39c",
        ...style,
        paddingTop: -10,
        fontSize: Math.max(0, 23 * (size / 55)),
        color: "#2a0d49",
      }}
      onClick={onClick}
    >
      {playing ? <FaPause /> : <FaPlay />}
    </div>
  );
}

function TextBox({
  width = 200,
  placeholder = "",
  onInput = () => {},
  onBlur = () => {},
  value = undefined,
  icon = "",
  maxLength = 0,
  disabled = false,
  disabledValue = "",
}) {
  const [val, setVal] = useState("");
  const [focus, setFocus] = useState(false);

  const handleInput = (e) => {
    if (disabled) return;

    setVal(e.target.value);
    if (typeof onInput === "function") onInput(e);
  };

  const handleFocus = () => setFocus(true);
  const handleBlur = (e) => {
    onBlur(e);
    setFocus(false);
  };

  const mv = ["number", "string"].includes(typeof value) ? value : val;
  let className = "default-input flex aictr";

  if (disabled) {
    className += " disabled";
  } else if (focus) {
    className += " focus";
  }

  return (
    <div className={className} style={{ width: width }}>
      {icon}
      <input
        placeholder={placeholder}
        onInput={handleInput}
        onChange={handleInput}
        value={disabled ? disabledValue || mv : mv}
        maxLength={maxLength}
        disabled={disabled}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      {mv.length && !disabled ? (
        <MdClear
          size={30}
          className="zoom"
          onClick={() => {
            setVal("");
            if (typeof onInput === "function")
              onInput({ target: { value: "" } });
          }}
        />
      ) : (
        ""
      )}
    </div>
  );
}

function ArtistsDisplay({ artists = [], limit = 0, className = "" }) {
  const renderArr = limit > 0 ? artists.slice(0, limit) : artists;
  const remain = artists.length - renderArr.length;

  return (
    <div className={"artists " + className}>
      {renderArr.map((a, i) => {
        return (
          <span key={`artist-display-${i}-${a.id}`}>
            <span>{a.username}</span>
            {i + 1 < renderArr.length ? ", " : ""}
          </span>
        );
      })}
      {remain > 0 ? <span> and {remain} other artists</span> : ""}
    </div>
  );
}

function ArtistsDisplayLink({
  artists = [],
  limit = 0,
  className = "",
  onClick = () => {},
}) {
  const renderArr = limit > 0 ? artists.slice(0, limit) : artists;
  const remain = artists.length - renderArr.length;

  return (
    <div className={"artists " + className}>
      {renderArr.map((a, i) => {
        return (
          <span key={`artist-display-${i}-${a.id}`}>
            <Link
              to={`/artist/${a.id}`}
              onClick={(e) => {
                // e.stopPropagation();
                onClick(e);
              }}
            >
              {a.username}
            </Link>
            {i + 1 < renderArr.length ? ", " : ""}
          </span>
        );
      })}
      {remain > 0 ? <span> and {remain} other artists</span> : ""}
    </div>
  );
}

function QueueIcon({
  size = 20,
  className = "",
  onClick = () => {},
  color = "#ffffff",
}) {
  return (
    <svg
      onClick={onClick}
      className={className}
      fontSize={size}
      stroke={color}
      fill="none"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
      ></path>
    </svg>
  );
}

function Option({
  text = "",
  value,
  placeholder = "",
  valueBoxWidth = "300px",
  maxLength = 0,
  icon = "",
  onInput = () => {},
  onBlur = () => {},
  checkbox = false,
  disabledValue = "",
  style = {},
}) {
  const [active, toggle] = useState(false);

  return (
    <div className="flex aictr spbtw" style={{ margin: "10px 0px", ...style }}>
      <strong style={{ fontSize: 20 }}>{text}</strong>
      <div
        className="flex aictr spbtw"
        style={{ width: valueBoxWidth, gap: 10 }}
      >
        {checkbox ? (
          <div
            style={{ fontSize: 48 }}
            className="flex aictr zoom"
            onClick={() => toggle(!active)}
          >
            {active ? <BsCheckSquare /> : <BsSquare />}
          </div>
        ) : (
          ""
        )}
        <TextBox
          disabled={!active && checkbox}
          disabledValue={disabledValue}
          value={value}
          width={"100%"}
          placeholder={placeholder}
          icon={icon}
          maxLength={maxLength || 255}
          onInput={onInput}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}

function DownloadButton({
  size = 45,
  value = 50,
  icon = <BsArrowDownShort />,
}) {
  return (
    <div
      style={{
        background: `conic-gradient(#1dea79, #1dea79 ${value}%, #0008 ${value}%, #0008)`,
        width: size,
        height: size,
        marginTop: 5,
        borderRadius: size / 2,
        overflow: "hidden",
      }}
      className="flex aictr jcctr zoom"
    >
      <div
        style={{
          background: "#232425",
          width: "calc(100% - 5px)",
          height: "calc(100% - 5px)",
          borderRadius: size / 2,
          fontSize: size - 10,
        }}
        className="flex aictr jcctr"
      >
        {icon}
      </div>
    </div>
  );
}

export {
  TabHeader,
  GetColon,
  SectionBox,
  SelectBox,
  PlayButton,
  TextBox,
  ArtistsDisplay,
  ArtistsDisplayLink,
  Option,
  DownloadButton,
  QueueIcon,
};
