# FavMoments

A simple website for publishing and viewing your favourite pictures in the browser.

Create a new album and fill upload images to it.

The program will automatically create and fill an album with all uploaded pictures in it.

If you want to delete a picture from the server - navigate to an album and click the delete icon on top of the desired image.

The program stores the uploaded images in ./public/images.
Information about the created albums and the uploaded images are stored in the Albums.json and Images.json respectively.

Disclaimer:
	The code is not yet fully refactored and there is currently no functionality to remove an album. 
	If you wish to remove an album you will have to do it manually inside the Albums.json file.

Stack:
	The backend is written in node.js express with the templating language handlebars.

	The frontend is written in handlebars, vanilla JS and css.