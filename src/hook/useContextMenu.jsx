import { useState } from "react";

export default function useContextMenu() {
  const [buttons, setButtons] = useState([]);

  const [cover, setCover] = useState([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [type, setType] = useState("Track");

  const [hidden, toggleHidden] = useState(true);

  function toggleMenu({
    cover = [],
    title = "",
    subtitle = "",
    buttons = [],
    type = "Track",
  }) {
    setCover(Array.isArray(cover) ? cover : []);
    setTitle(title);
    setSubtitle(subtitle);
    setButtons(buttons);
    setType(type);

    toggleHidden(false);
  }

  return [
    { buttons, cover, title, subtitle, hidden, type },
    { toggleHidden, toggleMenu },
  ];
}
