import { useState, useEffect } from "react";

function getRelative(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function RelativeTime({ date, className }: { date: string; className?: string }) {
  const [text, setText] = useState(() => getRelative(date));

  useEffect(() => {
    const interval = setInterval(() => setText(getRelative(date)), 30_000);
    return () => clearInterval(interval);
  }, [date]);

  const full = new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <time dateTime={date} title={full} className={className}>
      {text}
    </time>
  );
}
