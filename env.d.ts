/* Standalone equivalents of the CSS (module) declarations that vite/client.d.ts
 * provides in consuming projects, so this repo typechecks without Vite. */

declare module '*.module.css' {
    const classes: {readonly [key: string]: string};
    export default classes;
}

declare module '*.css' {}
