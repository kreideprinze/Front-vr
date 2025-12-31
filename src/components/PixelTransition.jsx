import "./PixelTransition.css";

export default function PixelTransition({ active }) {
  if (!active) return null;

  // create 30 horizontal slices
  const slices = Array.from({ length: 30 });

  return (
    <div className="pixel-transition">
      {slices.map((_, i) => (
        <div
          key={i}
          className="pixel-slice"
          style={{
            top: `${(i / slices.length) * 100}%`,
            animationDelay: `${i * 18}ms`,
          }}
        />
      ))}
    </div>
  );
}
