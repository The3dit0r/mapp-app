import { useState } from "react";

let timeoutVar = 0;

export default function usePopUp() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("");
  const [onclick, setBttFunc] = useState(() => {});

  const [isToggled, togglePanel] = useState(false);

  const setPopPanel = ({
    title = "",
    subtitle = "",
    onclick = () => {},
    icon = "",
    duration = 3e3,
  }) => {
    setSubtitle(subtitle);
    setBttFunc(onclick);
    setTitle(title);
    setIcon(icon);

    if (timeoutVar) {
      clearTimeout(timeoutVar);
    }

    togglePanel(true);
    timeoutVar = setTimeout(() => {
      togglePanel(false);
      timeoutVar = 0;
    }, duration);
  };

  return [
    { title, subtitle, onclick, isToggled, icon },
    { togglePanel, setTitle, setSubtitle, setBttFunc, setPopPanel },
  ];
}
