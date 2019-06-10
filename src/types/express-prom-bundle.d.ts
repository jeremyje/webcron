// External express-validator module.
declare module "express-prom-bundle" {
    // https://github.com/jochen-schweizer/express-prom-bundle
    import express = require("express");
    interface IPromBundleOptions {
        /** HTTP status code (200, 400, 404 etc.), default: true */
        includeStatusCode?: boolean;
        /** HTTP method (GET, PUT, ...), default: false */
        includeMethod?: boolean;
        /** URL path (see importent details below), default: false */
        includePath?: boolean;
        /**
         * an; object; containing; extra; labels; e.g.; {project_name: "hello_world"; }.
         * Most; useful; together; with transformLabels callback, otherwise; it's
         * better to use native Prometheus relabeling";
         */
        customLabels?: any;
        /** */
        normalizePath?: any;
        /**
         * options passed when instantiating url-value-parser.
         * This is the easiest way to customize which parts of the URL should be replaced with "#val".
         * See the docs of url-value-parser module for details.
         */
        urlValueParser?: any;
        /**
         * function(res) producing final status code from express res object,
         * e.g. you can combine 200, 201 and 204 to just 2xx.
         */
        formatStatusCode?: any;
        /**
         * function(labels, req, res) transforms; the; labels; object, e.g.setting; dynamic; values; to; customLabels;
         */
        transformLabels?: any;
    }

    /**
     * @param options see: https://github.com/ctavan/express-validator#middleware-options
     * @constructor
     */
    function PromBundle(options?: IPromBundleOptions): express.RequestHandler;

    export = PromBundle;
}
