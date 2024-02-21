import getStories from './getStories';
import puppeteer from 'puppeteer';

interface Story {
    name: string;
    url: string;
}

getStories('AmITheAsshole').then(async (stories: Story[]) => {
    const name = stories[1].name;
    const url = stories[1].url;

    console.log(name);
    console.log(url);

    const screenshot = async () => {
        const browser = await puppeteer.launch({
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
        await element?.screenshot({ path: 'example.png' });
        await browser.close();
    };
    screenshot();
});
