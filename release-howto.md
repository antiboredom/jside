# Setup

1. Install wine (and xquartz), instructions [here](http://www.davidbaumgold.com/tutorials/wine-mac/).

# How to make a release

First, it's a good idea to download the latest build of p5 and examples:

```
gulp p5
gulp getExamples
```

Update the version number in `package.json` and `public/package.json`
```
"version": "0.5.7",
```

**Very important: do NOT push to master yet!**

Next, run the build task.

```
gulp build
```
This should create a new folder `dist/p5 - v[VERSION_NUMBER]` with your build. Test it out and make sure that nothing is busted. Things that should always be tested manually are:
* playing mp4s/mp3s
* serial communication
* the version number in the about window

Zip the release:
```
gulp latest
```
This will create zip files of the Mac and Windows releases and put them in `dist/latest`.

Then, make a new release on github.

* Make the tag look like this: `v0.5.8`
* And the title look like this: `p5.js Editor v0.5.8`
* Upload the zips to the release
* Save

Finally, push to github. Again, it's very important that you only push AFTER you make the release. The editor reads the version number from github to determine when users should be prompted to download a new version. There is probably a smarter way to do this, but that's how it works now.




