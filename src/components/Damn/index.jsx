export default function Damn({ height, children, onTouch }) {
  if (children) {
    return (
      <div onTouchStart={onTouch} onMouseDown={onTouch}>
        <div style={{ height: height }}></div>
        {children}
        <div style={{ height: height }}></div>
      </div>
    );
  }

  return <div style={{ height: height }}></div>;
}
