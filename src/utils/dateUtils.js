export function generatePastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString());
  }
  return dates;
}