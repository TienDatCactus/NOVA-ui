import { useTheme } from "~/context/theme.context";
import "./styles.css";
export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <span className="slider"></span>
      <span className="clouds_stars"></span>
    </label>
  );
}
