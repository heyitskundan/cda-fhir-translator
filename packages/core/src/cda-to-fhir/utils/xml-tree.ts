import type { CdaNode } from "../parser.js";

/** fast-xml-parser collapses a single repeated element to a bare object, not a
 * 1-element array — every place this package reads a possibly-repeating element
 * goes through this to normalize both shapes. */
export function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function attr(node: CdaNode | undefined, name: string): string | undefined {
  if (!node) return undefined;
  const value = node[`@${name}`];
  return typeof value === "string" ? value : undefined;
}

/** Recursively finds every element carrying a `templateId` whose `@root` matches.
 * C-CDA entries are identified by template root, not by tag name or nesting depth,
 * so a recursive search is the deterministic way to find "the Allergy Observation"
 * wherever it sits inside an `entry`. */
export function findByTemplateRoot(node: unknown, root: string): CdaNode[] {
  const results: CdaNode[] = [];

  function walk(current: unknown): void {
    if (current === null || current === undefined || typeof current !== "object") return;
    if (Array.isArray(current)) {
      for (const item of current) walk(item);
      return;
    }
    const obj = current as CdaNode;
    const templateIds = asArray(obj["templateId"] as CdaNode | CdaNode[] | undefined);
    if (templateIds.some((t) => attr(t, "root") === root)) {
      results.push(obj);
    }
    for (const key of Object.keys(obj)) {
      if (key === "templateId") continue;
      walk(obj[key]);
    }
  }

  walk(node);
  return results;
}

/** Removes `undefined`-valued keys so an object literal can be built with ternaries
 * and safely cast to a FHIR type without `exactOptionalPropertyTypes` complaining
 * about an explicit `undefined` on an optional field. */
export function compact<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}
