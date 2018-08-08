// Constants
const s3BaseURL = 'https://s3.amazonaws.com/crstories.org/';
const windowURL = window.location.href.split('?')[0];
const storyParam = getStoryParam();
const passwordParam = getFromParameterOrLocalStorage('password');
const password = '1MomentStrongSitUnder';

function getStoryParam() {
    let string = getFromParameterOrLocalStorage('story');
    const storyParam = string ? atob(string) : null;
    return storyParam;
}

function copyShareLink(shareURL) {
    window.prompt("Copy the following link for a sharable page", shareURL);
}

function generateQRCode(qrElementId, sharingURL) {
    let qrcode = new QRCode(qrElementId);
    qrcode.makeCode(sharingURL);
}

function formatMetadata(story) {
    return `
      <h1>${story.name} - ${story.date}</h1>
      <h4>${story.subject}</h4>
    `;
}

function formatButtons(shareURL, url) {
    return `
        <div>
            <a href onclick="copyShareLink('${shareURL}')"><span class="button">Share this Story</span></a>
            <a href="${url}"><span id="listen-now" class="button">Listen Now</span></a>
        </div>
    `;
}

function formatQRCodeDiv(i) {
    return `<div id="qrcode${i}" class="qrcode"></div>`;
}

function formatStory(storyElements, buttonsElements, qrCodeElements) {
    let template = `
        <div class="story">
            <div class="description">
                ${storyElements}
                ${buttonsElements}
            </div>
            ${qrCodeElements}
        </div>
    `;
    return template;
}

function displayStory(story, storyNumber) {
    let mp3URL = s3BaseURL + story.title;
    let sharingURL = windowURL + '?storyParam=' + btoa(story.title);
    $("#stories").append(formatStory(formatMetadata(story), formatButtons(sharingURL, mp3URL), formatQRCodeDiv(storyNumber)));
    generateQRCode("qrcode" + storyNumber, sharingURL);
}

function shouldDisplayStory(story) {
    return storyParam === story.title || passwordParam === password  || (story.public === true && !storyParam);
}

function displayStories() {
    let i = 0;
    stories.forEach(story => {
        if(shouldDisplayStory(story)) {
            displayStory(story, i);
            i++;
        }
    })
}

$(document).ready(function(){
    displayStories();
});
