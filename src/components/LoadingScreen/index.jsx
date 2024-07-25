import React from "react";

export default function LoadingScreen() {
  return (
    <div
      style={{
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "80px",
        width: "100%",
        height: "100%",
        filter: "brightness(1e5)",
      }}
      className="flex aictr jcctr loading"
    ></div>
  );
}
