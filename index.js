const s3URL = 'https://s3.amazonaws.com/crstories.org/';
const windowURL = window.location.href.split('?')[0];
var story = atob(getFromParameterOrLocalStorage('story'));
var password = getParameterByName('password');
console.log(story);
console.log(windowURL);

function storyTemplate(item, url, i, shareURL = null, password = null) {
    let line1 = '<h1>' + item.name + ' - ' + item.date + '</h1>'
    let line2 = '<h4>' + item.subject + '</h4>'
    let line3 = ''
      line3 = '<p><a href onclick="copyShareLink(\'' + shareURL + '\')"><span class="button">Share this Story</span></a></p>';
      line4 = '<p><a href="' + url + '"><span id="listen-now" class="button">' + 'Listen Now' + '</span></a></p>';
    let line5 = '<div id="qrcode' + i + '" class="qrcode"></div>';
    let lines = '<div class="story"><div class="description">' + line1 + line2 + line3 + line4 + '</div><div class="qr">' + line5 + '</div></div>';
    return lines;
}

function copyShareLink(shareURL) {
  window.prompt("Copy the following link for a sharable page", shareURL);
}

function addListItems() {
    let i = 0;
    stories.forEach(item => {
        let storyURL = s3URL + item.title;
        let sharingURL = windowURL + '?story=' + btoa(item.title);
        if(story === item.title || password === '1MomentStrongSitUnder') {
            $("#stories").append(storyTemplate(item, storyURL, i, sharingURL, password));
            let qrcode = new QRCode("qrcode" + i);
            qrcode.makeCode(sharingURL);
            i++;
        }
    })
}

$(document).ready(function(){
    addListItems();
});
