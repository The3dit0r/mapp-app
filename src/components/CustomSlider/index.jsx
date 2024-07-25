import { useState } from "react";

import "./index.css";

let timeout = 0;

export default function CustomSlider({
  style = {},
  height = "5px",
  className = "",
  value = undefined,
  width = "200px",
  onInputStart = () => {},
  onInputEnd = () => {},
  onInput = () => {},

  step = 1,
  min = 0,
  max = 100,
  id = "",
}) {
  const [val, setValue] = useState(0);
  const [changing, toggleChanging] = useState(false);

  const handleOnInput = (e) => {
    clearTimeout(timeout);
    setValue(e.target.value);
    if (typeof onInput === "function") onInput(e);
  };

  const handleDragStart = (e) => {
    toggleChanging(true);
    if (typeof onInputStart === "function") onInputStart(e);
  };

  const handleDragEnd = (e) => {
    if (typeof onInputEnd === "function") onInputEnd(e);
    timeout = setTimeout(() => toggleChanging(false), 50);
  };

  const getValue = () => (isNaN(value) || changing ? val : value);

  return (
    <input
      id={id}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
      onInput={handleOnInput}
      onChange={handleOnInput}
      min={min}
      max={max}
      type="range"
      className={`default-slider ${className ? className : ""}`}
      style={{
        width: width,
        ...style,
        "--pColor": "#ffffff",
        "--height": height ? height : "3px",
        "--value": `${(getValue() / max || 1 / 1e16) * 100}%`,
      }}
      step={step ? step : 1}
      value={getValue()}
    />
  );
}
