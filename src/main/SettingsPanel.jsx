import { useContext, useEffect, useState } from "react";

import { AiTwotoneSetting, AiOutlineUser } from "react-icons/ai";
import { TbPassword } from "react-icons/tb";
import { RxAvatar } from "react-icons/rx";
import { BiRename } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";

import UserDataContext from "../context/UserDataContext";
import Damn from "../components/Damn";
import { ArtistsDisplay, QueueIcon } from "../UtilityComponent";
import RowItem from "../components/RowItem";
import { storage } from "../utilityFunction";

export default function SettingsPanel() {
  return (
    <div className="main-panel settings">
      <h2
        style={{ backgroundColor: "#1f083b", position: "relative" }}
        className="header"
      >
        <AiTwotoneSetting size={30} /> App settings
      </h2>
      <AccountSettings />
      <QueueAndPlaybackSettings />
    </div>
  );
}

function AccountSettings() {
  const userData = useContext(UserDataContext);
  const { username, name, id } = userData;

  if (!userData.verifyUserLogin()) {
    return "";
  }

  return (
    <div className="section highlight">
      <img
        className="bg-img"
        src={window.location.origin + "/back5.png"}
        alt=""
      />
      <h4 className="flex aictr" style={{ gap: 10 }}>
        <AiOutlineUser size={20} />
        Account settings
      </h4>

      <div className="flex aictr" style={{ gap: 20 }}>
        <div
          className="zum"
          style={{
            backgroundImage:
              "url('https://cdn.discordapp.com/avatars/539784616517566474/cbe2fc58edcd456d967a07b7db2a6f96.webp')",
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundSize: "cover",
          }}
        ></div>
        <div className="info flex jcctr coll">
          <b style={{ fontSize: 20 }}>{name}</b>
          <i>@{username}</i>
        </div>
      </div>

      <div style={{ margin: "20px 0px 10px 0px" }}>
        <div className="option flex aictr zum">
          <BiRename size={30} />
          Change display name
        </div>
        <div className="option flex aictr zum">
          <RxAvatar size={30} />
          Change avatar
        </div>
        <div className="option flex aictr zum">
          <TbPassword size={30} />
          Change password
        </div>
        <hr />
        <div
          className="option flex aictr zum yell"
          onClick={() => {
            storage.setItem("accessToken", "");
            window.location.reload();
          }}
        >
          <FiLogOut size={30} />
          Log out
        </div>
      </div>
    </div>
  );
}

function QueueAndPlaybackSettings() {
  const userData = useContext(UserDataContext);

  const [autoAddTracks, toggleAutoAddTracks] = useState(false);
  const [useRadioInstead, toggleUseRadioInstead] = useState(false);
  const [selectedRadio, selectNewRadio] = useState(null);

  const { playbackHistory } = userData;

  const renderRadio = selectedRadio ??
    playbackHistory[0] ?? {
      title: "Select a radio",
      cover: [],
      artists: [],
    };

  return (
    <div className="section">
      <h3 className="flex aictr" style={{ gap: 10 }}>
        <QueueIcon size={25} />
        Queue and Playback
      </h3>

      <div style={{ margin: "20px 0px 10px 0px" }}>
        <ToggleOption
          buttonTitle="Automatically add tracks after queue is ended"
          explanationWhenTrue="Added tracks to queue after it's ended"
          explanationWhenFalse="Stop playback after reaching the end of queue"
          onInput={(e) => toggleAutoAddTracks(e)}
          value={autoAddTracks}
        />

        <span className={autoAddTracks ? "" : "disabled"}>
          <ToggleOption
            buttonTitle="Start a radio instead of playing recommended tracks"
            explanationWhenTrue="Start a radio after queue ended"
            explanationWhenFalse="Added recommended tracks to queue after it's ended"
            onInput={(e) => toggleUseRadioInstead(e)}
            value={useRadioInstead}
          />

          <div
            className={useRadioInstead ? "" : "disabled"}
            style={{ fontSize: 13 }}
          >
            <h4 style={{ margin: "5px 0px" }}>Current radio: </h4>
            <RowItem
              {...renderRadio}
              subtitle={<ArtistsDisplay artists={renderRadio.artists || []} />}
              style={{
                backgroundColor: "#fff2",
                borderRadius: 10,
              }}
            />
          </div>
        </span>

        <hr style={{ width: "100%", margin: "20px 0px" }} />

        <ToggleOption
          buttonTitle="Auto-skip for unplayable tracks"
          explanationWhenTrue="Skip a track when playback failed"
          explanationWhenFalse="Retry playback, do not skip"
        />
      </div>
    </div>
  );
}

function ToggleOption({
  explanationWhenTrue = "This is a short explanation for when it's enabled",
  explanationWhenFalse = "This is a short explanation for when it's disabled",
  buttonTitle = "This is the toggle button title",
  onInput = () => {},
  value = false,
}) {
  const [active, toggleActive] = useState(false);

  useEffect(() => toggleActive(value), [value]);

  return (
    <div className="toggle flex coll" style={{ gap: 10 }}>
      <div className="flex aictr spbtw">
        <div className="txt">{buttonTitle}</div>
        <div
          className={"btt" + (active ? " active" : "")}
          onClick={() => {
            toggleActive(!active);
            onInput(!active);
          }}
        >
          <div className="lul zum"></div>
        </div>
      </div>
      <div style={{ fontWeight: 400, color: "#ccc" }}>
        <i>{active ? explanationWhenTrue : explanationWhenFalse}</i>
      </div>
    </div>
  );
}
