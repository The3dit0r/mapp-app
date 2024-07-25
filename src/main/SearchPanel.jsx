import { useState, useEffect, useContext } from "react";
import SwipeableViews from "react-swipeable-views";
import { useNavigate } from "react-router";
import axios from "axios";

import { AiOutlineSearch, AiOutlineCloseCircle } from "react-icons/ai";

import LoadingScreen from "../components/LoadingScreen";
import EmptyScreen from "../components/EmptyScreen";
import GoTypeSomething from "../components/GoTypeSomething";

import ArtistItem from "../components/ArtistItem";
import RowItem from "../components/RowItem";
import Damn from "../components/Damn";

import { generateData } from "../utilityFunction";
import { ArtistsDisplay } from "../UtilityComponent";

import { storage } from "../utilityFunction";
import QueueContext from "../context/QueueContext";

import { apiUrl } from "../config";

const testData = [generateData(20), generateData(20), generateData(20)];

export default function SearchPanel({
  toggleTrackContextMenu,
  toggleAlbumContextMenu,
  toggleArtistContextMenu,
}) {
  const queueSystem = useContext(QueueContext);

  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [result, setResult] = useState(0);
  const [section, setSection] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const request = { isValid: true };
    const controller = new AbortController();

    async function search(q) {
      setLoading(true);
      const result = await axios.post(
        `${apiUrl}/search`,
        { query: q, limit: 20 },
        { signal: controller.signal }
      );

      if (request.isValid) {
        setResult(result.data);
        result.data.timestamp = new Date().getTime();

        storage.setItem("searchResult", result.data);
      }
      setLoading(false);
    }

    if (!searchTerm.length) return;

    const timeout = setTimeout(() => {
      search(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timeout);
      request.isValid = false;
      controller.abort();
    };
  }, [searchTerm]);

  useEffect(() => {
    const oldQuery = storage.getItem("searchQuery") || "";
    const oldResult = storage.getItem("searchResult") || {};
    const curTime = oldResult?.timestamp || 0;

    setQuery(oldQuery);

    if (Math.abs(curTime - new Date().getTime()) > 300000) {
      setSearchTerm(oldQuery.trim());
    } else {
      setResult(oldResult);
    }
  }, []);

  function handleInput(e) {
    setQuery(e.target.value);
    setSearchTerm(e.target.value.trim());

    storage.setItem("searchQuery", e.target.value);
    // window.location.hash = "#" + e.target.value;
  }

  function getSectionClass(i) {
    return {
      className: "option " + (i === section ? "selected" : ""),
      onClick: () => setSection(i),
    };
  }

  function handlePlay(item) {
    const src = { id: "", title: `"${query}"`, type: "search" };
    queueSystem.playItemsFromSource([item], src, 0);
  }

  return (
    <div className="main-panel search-panel">
      <div className="search-bar flex aictr">
        <AiOutlineSearch size={30} color={"#000"} />
        <input
          onChange={handleInput}
          onInput={handleInput}
          inputMode="search"
          placeholder="What do you want?"
          value={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
        {!(query !== "") || (
          <AiOutlineCloseCircle
            size={25}
            className="zum"
            onClick={() => setQuery("")}
            color="#000"
          />
        )}
      </div>

      {query.length ? (
        <div className="result-filter flex aictr spbtw">
          <button {...getSectionClass(0)}>Tracks</button>
          <button {...getSectionClass(1)}>Albums</button>
          <button {...getSectionClass(2)}>Artists</button>
          <button {...getSectionClass(3)}>Playlists</button>
        </div>
      ) : (
        ""
      )}

      <div className="search-result">
        {!query.trim().length ? (
          <GoTypeSomething />
        ) : loading ? (
          <LoadingScreen />
        ) : (
          <SwipeableViews onChangeIndex={setSection} index={section} laz>
            <Damn height={100}>
              {result["tracks"]?.length ? (
                result["tracks"]
                  .slice(0, 1 + 19 * Number(section === 0))
                  .map((i) => (
                    <RowItem
                      cover={i.cover}
                      title={i.title}
                      subtitle={<ArtistsDisplay artists={i.artists} />}
                      onHold={() => toggleTrackContextMenu(i)}
                      onClick={() => handlePlay(i)}
                      key={`search-${i.id}`}
                    />
                  ))
              ) : (
                <EmptyScreen />
              )}
            </Damn>
            <Damn height={100}>
              {result["albums"]?.length ? (
                result["albums"]
                  .slice(0, 1 + 19 * Number(section === 1))
                  .map((i) => (
                    <RowItem
                      cover={i.cover}
                      title={i.title}
                      subtitle={<ArtistsDisplay artists={i.artists} />}
                      onClick={() => navigate("/album/" + i.id)}
                      onHold={() => toggleAlbumContextMenu(i)}
                      key={`search-${i.id}`}
                    />
                  ))
              ) : (
                <EmptyScreen />
              )}
            </Damn>
            <Damn height={100}>
              {result["artists"]?.length ? (
                result["artists"]
                  .slice(0, 1 + 19 * Number(section === 2))
                  .map((a) => (
                    <ArtistItem
                      {...a}
                      onHold={() => toggleArtistContextMenu(a)}
                      key={`search-${a.id}`}
                    />
                  ))
              ) : (
                <EmptyScreen />
              )}
            </Damn>
            <Damn height={100}>
              {result["playlists"]?.length ? (
                result["playlists"]
                  .slice(0, 1 + 19 * Number(section === 3))
                  .map((i) => (
                    <RowItem
                      cover={i.cover}
                      title={i.title}
                      subtitle={i.track_count + " tracks"}
                      onClick={() => navigate("/playlist/" + i.id)}
                      key={`search-${i.id}`}
                    />
                  ))
              ) : (
                <EmptyScreen />
              )}
            </Damn>
          </SwipeableViews>
        )}
      </div>
    </div>
  );
}
