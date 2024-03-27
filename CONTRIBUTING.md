# How to Contribute

## Report a problem or suggestion

Go to our [issue tracker](https://github.com/oliver-moran/jimp/issues) and check if your problem/suggestion is already reported.
If not, create a new issue with a descriptive title and detail your suggestion or steps to reproduce the problem.

If you are reporting a bug, please point the environment where you find it. (Node.js on GNU/Linux Distro, Firefox on windows, Electron on Mac, Chrome on Android,...)
If you can, please confirm if the bug happens in other environments and list it.

## Filter Issues

You can help answering issue questions; maturing or voting on feature suggestions; confirming bug reports and adding more information to then. You can help a lot locating the bug source and proposing test code to prevent regression bug.

## Contribute to the code

If you know how to code, we welcome you to send fixes and new features, but in order to be efficient we ask you to follow the following procedure:

- Fork this repo;
- Clone your forked repo locally;
- Code your changes (if you want to implement many features do each one in a separated branch);
- Write tests to ensure your feature works as expected and protect its behavior on future changes;
- Test it! Ensure you don't crash Jimp in Node.js or Browser environments;
  - Full test with `pnpm run test` will also produce a coverage report.
  - For more option, see the "[Testing](#testing)" topic bellow.
- Push to your forked repo;
- Make your pull request.

### Developing

```sh
pnpm i # install and link all packages in monorepo

# Build all the packages
pnpm run build
```

### Testing

We use vitest to test the code.

```sh
# Run all tests
pnpm run test

# Run a package's tests
cd packages/core
pnpm run test
```

### Docs

```sh
# Build the docs
cd packages/docs
pnpm run start
```

## Collaborators are Welcome

See [Oliver's call from jan/2017](https://github.com/oliver-moran/jimp/issues/219).
And read the [Community Maintainer Guidelines](https://github.com/oliver-moran/jimp/issues/223).
