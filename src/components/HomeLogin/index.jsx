import { useContext, useState } from "react";
import axios from "axios";

import "./index.css";

import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { BsCheckCircle } from "react-icons/bs";
import { FiRadio } from "react-icons/fi";
import { CgCloseO } from "react-icons/cg";

import FancyInput from "../FancyInput";
import LoadingIcon from "../LoadingIcon";
import Damn from "../Damn";

import { generateData, storage } from "../../utilityFunction";

import PopUpContext from "../../context/PopUpContext";

import { apiUrl } from "../../config";

const songCovers = generateData(50).map((item) => item.cover[2].url);
const main = [];
songCovers.forEach((a) => {
  if (main.includes(a)) return;
  main.push(a);
});
let a = 100;

while (a--) {
  main.sort(() => Math.random() - 0.5);
}

export default function HomeLogin({ text = "" }) {
  const [newAccountMode, toggleNewAccountMode] = useState(0);

  const f = { toggleNewAccountMode, text };

  return (
    <div className="home-login">
      <div className="img-row">
        {main.map((cover, index) => {
          return (
            <img alt={index} src={cover} style={{ width: 200, height: 200 }} />
          );
        })}
      </div>
      <div className="dialogue-wrapper flex aictr jcctr">
        {newAccountMode === true ? (
          <CreateNewAccount {...f} />
        ) : newAccountMode === false ? (
          <LogInAccount {...f} />
        ) : (
          <LogInOptions {...f} />
        )}
      </div>
    </div>
  );
}

function LogInOptions({ toggleNewAccountMode, text }) {
  return (
    <div className="dialogue flex aictr jcctr coll">
      <h2>
        {text || (
          <span>
            More <span style={{ color: "#fee39c" }}>AMAZING BEAT</span> is
            waiting for you at the horizon.
          </span>
        )}
      </h2>
      <br />
      <div
        className="button"
        style={{ backgroundColor: "#fee39c" }}
        onClick={() => toggleNewAccountMode(true)}
      >
        Create an account
      </div>
      <h5 style={{ margin: "10px 0px" }}>Already have an account?</h5>
      <div className="button" onClick={() => toggleNewAccountMode(false)}>
        Sign in
      </div>
      <Damn height={40} />
      <i style={{ fontSize: 5 }}>Damn this thing cool as hell bru</i>
    </div>
  );
}

function CreateNewAccount({ toggleNewAccountMode }) {
  const [showPassword, toggleShowPassword] = useState(false);
  const [displaynInput, setDisplaynInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const popUp = useContext(PopUpContext);

  const handleSubmitClick = async ({ setLoading }) => {
    try {
      setLoading(true);

      popUp.setPopPanel({
        title: "Creating new account . . .",
        icon: <LoadingIcon size={29} />,
      });

      const info = (
        await axios.post(`${apiUrl}/signup`, {
          name: displaynInput,
          username: usernameInput,
          password: passwordInput,
        })
      ).data.data;

      setLoading(false);

      popUp.setPopPanel({
        title: "Logged in as " + info.userData.username,
        icon: <BsCheckCircle size={27} />,
        duration: 5e3,
      });

      storage.setItem("accessToken", info.userData.accessToken);
      window.location.reload();
    } catch (err) {
      // console.log(err);
      setLoading(false);

      let errTxt = "";
      if (err.code === "ERR_NETWORK") {
        errTxt = "Failed to reach server, please try again later!";
      } else {
        errTxt = "Failed - " + err.response.data.message;
      }

      popUp.setPopPanel({ title: errTxt, icon: <CgCloseO size={29} /> });
    }
  };

  return (
    <div
      className="dialogue flex aictr jcctr coll"
      style={{ backgroundPosition: "80% 60%" }}
    >
      <Logo />
      <h2>SIGN UP</h2>
      <FancyInput
        title="Display name"
        onInput={(e) => setDisplaynInput(e.target.value)}
        value={displaynInput}
        placeholder="Ex: Hamburger Da King (8 - 64 characters)"
        maxLength={64}
      />
      <FancyInput
        title="Username"
        placeholder="Username (8 - 24 characters)"
        onInput={(e) => setUsernameInput(e.target.value)}
        value={usernameInput}
        maxLength={32}
      />
      <FancyInput
        title={
          <PasswordTitle
            tgg={() => toggleShowPassword(!showPassword)}
            show={showPassword}
          />
        }
        placeholder="Password (8 - 256 characters)"
        onInput={(e) => setPasswordInput(e.target.value)}
        type={showPassword || "password"}
        value={passwordInput}
        maxLength={256}
      />
      <br />
      <i style={{ fontSize: 10, marginBottom: 10 }}>
        By clicking Submit, you agree to MY <b>Terms</b> and{" "}
        <b>Privacy Policy</b>.
      </i>
      <SubmitButton onClick={handleSubmitClick} />
      <h5>
        Already have an account?{" "}
        <span
          style={{ color: "#fee39c" }}
          onClick={() => toggleNewAccountMode(false)}
        >
          Log in here
        </span>
      </h5>
    </div>
  );
}

function LogInAccount({ toggleNewAccountMode }) {
  const [showPassword, toggleShowPassword] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const popUp = useContext(PopUpContext);

  const handleSubmitButton = async ({ setLoading }) => {
    try {
      setLoading(true);

      popUp.setPopPanel({
        title: "Logging in . . .",
        icon: <LoadingIcon size={29} />,
      });

      const info = (
        await axios.post(`${apiUrl}/signin`, {
          username: usernameInput,
          password: passwordInput,
        })
      ).data.data;

      // console.log(info.token.access_token);

      setLoading(false);

      popUp.setPopPanel({
        title: "Logged in as " + info.userData.username,
        icon: <BsCheckCircle size={27} />,
        duration: 5e3,
      });

      storage.setItem("accessToken", info.token.access_token);
      window.location.reload();
    } catch (err) {
      // console.log(err);
      setLoading(false);

      let errTxt = "";
      if (err.code === "ERR_NETWORK") {
        errTxt = "Failed to reach server, please try again later!";
      } else {
        errTxt = "Falied - " + err.response.data.message;
      }

      popUp.setPopPanel({ title: errTxt, icon: <CgCloseO size={29} /> });
    }
  };

  return (
    <div
      className="dialogue flex aictr jcctr coll"
      style={{ backgroundPosition: "40% 100%" }}
    >
      <Logo />
      <h2>SIGN IN</h2>
      <FancyInput
        title="Username"
        placeholder="Username (8 - 24 characters)"
        onInput={(e) => setUsernameInput(e.target.value)}
        value={usernameInput}
        maxLength={32}
      />
      <FancyInput
        title={
          <PasswordTitle
            tgg={() => toggleShowPassword(!showPassword)}
            show={showPassword}
          />
        }
        placeholder="Password (8 - 24 characters)"
        onInput={(e) => setPasswordInput(e.target.value)}
        type={showPassword || "password"}
        value={passwordInput}
        maxLength={256}
      />
      <br />
      <SubmitButton onClick={handleSubmitButton} />
      <h5>
        New to Spotifake?{" "}
        <span
          style={{ color: "#fee39c" }}
          onClick={() => toggleNewAccountMode(true)}
        >
          Create an account
        </span>
      </h5>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex aictr jcctr" style={{ gap: 10 }}>
      <FiRadio size={45} />
      <h2>SPOTIFAKE</h2>
    </div>
  );
}

function SubmitButton({ onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = (e) => {
    if (loading) return;
    onClick({ e, setLoading, loading });
  };

  return (
    <div
      style={{ backgroundColor: "#fee39c", width: 60, height: 30 }}
      className="button"
      onClick={handleClick}
    >
      {loading ? <LoadingIcon size={45} /> : "Submit"}
    </div>
  );
}

function PasswordTitle({ show = false, tgg = () => {} }) {
  return (
    <div className="flex aictr spbtw" onClick={tgg}>
      <span>Password</span>
      {show ? (
        <AiFillEyeInvisible className="zum" size={20} />
      ) : (
        <AiFillEye className="zum" size={20} />
      )}
    </div>
  );
}
