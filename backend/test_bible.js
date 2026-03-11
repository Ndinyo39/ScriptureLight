const https = require('https');

function check(book, chapter, translation) {
    return new Promise((resolve) => {
        https.get(`https://bible-api.com/${book}+${chapter}?translation=${translation}`, (res) => {
            console.log(`${book} ${chapter} (${translation}) Status:`, res.statusCode);
            resolve(res.statusCode);
        }).on('error', (err) => {
            console.error(err);
            resolve(500);
        });
    });
}

async function run() {
    await check('job', 1, 'oeb-us');
    await check('job', 1, 'kjv');
    await check('psalms', 1, 'oeb-us');
}
run();
