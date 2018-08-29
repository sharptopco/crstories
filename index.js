// Constants
const s3BaseURL = 'https://s3.amazonaws.com/crstories.org/'
const storyMetadataURL = 'https://gpzy1rrcwg.execute-api.us-east-1.amazonaws.com/Prod/'
const windowURL = window.location.href.split('?')[0]
const storyParam = getStoryParam()
const passwordParam = getFromParameterOrLocalStorage('password')
const password = '1MomentStrongSitUnder'

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
    return `
      <h2>${story.name}<br />${story.date}</h2>
      <h4>${story.subject}</h4>
    `
}

function formatButtons(shareURL, url) {
    return `
        <div>
            <a href onclick="copyShareLink('${shareURL}')"><span class="button">Share</span></a>
            <a href="${url}"><span id="listen-now" class="button">Listen</span></a>
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
    let sharingURL = windowURL + '?storyParam=' + btoa(story.title)
    $("#stories").append(formatStory(formatMetadata(story), formatButtons(sharingURL, mp3URL)))
}

function shouldDisplayStory(story) {
    return storyParam === story.title || passwordParam === password  || (story.public === true && !storyParam)
}

async function displayStories() {
    let stories = await fetch('Stories')
    let subjects = await fetch('Subjects')
    let subjectMap = {}
    subjects.forEach( subject => {subjectMap[subject.id] = subject.name})
    
    // console.log(`displaying ${stories.length} stories from ${subjects.length} subjects`)
    stories.forEach(story => {
        subjectsToDisplay = []
        story.subject.forEach(key => {subjectsToDisplay.push(subjectMap[key])})
        story.subject = subjectsToDisplay.join(', ')
        if(shouldDisplayStory(story)) {
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

$(document).ready(function(){
    displayStories()
})
