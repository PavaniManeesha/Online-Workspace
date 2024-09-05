import React, { useState } from "react";
import SvgIcon from "../../../Components/Common/Component/SvgIcon";

const Searchbar = ({ onclick }) => {
  const [searchresponsive, setSearchresponsive] = useState(false);
  const SeacrhResposive = (searchresponsive) => {
    if (searchresponsive) {
      setSearchresponsive(!searchresponsive);
      document.querySelector(".search-full").classList.add("open");
      document.querySelector(".more_lang").classList.remove("active");
    } else {
      setSearchresponsive(!searchresponsive);
      document.querySelector(".search-full").classList.remove("open");
    }
  };

  return (
    <li>
      <span className="header-search">
        <SvgIcon iconId="stroke-chat" onClick={() => onclick()} />
      </span>
    </li>
  );
};

export default Searchbar;
