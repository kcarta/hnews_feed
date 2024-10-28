
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
    const emailTitle = '<h1 style="color: #ff6600; font-family: Arial, sans-serif;">Hacker News Best</h1>';
    const formattedFeedItems = feedResults.items.map(item => {
        return `
            <div style="margin-bottom: 20px; padding: 10px; border-bottom: 1px solid #cccccc;">
                <h2 style="color: #333333; font-family: Arial, sans-serif;">${item.title}</h2>
                <p style="color: #666666; font-size: 12px; font-family: Arial, sans-serif;">Published: ${item.date_published}</p>
                <div style="color: #444444; font-size: 14px; font-family: Arial, sans-serif;">${item.content_html}</div>
                <a href="${item.url}" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 4px;">Read more</a>
            </div>
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
