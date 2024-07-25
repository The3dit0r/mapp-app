import { useEffect, useState } from "react";

import "./index.css";

export default function FancyInput({
  title = "",
  placeholder = "",
  onInput = () => {},
  value = "",
  maxLength = 30,
  type = "text",
}) {
  const [innerValue, setInnerValue] = useState("");

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  function handleInput(e) {
    setInnerValue(e.target.value);
    onInput(e);
  }

  return (
    <div className="special-fancy-input">
      <div className="title">{title}</div>
      <input
        placeholder={placeholder}
        onChange={handleInput}
        onInput={handleInput}
        value={value || innerValue}
        maxLength={maxLength}
        type={type}
      />
    </div>
  );
}
