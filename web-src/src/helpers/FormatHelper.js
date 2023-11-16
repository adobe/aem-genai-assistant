export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US');
  const timeStr = date.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'});
  return `${dateStr} ${timeStr}`;
}
