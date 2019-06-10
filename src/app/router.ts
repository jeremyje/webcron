import { Request, Response, Router } from "express";
import * as Prometheus from "prom-client";
import { IConfig } from "./config";

const homePage = (req: Request, res: Response) => {
    res.set("Content-Type", "text/html");
    res.end(homePageText);
};

const metrics = (req: Request, res: Response) => {
    res.set("Content-Type", Prometheus.register.contentType);
    res.end(Prometheus.register.metrics());
};

const config = (req: Request, res: Response) => {
    res.set("Content-Type", "application/json");
    res.json(loadedConfigs);
};

let homePageText = "";
export function setHomePageContent(body: string): void {
    homePageText = `<!DOCTYPE html>
<head>
<title>webcron</title>
<style>

html {
    font-size: 62.5%;
    margin-left: 2em;
  }

  body {
    color: #606c76;
    font-family: 'Roboto Light', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    font-size: 1.6em;
    font-weight: 300;
    letter-spacing: .01em;
    line-height: 1.6;
  }

a {
    color: #9b4dca;
    text-decoration: none;
  }

  a:focus, a:hover {
    color: #606c76;
  }

  b,
  strong {
    font-weight: bold;
  }

  h2,
  h3 {
    font-weight: 300;
    letter-spacing: -.1rem;
  }
  h2 {
    font-size: 3.6rem;
    line-height: 1.25;
  }

  h3 {
    font-size: 2.8rem;
    line-height: 1.3;
  }

</style>
</head>
<body>` + body + `</body>
</html>`;
}

let loadedConfigs: IConfig[] = [];
export function setLoadedConfiguration(configs: IConfig[]): void {
    loadedConfigs = configs;
}

class Root {
    public router: Router;
    public constructor() {
        this.router = Router();
        this.init();
    }
    private init() {
        this.router.get("/", homePage);
        this.router.get("/metrics", metrics);
        this.router.get("/config", config);
    }
}

const rootRoutes = new Root();
export default rootRoutes.router;
