export default function EmptyScreen({ style = {}, text }) {
  return (
    <div
      className="flex aictr jcctr coll"
      style={{
        width: "calc(100% - 40px)",
        marginTop: 40,
        color: "#fff",
        textAlign: "center",
        padding: 20,
        ...style,
      }}
    >
      <img
        style={{
          width: "min(calc(var(--main-width) - 100px), 200px)",
          filter: "hue-rotate(55deg)",
        }}
        src={window.location.origin + "/empty.png"}
        alt=""
      />
      <h1>404</h1>
      <h2>
        {text ||
          "Can't find what you are looking for, must be those damn unicorns again"}
      </h2>
    </div>
  );
}
