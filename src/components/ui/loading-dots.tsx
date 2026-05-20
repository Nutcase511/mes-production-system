export function LoadingDots({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center w-full min-h-[300px] gap-4 ${className ?? ''}`}>
      <div className="flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"
            style={{
              animationDelay: `${i * 0.15}s`,
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
            }}
          />
        ))}
      </div>
      {text && <span className="text-cyan-400 text-sm">{text}</span>}
    </div>
  )
}
