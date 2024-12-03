declare module "puppeteer-extra" {
    import puppeteer from "puppeteer";
    export = puppeteer;
}

declare module "puppeteer-extra-plugin-stealth" {
    const StealthPlugin: () => any;
    export default StealthPlugin;
}
