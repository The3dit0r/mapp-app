export default function LoadingIcon({ size = 30, style = {} }) {
  return (
    <img
      src={window.location.origin + "/loading.svg"}
      width={size}
      height={size}
      alt="i"
      style={{
        filter: "hue-rotate(310deg) brightness(1.5)",
        ...style,
      }}
    />
  );
}
