import { FcSearch } from "react-icons/fc";

export default function GoTypeSomething() {
  return (
    <div
      className="flex aictr coll"
      style={{
        width: "calc(100% - 60px)",
        padding: "200px 30px 0px 30px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize: 140,
          filter: "hue-rotate(70deg) drop-shadow(5px 4px 21px #0002)",
        }}
      >
        <FcSearch />
      </span>
      <h2 style={{ fontSize: 20, color: "#fff" }}>
        Start searching by typing into the search bar, pretty neat huh?
      </h2>
    </div>
  );
}
