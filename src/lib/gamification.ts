export function getCinephileBadge(level: number) {
  if (level >= 100) return { icon: "🪐", title: "Galactic Cinephile", color: "text-purple-500" };
  if (level >= 90) return { icon: "💎", title: "Diamond Critic", color: "text-cyan-400" };
  if (level >= 80) return { icon: "👑", title: "Golden Crown", color: "text-yellow-500" };
  if (level >= 70) return { icon: "🏆", title: "Award Winner", color: "text-amber-500" };
  if (level >= 60) return { icon: "🌟", title: "Rising Star", color: "text-yellow-400" };
  if (level >= 50) return { icon: "🎥", title: "Auteur", color: "text-emerald-500" };
  if (level >= 40) return { icon: "🎭", title: "Thespian", color: "text-rose-500" };
  if (level >= 30) return { icon: "🎟️", title: "Golden Ticket", color: "text-orange-500" };
  if (level >= 20) return { icon: "📼", title: "Retro Buff", color: "text-indigo-400" };
  if (level >= 10) return { icon: "🎬", title: "Director's Cut", color: "text-blue-500" };
  return { icon: "🍿", title: "Popcorn Eater", color: "text-zinc-500" };
}