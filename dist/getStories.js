"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getPosts = async (subreddit) => {
    const response = fetch(`https://www.reddit.com/r/${subreddit}.json`);
    const posts = (await response).json();
    return posts;
};
const getStories = async (subreddit) => {
    const posts = await getPosts(subreddit);
    return posts.data.children.map((post) => {
        return {
            title: post.data.title,
            url: post.data.url,
            selftext: post.data.selftext.replace(/\n/g, ' '),
            name: post.data.name,
        };
    });
};
// const storiy = getStories('AmITheAsshole').then((stories) => {
//     console.log(stories[1].selftext);
// });
exports.default = getStories;
