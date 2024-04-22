
// Feed to fetch
// https://hnrss.org/best.jsonfeed

/* Example:
```
{
  "version": "https://jsonfeed.org/version/1",
  "title": "Hacker News: Best",
  "description": "Hacker News RSS",
  "home_page_url": "https://news.ycombinator.com/best",
  "items": [
    {
      "id": "https://news.ycombinator.com/item?id=40103407",
      "title": "Programming Is Mostly Thinking (2014)",
      "content_html": "\n<p>Article URL: <a href=\"http://agileotter.blogspot.com/2014/09/programming-is-mostly-thinking.html\">http://agileotter.blogspot.com/2014/09/programming-is-mostly-thinking.html</a></p>\n<p>Comments URL: <a href=\"https://news.ycombinator.com/item?id=40103407\">https://news.ycombinator.com/item?id=40103407</a></p>\n<p>Points: 457</p>\n<p># Comments: 184</p>\n",
      "url": "http://agileotter.blogspot.com/2014/09/programming-is-mostly-thinking.html",
      "external_url": "https://news.ycombinator.com/item?id=40103407",
      "date_published": "2024-04-21T05:40:07Z",
      "author": {
        "name": "ingve",
        "url": "https://news.ycombinator.com/user?id=ingve"
      }
    },
...
*/

const { app } = require('@azure/functions');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.timer('timerTrigger', {
    // Run every day at 12:00 PM
    schedule: '0 0 12 * * *',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');
        const feedResults = await fetchFeed();
        const formattedResults = formatFeedResults(feedResults);
        await sendEmail(formattedResults);
    }
});

async function fetchFeed() {
    const response = await fetch('https://hnrss.org/best.jsonfeed');
    return await response.json();
}

function formatFeedResults(feedResults) {
    const emailTitle = '<h1>Hacker News Best</h1>';
    const formattedFeedItems = feedResults.items.map(item => {
        return `
            <h2>${item.title}</h2>
            <p>${item.date_published}</p>
            <p>${item.content_html}</p>
            <a href="${item.url}">Link</a>
        `;
    });
    return emailTitle + formattedFeedItems.join('');
}

async function sendEmail(formattedResults) {
    // Send email with formatted results
    // Using sendgrid
    // And with the following email template, using values from the environment variables
    const email = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM,
        subject: 'Hacker News Best',
        html: formattedResults
    };
    await sgMail.send(email);
    console.log('Email sent');
}
