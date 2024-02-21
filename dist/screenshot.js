"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getStories_1 = __importDefault(require("./getStories"));
const puppeteer_1 = __importDefault(require("puppeteer"));
(0, getStories_1.default)('AmITheAsshole').then(async (stories) => {
    const name = stories[1].name;
    const url = stories[1].url;
    console.log(name);
    console.log(url);
    const screenshot = async () => {
        const browser = await puppeteer_1.default.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector(`#${name}`);
        const element = await page.$(`#${name}`);
        if (!element) {
            console.log('Element not found');
        }
        await (element === null || element === void 0 ? void 0 : element.screenshot({ path: 'example.png' }));
        await browser.close();
    };
    screenshot();
});
