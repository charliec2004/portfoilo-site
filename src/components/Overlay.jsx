export default function Overlay({ active, onClick }) {
  return (
    <div
      className={`overlay ${active ? 'active' : ''}`}
      aria-hidden="true"
      onClick={onClick}
    />
  );
}
