#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { HELP_TEXT, runTranslation, type CliRunOptions } from "./cli-core.js";
import { compact } from "./cda-to-fhir/utils/xml-tree.js";

function readInput(inPath: string | undefined): string {
  const fd = inPath ?? 0; // 0 = stdin
  return readFileSync(fd, "utf8");
}

/** The CLI entrypoint's argument parsing and I/O, split out from the top-level script
 * run below so tests can call it directly with an explicit argv. */
export function main(argv: string[] = process.argv.slice(2)): void {
  const { values } = parseArgs({
    args: argv,
    options: {
      in: { type: "string", short: "i" },
      out: { type: "string", short: "o" },
      direction: { type: "string", short: "d" },
      json: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  const input = readInput(values.in);
  const { output, warnings } = runTranslation(
    input,
    compact({ direction: values.direction, json: values.json }) as CliRunOptions,
  );

  if (values.out) {
    writeFileSync(values.out, output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }

  for (const warning of warnings) {
    process.stderr.write(`warning: ${warning.path}: ${warning.message}\n`);
  }
}

// Only runs when this file is executed directly (as the installed `cda-fhir-translator`
// bin) — guarded so tests can import `main` and call it without triggering process.exit.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
