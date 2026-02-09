import { useEffect, useRef, useState } from 'react';
import useTerminal from '../hooks/useTerminal';

const PROMPT = 'visitor@charlie:~$ ';

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1099,
  },
  wrapper: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1100,
    width: '90vw',
    maxWidth: 700,
    maxHeight: 500,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(36, 34, 33, 0.95)',
    border: '1px solid rgba(179, 142, 57, 0.3)',
    borderRadius: 12,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    overflow: 'hidden',
    /* animation handled via className */
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    height: 36,
    padding: '0 12px',
    background: 'rgba(36, 34, 33, 0.8)',
    flexShrink: 0,
    position: 'relative',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginRight: 8,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  titleText: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-text-primary)',
  },
  lineInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-text-accent)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  lineOutput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-text-primary)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginBottom: 8,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  promptSpan: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-text-accent)',
    whiteSpace: 'pre',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-text-primary)',
    padding: 0,
    margin: 0,
    caretColor: 'var(--color-text-primary)',
  },
};

/* Inline <style> for animations that cannot be expressed as JS objects */
const CSS = `
.terminal--entering {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}
.terminal--visible {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.terminal__input::selection {
  background: rgba(179, 142, 57, 0.35);
}

@keyframes terminal-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.terminal__input {
  caret-color: var(--color-text-primary);
  animation: terminal-blink 1s step-end infinite;
}

.terminal__input:focus {
  animation: none;
}
`;

export default function Terminal() {
  const {
    isOpen,
    lines,
    inputValue,
    setInputValue,
    handleSubmit,
    handleKeyDown,
    close,
  } = useTerminal();

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const [animClass, setAnimClass] = useState('');

  // Manage enter / visible animation class
  useEffect(() => {
    if (isOpen) {
      // Start with entering class (invisible), then switch to visible on next frame
      setAnimClass('terminal--entering');
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimClass('terminal--visible');
        });
      });
      return () => cancelAnimationFrame(frameId);
    }
    setAnimClass('');
  }, [isOpen]);

  // Auto-focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to let the DOM settle
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when lines change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  if (!isOpen) return null;

  return (
    <>
      {/* Inject animation CSS */}
      <style>{CSS}</style>

      {/* Backdrop */}
      <div
        style={styles.backdrop}
        onClick={close}
        aria-hidden="true"
      />

      {/* Terminal window */}
      <div
        className={animClass}
        style={styles.wrapper}
        role="dialog"
        aria-label="Terminal"
      >
        {/* Title bar */}
        <div style={styles.titleBar}>
          {/* Window control dots */}
          <button
            type="button"
            style={{ ...styles.dot, background: '#FF5F57' }}
            onClick={close}
            aria-label="Close terminal"
          />
          <span style={{ ...styles.dot, background: '#FFBD2E', cursor: 'default' }} />
          <span style={{ ...styles.dot, background: '#27C93F', cursor: 'default' }} />

          <span style={styles.titleText}>{PROMPT.trim()}</span>
        </div>

        {/* Body */}
        <div ref={bodyRef} style={styles.body}>
          {/* Welcome message */}
          <div style={styles.lineOutput}>
            Welcome! Type &apos;help&apos; to see available commands.
          </div>

          {/* Rendered lines */}
          {lines.map((line, i) => {
            if (line.type === 'input') {
              return (
                <div key={i} style={styles.lineInput}>
                  {PROMPT}{line.text}
                </div>
              );
            }
            return (
              <div key={i} style={styles.lineOutput}>
                {line.text}
              </div>
            );
          })}

          {/* Active input row */}
          <div style={styles.inputRow}>
            <span style={styles.promptSpan}>{PROMPT}</span>
            <input
              ref={inputRef}
              className="terminal__input"
              type="text"
              style={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </>
  );
}
