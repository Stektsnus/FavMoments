const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Require handlebars (Framework for html templates)
const exphbs = require("express-handlebars");

const app = express();
//const router = express.Router();
const port = process.env.PORT || 8080;

// Set up middleware Multer for processing upload files
// Source: https://www.youtube.com/watch?v=EVOFt8Its6I
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: fileStorageEngine});

// Body parser. Used to be able to access data from the req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Function for detecting if a json object is empty
function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

function loadImages() {
    let data = fs.readFileSync("./Images.json");
    if (isEmptyObject(data)) {
        let emptyImage = {
            name: "",
            filename: "",
            description: "",
            path: ""
        }
        jsonString = JSON.stringify([emptyImage], null, 2);
        fs.writeFile("./Images.json", jsonString, err => {
            if (err) {
                console.log("Error writing file", err);
            } else {
                console.log("Created empty list in empty Images.json successfully.");
            }
        });
        let newData = fs.readFileSync("./Images.json");
        return (newData);

    } else {
        data = JSON.parse(data);
        return data;
    }
    
}

function loadAlbums() {
    let data = fs.readFileSync("./Albums.json");
    if (isEmptyObject(data)) {
        let allImages = {
            name: "All Images",
            description: "",
            images: []
        }
        jsonString = JSON.stringify([allImages], null, 2);
        fs.writeFile("./Albums.json", jsonString, err => {
            if (err) {
                console.log("Error writing file", err);
            } else {
                console.log("Created empty list in empty Albums.json successfully.");
            }
        });
        data = fs.readFileSync("./Albums.json");
        return (data);
    } else {
        data = JSON.parse(data);
        return data;
    }
}


// Set up the view engine where html content will be set up
// Set upp the path to the views folder
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    helpers: { json: function (context) { return JSON.stringify(context); } }
}));
app.set("view engine", "handlebars");

// Set static folder
app.use(express.static(path.join(__dirname + "/public")));
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("index", {
        albums: loadAlbums(),
        images: loadImages(),
        title: "Home"
    });
});

// Retrieve POST data from the form on the "/". 
// Add the data to the albums.json file.
app.post("/", (req, res) => {
    let newAlbumName = req.body.name;
    let albumNames = [];
    loadAlbums().forEach(function (album) {
        albumNames.push(album.name);
    })
    if (newAlbumName == "") {
        res.redirect("/");
        return;
    }
    else if (albumNames.indexOf(newAlbumName) >= 0) {
        res.redirect("/");
        return
    }
    else {
        const newAlbum = {
            name: newAlbumName,
            description: req.body.description,
            images: []
        }
        const oldData = loadAlbums();
        oldData.push(newAlbum);
        jsonString = JSON.stringify(oldData, null, 2);
        fs.writeFile("./Albums.json", jsonString, err => {
            if (err) {
                console.log("Error writing file", err);
            } else {
                console.log("Wrote new album data to Albums.json successfully.");
            }
        });
        res.redirect("/");
    } 
});

// Load the specified album view with all its images.
app.get("/album/:id", (req, res) => {
    let albumID = req.params.id;
    let allAlbums = loadAlbums();
    let allImages = loadImages();
    let displayAlbum;
    let images = [];
    allAlbums.forEach(function (album) {
        if (album.name == albumID) {
            displayAlbum = album;
        }
    });
    allImages.forEach(function (image) {
        if (displayAlbum.images.indexOf(image.path) >= 0) {
            images.push(image);
        }
    });
    
    res.render("album", {
        albumName: albumID,
        description: displayAlbum.description,
        images: images
    });
});



app.post("/album/:id", upload.single("newImageFile"), (req, res) => {
    let currentAlbums = loadAlbums();
    let currentImages = loadImages();
    let pushNewImage = true;
    newImage = {
        name: req.body.name,
        filename: req.file.filename,
        description: req.body.description,
        path: "/images/" + req.file.filename 
    }
    // Loop through albums to find the right album
    // Push the new image to its images if it's not already there
    currentAlbums.forEach(function (album) {
        if (album.name == req.params.id || album.name == "All Images") {
            if (album.images.indexOf(newImage.filename) == -1) {
                album.images.push(newImage.path);
                
            }
        }
    });
    jsonString = JSON.stringify(currentAlbums, null, 2);
    fs.writeFile("./Albums.json", jsonString, err => {
        if (err) {
            console.log("Error writing file", err);
        } else {
            console.log("Wrote new album data to Images.json successfully.");
        }
    });

    // Loop through all currently uploaded images
    // If there is no image with the same path name push the new image
    currentImages.forEach(function (image) {
        if (image.filename == newImage.filename) {
            pushNewImage = false;
        }
    });
    if (pushNewImage == true) {
        currentImages.push(newImage);
        jsonString = JSON.stringify(currentImages, null, 2);
        fs.writeFile("./Images.json", jsonString, err => {
            if (err) {
                console.log("Error writing file", err);
            } else {
                console.log("Wrote new image data to Images.json successfully.");
            }
        });
    }

    res.redirect("back");
});

app.post("/album/delete/images/:id", (req, res) => {
    let deleteImage = req.body.path;
    let currentAlbums = loadAlbums();
    let currentImages = loadImages();
    currentAlbums.forEach((album) => {
        for (var i = 0; i < album.images.length; i++) {
            if (album.images[i] == deleteImage) {
                album.images.splice(i, 1);
            }
        }
    });
    for (var i = 0; i < currentImages.length; i++) {
        if (currentImages[i].path == deleteImage) {
            currentImages.splice(i, 1);
            fs.unlinkSync("./public" + deleteImage);
        }
    }
    jsonString = JSON.stringify(currentAlbums, null, 2);
    fs.writeFile("./Albums.json", jsonString, err => {
        if (err) {
            console.log("Error writing file", err);
        } else {
            console.log("Wrote new album data to Albums.json successfully.");
        }
    });
    jsonString = JSON.stringify(currentImages, null, 2);
    fs.writeFile("./Images.json", jsonString, err => {
        if (err) {
            console.log("Error writing file", err);
        } else {
            console.log("Wrote new data to Images.json successfully.");
        }
    });
    res.redirect("back");
});

app.listen(port, () => console.log("listening on port: " + port));