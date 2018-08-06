const s3URL = 'https://s3.amazonaws.com/crstories.org/';
const windowURL = window.location.href.split('?')[0];
var story = atob(getFromParameterOrLocalStorage('story'));
var password = getParameterByName('password');
console.log(story);
console.log(windowURL);

function storyTemplate(item, url, i) {
    let line1 = '<p><a href="' + url + '"><span class="story">' + item.title + '</span></a></p>';
    let line2 = '<div id="qrcode' + i + '" class="qrcode"></div>';
    let lines = '<div class="story">' + line1 + line2 + '</div>';
    return lines;
}

function addListItems() {
    let i = 0;
    stories.forEach(item => {
        let storyURL = s3URL + item.title;
        let sharingURL = windowURL + '?story=' + item.title;
        console.log(storyURL);
        if(story === item.title || password === '1MomentStrongSitUnder') {
            $("#stories").append(storyTemplate(item, storyURL, i));
            if(password){
                let qrcode = new QRCode("qrcode" + i);
                qrcode.makeCode(sharingURL);
            }
            i++;
        }
    })
}

$(document).ready(function(){
    addListItems();
});