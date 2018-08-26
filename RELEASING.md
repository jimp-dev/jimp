# Releasing Jimp

Make sure to have a `GITHUB_AUTH` token set. And are logged into NPM.

```sh
export GITHUB_AUTH=YOUR_PERSONAL_ACCESS_TOKEN
```

Determine the new version by looking at PR labels and using semantic versioning.

| label       | version | bump  |
| ----------- | ------- | ----- |
| bug         | patch   | 0.0.1 |
| enhancement | minor   | 0.1.0 |
| breaking    | major   | 1.0.0 |

Run the following command to bump all package versions.

```sh
yarn publish:packages [patch || minor || major]
```
