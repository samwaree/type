# [type](https://type.samware.dev)

**Based on [typings.gg](https://github.com/briano1905/typings)**

A simple typing test website.

# Report a bug or submit a feature request

If you find a bug or want to submit a feature request, create an issue on this GitHub repo.

# Setup

Download and install [npm](https://www.npmjs.com/get-npm) and clone repository.

Run `npm install` in project root folder.

Create a [Firebase](https://firebase.google.com/) project, and create a new file under `src/` called `init.dev.js`. Copy the contents from `init.js`, but replace the `firebaseConfig` variable contents with the content from your Firebase project.

Run `npm run build-dev` to build the code and start up webpack to watch. Anytime you save files in `src/`, webpack will rebuild.

Your site is now built in the `dist/` directory and you view it by opening `dist/index.html`
