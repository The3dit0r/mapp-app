import { MdInfoOutline } from "react-icons/md";
import "./index.css";

export default function PopPanel({ isToggled, title, subtitle, icon }) {
  let className = "pop-panel-wrapper flex aictr jcctr";
  if (!isToggled) className += " hidden";

  return (
    <div className={className}>
      <div className="pop-panel flex aictr">
        <div className="icon flex aictr jcctr">
          {icon || <MdInfoOutline size={25} />}
        </div>
        <div className="text line-ellipsis">{title}</div>
        <div className="btt">
          <div className="zum">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
