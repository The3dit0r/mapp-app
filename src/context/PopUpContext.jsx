import { createContext, useState } from "react";
import PopPanel from "../components/PopPanel";

let timeoutVar = 0;

const PopUpContext = createContext();

export function PopUpProvider({ children }) {
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

  const popUpData = { title, subtitle, onclick, isToggled, icon, setPopPanel };
  // { togglePanel, setTitle, setSubtitle, setBttFunc, setPopPanel },

  return (
    <PopUpContext.Provider value={popUpData}>
      {children}
      <PopPanel {...popUpData} />
    </PopUpContext.Provider>
  );
}

export default PopUpContext;
