export function mealTitle(items: Array<{ name: string }>): string {
  if (items.length === 0) return "Comida";
  const names = items.slice(0, 2).map((item) => capitalize(item.name));
  const title = names.join(" con ");
  return items.length > 2 ? `${title} y más` : title;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
