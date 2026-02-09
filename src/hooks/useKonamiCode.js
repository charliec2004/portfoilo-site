import { useState, useEffect, useCallback, useRef } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA",
];

export default function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const indexRef = useRef(0);

  const handleKeyDown = useCallback((event) => {
    if (event.code === KONAMI_SEQUENCE[indexRef.current]) {
      indexRef.current += 1;
      if (indexRef.current === KONAMI_SEQUENCE.length) {
        setActivated(true);
        indexRef.current = 0;
        setTimeout(() => setActivated(false), 4000);
      }
    } else {
      indexRef.current = event.code === KONAMI_SEQUENCE[0] ? 1 : 0;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return activated;
}
