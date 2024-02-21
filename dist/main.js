"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const speak_1 = require("./speak");
const makesubtitles_1 = require("./makesubtitles");
const drawSubtitles_1 = require("./drawSubtitles");
const mergeAudioandVideo_1 = require("./mergeAudioandVideo");
async function main(subreddit, count, videoPath) {
    const stories = await (0, speak_1.getIterableStories)(subreddit, count);
    for (const story of stories) {
        await (0, speak_1.createSpeech)(story);
    }
    const audio_urls = stories.map((story) => `./audios/${story.name}/output.mp3`);
    for (const [i, story] of stories.entries()) {
        const audio_url = await (0, makesubtitles_1.uploadAudio)(audio_urls[i]);
        const transcription_id = await (0, makesubtitles_1.transcribeAudio)(audio_url);
        const transcription = await (0, makesubtitles_1.getTranscription)(transcription_id);
        await (0, drawSubtitles_1.addSubtitlesToVideo)(`./output/${story.name}_subs.srt`, videoPath, transcription, `./output/${story.name}_unfinished.mp4`);
        await (0, mergeAudioandVideo_1.createVideo)(`./output/${story.name}_unfinished.mp4`, audio_urls[i], `./output/${story.name}_finished.mp4`);
    }
}
main('AmITheAsshole', 1, './assets/mc-video.mp4').catch((error) => console.error('Error in main:', error));
