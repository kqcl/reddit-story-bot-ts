interface Post {
    data: {
        selftext: string;
        title: string;
        url: string;
        name: string;
    };
}

const getPosts = async (subreddit: string) => {
    const response = fetch(`https://www.reddit.com/r/${subreddit}.json`);
    const posts = (await response).json();
    return posts;
};

const getStories = async (subreddit: string) => {
    const posts = await getPosts(subreddit);
    return posts.data.children.map((post: Post) => {
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

export default getStories;
