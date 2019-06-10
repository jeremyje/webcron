import * as commander from "commander";
import * as compression from "compression";
import * as errorHandler from "errorhandler";
import * as express from "express";
import promBundle = require("express-prom-bundle");
import * as lusca from "lusca";
import * as logger from "morgan";
import { resolve } from "path";
import serveIndex = require("serve-index");
import { IConfig, readConfig } from "./app/config";
import rootRouter, { setHomePageContent, setLoadedConfiguration } from "./app/router";
import { isProduction } from "./app/util";
import { startWebcron } from "./app/webcron";

function webcronMain(onConfigLoadComplete: (configs: IConfig[]) => void) {
    (async () => {
        const configs = await readConfig(commander.config as string);
        startWebcron(configs);
        onConfigLoadComplete(configs);
    })();
}

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.parseArgs();
        this.middleware();
        this.routes();
        this.launchConf();
    }

    private parseArgs(): void {
        commander
            .version("1.1.0")
            .description("A server that will periodically download web content and store it in "
                + "text, PDF, JPEG, and PNG format.")
            .option("-c, --config [path]", "Configuration File, defaults to [config.yaml]", "config.yaml")
            .parse(process.argv);
    }

    private middleware(): void {
        this.express.set("port", process.env.PORT || 3000);
        this.express.use(compression());
        this.express.use(logger("dev"));
        this.express.use(lusca.xframe("SAMEORIGIN"));
        this.express.use(lusca.xssProtection(true));
        webcronMain((configs: IConfig[]) => {
            setLoadedConfiguration(configs);
            const normalizedPaths = [
                ["^/files/.*", "/files/*"],
            ];

            let homePageText = `<h2>webcron</h2>
            <b><a href="/metrics">/metrics</a></b> - Server Metrics
            <br /><b><a href="/config">/config</a></b> - Server Configuration
            <br />
            <h3>Corpuses</h3>
            <ul>`;

            let hasCorpus = false;
            for (const config of configs) {
                if (config.servePath.length > 0) {
                    hasCorpus = true;
                    const outputDirectory = resolve(config.outputDirectory);
                    const servePath = ("/" + config.servePath.trim() + "/").replace(/\/\//g, "/");
                    // tslint:disable-next-line:no-console
                    console.log("Serving " + outputDirectory + " via " + servePath);
                    this.express.use(
                        config.servePath,
                        express.static(outputDirectory, {
                            immutable: true,
                            maxAge: 31557600000,
                        }),
                        serveIndex(outputDirectory, {
                            icons: true,
                        }));
                    normalizedPaths.push(["^" + servePath + ".*", servePath + "*"]);
                    homePageText += "<li><b><a href=\"" + servePath + "\">" + servePath
                        + "</a></b> - " + config.outputDirectory + "</li>\n";
                }
            }
            homePageText += "</ul>\n";
            if (!hasCorpus) {
                homePageText += "<p>No corpus directories are exposed, "
                    + "to enable add [servePath] option to your configuration.</p>";
            }

            setHomePageContent(homePageText);

            const metricsMiddleware = promBundle({
                includeMethod: true,
                includePath: true,
                includeStatusCode: true,
                normalizePath: normalizedPaths,
            });
            this.express.use(metricsMiddleware);
        });
    }

    private routes(): void {
        this.express.use("/", rootRouter);
    }

    private launchConf() {
        this.express.use(errorHandler());
        if (isProduction()) {
            this.express.listen(this.express.get("port"), () => {
                // tslint:disable-next-line:no-console
                console.log(("  App is running at http://localhost:%d \
      in %s mode"), this.express.get("port"), this.express.get("env"));
                // tslint:disable-next-line:no-console
                console.log("  Press CTRL-C to stop\n");
            });
        }
    }
}

export default new App().express;
