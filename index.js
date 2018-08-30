// Constants
const s3BaseURL = 'https://s3.amazonaws.com/crstories.org/'
const storyMetadataURL = 'https://gpzy1rrcwg.execute-api.us-east-1.amazonaws.com/Prod/'
const windowURL = window.location.href.split('?')[0]
const storyParam = getStoryParam()
const passwordParam = getFromParameterOrLocalStorage('password')
const password = '1MomentStrongSitUnder'
const driveBaseDownloadURL = 'https://drive.google.com/uc?export=download&id='

function getStoryParam() {
    let string = getFromParameterOrLocalStorage('story')
    const storyParam = string ? atob(string) : null
    return storyParam
}

function copyShareLink(shareURL) {
    window.prompt("Copy the following link for a sharable page", shareURL)
}

function generateQRCode(qrElementId, sharingURL) {
    let qrcode = new QRCode(qrElementId)
    qrcode.makeCode(sharingURL)
}

function formatMetadata(story) {
    let defaultImageId = {
        Male : `1CxW_Fkzs5h8dgw1KWtx46bp4wdv8-tNS`,
        Female : `1CqCImkk68Mz3nEsQgM_Xs2PK98X_c-5w`,
        Couple : `1D7pP0elF3EqECmmlXb-yddfjlumkRIs4`
    }
    
    console.log(story.gender)

    let driveId = story.hasOwnProperty('imageURL') ? getQueryVariable(story.imageURL, 'id') : defaultImageId[story.gender]
    console.log(driveId)
    let imageElements = driveId ? `<div><img class="story-image" src="${driveBaseDownloadURL}${driveId}" /></div>` : ''
    
    return `
      ${imageElements}
      <h2>${story.name}<br />${story.date}</h2>
      <h4 id="subject-heading">${story.subject}</h4>
    `
}

function formatControls(story) {
    let driveId = story.hasOwnProperty('audioURL') ? getQueryVariable(story.audioURL, 'id') : null
    let playerElements = driveId ? `
        <div id="player-elements">
            <audio id="t-rex-roar-loop" controls>
                <source type="audio/mpeg" src="${driveBaseDownloadURL}${driveId}" style="border: 1px solid black;"/>
            </audio>
        </div>
    ` : ''
    
    let readButton = story.hasOwnProperty('textURL') ? `<a href="${story.textURL}" target="_blank"><span id="listen-now" class="button">Read</span></a>` : ''
    let sharingURL = windowURL + '?storyParam=' + btoa(story.name)

    return `
        ${playerElements}
        <div>
            ${readButton}
            <a href onclick="copyShareLink('${sharingURL}')"><span class="button">Share</span></a>
        </div>
    `
}

function formatStory(storyElements, buttonsElements) {
    let template = `
        <div class="story">
            <div class="description">
                ${storyElements}
                ${buttonsElements}
            </div>
        </div>
    `
    return template
}

function displayStory(story) {
    let mp3URL = s3BaseURL + story.title
    $("#stories").append(formatStory(formatMetadata(story), formatControls(story)))
}

function shouldDisplayStory(story) {
    return storyParam === story.name || passwordParam === password  || (story.public === true && !storyParam)
}

async function displayStories() {
    let stories = await fetch('Stories')
    let subjects = await fetch('Subjects')
    let subjectMap = {}
    subjects.forEach( subject => {subjectMap[subject.id] = subject.name})
    
    // console.log(`displaying ${stories.length} stories from ${subjects.length} subjects`)
    stories.forEach(story => {
        if(shouldDisplayStory(story)) {
            // display subject names
            subjectsToDisplay = []
            story.subject.forEach(key => {subjectsToDisplay.push(subjectMap[key])})
            story.subject = subjectsToDisplay.join(', ')
            
            displayStory(story)
        }
    })
}

function fetch(objectType) {
    return $.ajax({
        type: 'POST',
        url: storyMetadataURL,
        dataType: 'json',
        data: JSON.stringify({
            "baseId" : "app0ZJgZxm6LC8rBB",
            "tableName": objectType,
            "action": "select"
        })
    })
    
}

function getQueryVariable(url, variable) {
    var vars = url.split('?')[1].split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

$(document).ready(function(){
    displayStories()
})
