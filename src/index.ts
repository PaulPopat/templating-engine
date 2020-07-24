import { GetOptions } from "./utils/options-parser";
import { Compile } from "./code-compiler";
import { StartApp, Server } from "./app-runner";
import chokidar from "chokidar";
import { Debounce } from "./utils/debounce";

(async () => {
  const options = await GetOptions();
  if (options.mode === "dev") {
    console.log("Starting in dev mode so watching for changes.");
    let server: Server | undefined;
    console.log("Watching for changes.");
    let running = false;
    const run = Debounce(async () => {
      if (running) {
        return;
      }

      running = true;
      console.log("Detected a change. Compiling and running again.");
      server?.stop();
      await Compile(options, true);
      server = await StartApp(options);
      running = false;
    }, 200);
    chokidar
      .watch(
        [
          "./**/*.ts",
          "./**/*.tpe",
          "./tpe-config.json",
          "./tsconfig.json",
          "./**/*.scss",
        ],
        {
          ignored: ["node_modules/**/*", ".git/**/*", ".sote/**/*"],
        }
      )
      .on("all", run);
  } else if (options.mode === "build") {
    console.log("Performing a production build.");
    await Compile(options, false);
  } else {
    console.log("Starting in production mode.");
    await StartApp(options);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
