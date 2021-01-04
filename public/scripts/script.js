/*
 * When the page loads add eventlisteners to all albumholders
 * to change background.
 */ 
window.onload = function () {
    changeBackground();
};

// These variables are neccessary for keeping track of albums and images inside the script file.
// This is used to send data to the server so that the server can update the Albums.json and Images.json files.
// It is also used for getting information about albums to the script file from the server.
const albums = [];
const images = [];

// Random number generator (inclusive of both min and max) evenly distributed
// Source: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function loadAlbums(elementID, images) {
    albums.push({ elementID, images });
}

function loadImages(imageName, imageDescription, imagePath) {
    images.push({ imageName, imageDescription, imagePath });
}

function changeBackground() {
    albums.forEach(function (album) {
        let newURL = album.images[getRandomInt(0, album.images.length - 1)];
        document.getElementById(album.elementID).style.backgroundImage = 'url("' + newURL + '")';
    })
};


function displayPopUpForm(element) {
    if (element.classList[0] == "albumHolder") {
        elements = document.getElementsByClassName("albumHolder");
        
    } else {
        elements = document.getElementsByClassName("imageHolder");
    }
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add("hidden");
    }
    
    document.getElementsByClassName("formPopUp")[0].classList.remove("hidden");
}

function hidePopUpForm(element) {
    document.getElementsByClassName("formPopUp")[0].classList.add("hidden");
    if (element.classList[0] == "albumFormButton") {
        elements = document.getElementsByClassName("albumHolder");
    } else {
        elements = document.getElementsByClassName("imageHolder");
    }
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("hidden");
    }
    document.getElementsByClassName("formContainer")[0].reset();
}

function goToAlbumPage(element) {
    
    location.replace(`/album/${element.id}`);
}

// Making the background of the albumholders display the different pictures of the album.
setInterval(changeBackground, 3000);

// Lightbox for the album page
// source: https://www.youtube.com/watch?v=uKVVSwXdLr0

function showLightBox(imageURL, imageDescription, event) {
    lightBox.classList.add("active");
    document.getElementById("lightBoxImage").style.backgroundImage = 'url("' + imageURL + '")';
    document.getElementById("lightBoxText").innerHTML = imageDescription;
} 

function removeLightBox(element) {
    element.classList.remove("active");
}

// Creates a dynamic form in order to send a post request to the server
// This to delete the requested image from the server
// Source: https://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit


function deleteImage(element, event, method="post") {
    event.stopPropagation();
    var result = confirm("Want to delete?")
    if (result) {
        const form = document.createElement('form');
        form.method = method;
        form.action = "/album/delete" + element.split(".")[0];
        const hiddenField = document.createElement('input');
        hiddenField.type = "hidden";
        hiddenField.name = "path";
        hiddenField.value = element;
        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    } 
}