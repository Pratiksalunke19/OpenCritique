import { useEffect, useRef, useState } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";

function randomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

const DecryptedText = ({
  text = "",
  className = "",
  duration = 1200,
  delay = 0,
  step = 2,
  interval = 16,
  onComplete,
}) => {
  const [display, setDisplay] = useState("");
  const frame = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    let mounted = true;
    let start = null;
    let animationFrame;
    let revealed = 0;
    let revealStep = step;
    let revealInterval = interval;
    let revealDelay = delay;
    let revealDuration = duration;
    let revealChars = text.split("");
    let output = Array(revealChars.length).fill("");

    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      if (elapsed < revealDelay) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      let progress = Math.min(1, (elapsed - revealDelay) / revealDuration);
      let revealCount = Math.floor(progress * revealChars.length);
      for (let i = 0; i < revealChars.length; i++) {
        if (i < revealCount) {
          output[i] = revealChars[i];
        } else {
          output[i] = randomChar();
        }
      }
      if (mounted) setDisplay(output.join(""));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        if (mounted) setDisplay(text);
        done.current = true;
        onComplete?.();
      }
    }
    animationFrame = requestAnimationFrame(animate);
    return () => {
      mounted = false;
      cancelAnimationFrame(animationFrame);
    };
    // eslint-disable-next-line
  }, [text, duration, delay, step, interval]);

  return (
    <span className={className} style={{ whiteSpace: "pre-line" }}>{display}</span>
  );
};

export default DecryptedText;
