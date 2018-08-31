// Constants
const s3BaseURL = 'https://s3.amazonaws.com/crstories.org/'
const storyMetadataURL = 'https://gpzy1rrcwg.execute-api.us-east-1.amazonaws.com/Prod/'
const windowURL = window.location.href.split('?')[0]
const storyParam = getStoryParam()
const passwordParam = getFromParameterOrLocalStorage('password')
const password = atob('Y2xpbWIgc3VtbWVyIHNhdGlzZmllZCBwbGFuZQ==')
const driveBaseDownloadURL = 'https://drive.google.com/uc?export=download&id='
const subjectParam = getParameterByName('subject')
var subjectMap = {}

function getStoryParam() {
    let string = getParameterByName('story')
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
    
    let driveId = story.hasOwnProperty('imageURL') ? getParameterByName('id', story.imageURL) : defaultImageId[story.gender]
    let imageElements = driveId ? `<div><img class="story-image" src="${driveBaseDownloadURL}${driveId}" /></div>` : ''
    
    // display subject names
    subjectsToDisplay = []
    story.subject.forEach(subjectId => {subjectsToDisplay.push(`<a href="${windowURL}?subject=${subjectId}" class="subject-link">${subjectMap[subjectId]}</a>`)})
    story.subject = subjectsToDisplay.join(', ')
    
    
    return `
      ${imageElements}
      <h2>${story.name}<br />${story.date}</h2>
      <h4 id="subject-heading">${story.subject}</h4>
    `
}

function formatControls(story) {
    let driveId = story.hasOwnProperty('audioURL') ? getParameterByName('id', story.audioURL) : null
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
    if(storyParam) {
        return storyParam === story.name
    }
    
    if (password) {
        return passwordParam === password && (story.subject.includes(subjectParam) || !subjectParam)
    }
    
    return story.public === true
}

async function displayStories() {
    let stories = await fetch('Lessons')
    stories.sort(compareNames)
    let subjects = await fetch('Lesson Subjects')
    subjects.sort(compareNames)
    let subjectHeader = [`<a href="${windowURL}" class="subject-header-item">All</a>`]
    subjects.forEach( subject => {
        subjectMap[subject.id] = subject.name
        subjectHeader.push(`<a href="${windowURL}?subject=${subject.id}" class="subject-header-item">${subject.name}</a>`)
    })
    $("#stories").append(`<div id="subject-header">${subjectHeader.join('\n')}</div>`)

    stories.forEach(story => {
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

    $('#password-button').click(() => {
        let passwordAttempt = $('#password').val()
        window.location.replace(`${windowURL}?password=${passwordAttempt}`)
    })

    $('#loading-indicator').hide(2000)
    if(passwordParam === password) {
        $('#story-container').show(1000)
    } else {
        $('#password-container').show(1000)
    }
})


function compareNames(a,b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}
