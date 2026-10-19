// Shows "10:32 AM", "Yesterday" or "3 days ago"
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysAgo = Math.round((startOfToday - startOfThatDay) / (1000 * 60 * 60 * 24));

  if (daysAgo <= 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo} days ago`;
}

export default formatTime;