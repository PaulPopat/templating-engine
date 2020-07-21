import fs from "fs-extra";
import { IsObject, Optional, IsString } from "@paulpopat/safe-type";
import { Assert } from "./types";
import path from "path";
import { CacheInProduction } from "./cache";

const IsOptions = IsObject({
  components: Optional(IsString),
  pages: Optional(IsString),
  layout: Optional(IsString),
  port: Optional(IsString),
  static: Optional(IsString),
  error_page: Optional(IsString),
  sass: Optional(IsString),
});

function ParseQueryString(): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  for (const arg of process.argv) {
    if (arg.startsWith("--")) {
      const [s, o] = arg.split("=");
      if (o.startsWith('"') || o.startsWith("'")) {
        result[s.replace("--", "")] = o.slice(1, o.length - 1);
      } else {
        result[s.replace("--", "")] = o;
      }
    }
  }

  return result;
}

async function ReadOptionsFile(): Promise<{ [key: string]: string }> {
  if (!(await fs.pathExists("./tpe-config.json"))) {
    return {};
  }

  return await fs.readJson("./tpe-config.json");
}

export async function GetOptions() {
  const options = { ...(await ReadOptionsFile()), ...ParseQueryString() };
  Assert(IsOptions, options, "Invalid command line parameters");
  const pages = path.normalize(options.pages ?? "./src/pages");
  const components = path.normalize(options.components ?? "./src/components");
  const error_page = path.normalize(
    options.error_page ?? path.join(pages, "_error.tpe")
  );
  const layout = path.normalize(options.layout ?? "./src/layout.html");
  const sass = options.sass && path.normalize(options.sass);
  const staticroute = options.static && path.normalize(options.static);
  const GetLayout = CacheInProduction(() => fs.readFile(layout, "utf-8"));
  return {
    GetLayout,
    sass,
    staticroute,
    error_page,
    components,
    pages,
    port: options.port,
  };
}
