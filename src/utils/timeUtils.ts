export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (milliseconds: number): string => {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};

export const parseGoalToMilliseconds = (goal: string): number => {
  // Parse goals like "1 hour/day", "30 mins/day", "10 hrs/week"
  const hourMatch = goal.match(/(\d+)\s*(?:hour|hr)s?/i);
  const minMatch = goal.match(/(\d+)\s*(?:minute|min)s?/i);
  
  let totalMinutes = 0;
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }
  
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1]);
  }
  
  return totalMinutes * 60 * 1000; // Convert to milliseconds
};