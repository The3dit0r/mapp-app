import React from "react";
import { Link, useLocation } from "react-router-dom";

import { AiOutlineHome, AiOutlineSearch, AiTwotoneHome } from "react-icons/ai";
import { BiLibrary } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";

const icoSize = 20;

const ico = {
  search: [<AiOutlineSearch size={icoSize} />, <FaSearch size={icoSize - 1} />],
  home: [<AiOutlineHome size={icoSize} />, <AiTwotoneHome size={icoSize} />],
  library: [<BiLibrary size={icoSize} />, <BiLibrary size={icoSize + 1} />],
};

export default function BottomNavBar() {
  const location = useLocation();

  function isCurrent(name) {
    if (location.pathname.includes(name)) {
      return 1;
    }

    return 0;
  }

  return (
    <div className="flex aictr bottom-nav">
      {["home", "search", "library"].map((a) => {
        const cur = isCurrent(a);

        return (
          <Link
            to={`/${a}`}
            style={{
              fontWeight: cur ? "bold" : "",
              textTransform: "capitalize",
            }}
            key={`navigate-${a}`}
          >
            {ico[a][cur]} {a}
          </Link>
        );
      })}
    </div>
  );
}
