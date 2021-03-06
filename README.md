# Wordbots

[![CircleCI](https://img.shields.io/circleci/project/github/wordbots/wordbots-core/master.svg)](https://circleci.com/gh/wordbots/wordbots-core)
[![Test Coverage](https://codeclimate.com/github/wordbots/wordbots-core/badges/coverage.svg)](https://codeclimate.com/github/wordbots/wordbots-core/coverage)
[![Code Climate](https://codeclimate.com/github/wordbots/wordbots-core/badges/gpa.svg)](https://codeclimate.com/github/wordbots/wordbots-core)
[![Dependency Status](https://www.versioneye.com/user/projects/58e73f0926a5bb0052203185/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/58e73f0926a5bb0052203185)
[![NSP Status](https://nodesecurity.io/orgs/wordbots/projects/5d6bd7c0-460e-45f0-93a4-d671ca75fd39/badge)](https://nodesecurity.io/orgs/wordbots/projects/5d6bd7c0-460e-45f0-93a4-d671ca75fd39)
[![Discord badge](https://img.shields.io/discord/301800217055985665.svg)](http://discord.wordbots.io)
<!---
  [![Greenkeeper badge](https://badges.greenkeeper.io/wordbots/wordbots-core.svg)](https://greenkeeper.io/)
--->

[![Support Wordbots on Patreon!](http://imgur.com/q7lBCUn.png)](https://www.patreon.com/wordbots)

## Development installation

```
$ yarn install
$ yarn start
```

Then visit `http://localhost:3000`.

## Releasing to production

Production has Devtools, logging and hot reloading middleware removed
and the scripts/css compressed.

```
$ yarn run build
$ yarn run start-prod
```

Then visit `http://localhost:3000`.

## Lint and test

```
$ node_modules/eslint/bin/eslint.js . --fix && yarn test -- --coverage
```

## Acknowledgements

Some code taken from the following (all MIT licensed):

* [`redux-react-material-boilerplate`](https://github.com/WapGeaR/redux-react-material-boilerplate)
* [`react-hexgrid`](https://github.com/hellenic/react-hexgrid)
* notsurt's [`spritegen`](https://github.com/not-surt/spritegen)
* gimenete's [`identicons-react`](https://github.com/gimenete/identicons-react)
