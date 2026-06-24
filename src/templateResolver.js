export function applyTemplateVariables(content, variables) {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  const remaining = result.match(/\{\{[^}]+\}\}/g);
  if (remaining) {
    throw new Error(
      `Unreplaced template placeholders: ${remaining.join(", ")}`
    );
  }
  return result;
}
