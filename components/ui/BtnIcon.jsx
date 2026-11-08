import Icon from "./Icon";

/**
 * Button icon tile. The icon is rendered twice: on hover the first copy
 * glides out while the second glides in (pure CSS transitions, so it is
 * smooth in both directions and never "jumps" back).
 * Arrows travel horizontally; other icons travel vertically.
 */
export default function BtnIcon({ name = "arrow", children }) {
  const dir = name.startsWith("arrow") ? "x" : "y";
  return (
    <span className="btn__icon" data-dir={dir} aria-hidden="true">
      {children ?? (
        <>
          <Icon name={name} />
          <Icon name={name} />
        </>
      )}
    </span>
  );
}
