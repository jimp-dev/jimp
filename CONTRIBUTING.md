How to Contribute
=================

Report a problem or suggestion
------------------------------

Go to our [issue tracker](https://github.com/oliver-moran/jimp/issues) and check if your problem/suggestion is already reported.
If not, create a new issue with a descriptive title and detail your suggestion or steps to reproduce the problem.

If you are reporting a bug, please point the environment where you find it. (Node.js on GNU/Linux Distro, Firefox on windows, Electron on Mac, Chrome on Android,...)
If you can, please confirm if the bug happens in other environments and list it.


Filter Issues
-------------

You can help answering issue questions; maturing or voting on feature suggestions; confirming bug reports and adding more information to then. You can help a lot locating the bug source and proposing test code to prevent regression bug.


Contribute to the code
----------------------

If you know how to code, we welcome you to send fixes and new features, but in order to be efficient we ask you to follow the following procedure:

* Fork this repo;
* Clone your forked repo locally;
* Code your changes (if you want to implement many features do each one in a separated branch); 
* Write tests to ensure your feature works as expected and protect its behavior on future changes;
* Test it! Ensure you don't crash Jimp in Node.js or Browser environments;
  * Full test with `npm test` will also produce a coverage report.
  * For more option, see the "[Testing](#testing)" topic bellow.
* Push to your forked repo;
* Make your pull request.


### Testing

The test framework runs at Node.js and browsers environments. Just run `npm test` to test in node and browser environments.
You can use the coverage report to help with missed tests, but you must be aware: it only shows if a line of code was evaluated while testing, not if all relevant test cases was done to protect the feature behavior.

While developing you may want to test only on node.js:
```
$ run test:node:once
```
...or only one test file:
```
$ run test:node:run test/some.test.js
```
...or run each time a file changes:
```
$ run test:node:watch
```
...or test only in a specific browser:
```
$ npm run test:browser:once -- --browsers Firefox
```
For more options and project management tools see: `npm run`


Collaborators are Welcome
-------------------------

See [Oliver's call from jan/2017](https://github.com/oliver-moran/jimp/issues/219).
And read the [Community Maintainer Guidelines](https://github.com/oliver-moran/jimp/issues/223).

