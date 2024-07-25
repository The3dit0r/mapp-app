import "./index.css";

export default function BoxItem({
  cover = [],
  subtitle = "",
  size = 160,
  title = "",
  onClick = () => {},
  onHold = () => {},
  className = "",
}) {
  const renderCover = cover.length > 1 ? cover.slice(1, 3) : cover;

  const coversUrl = [
    ...renderCover.map((a) => `url('${a.url}')`),
    "url('cover.png')",
  ].join(", ");

  return (
    <div
      className={"box-item " + className}
      style={{ "--size": size + "px" }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();

        onHold();
      }}
    >
      <div className="cover-wrapper flex aictr jcctr">
        <div className="cover" style={{ backgroundImage: coversUrl }}></div>
      </div>
      <div className="info">
        <div className="title line-ellipsis">{title}</div>
        <div className="subtitle line-ellipsis">{subtitle}</div>
      </div>
    </div>
  );
}
