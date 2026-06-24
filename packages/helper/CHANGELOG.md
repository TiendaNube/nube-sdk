# Changelog

All notable changes to `@tiendanube/nube-sdk-helper` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1]

### Fixed

- `onPage` now subscribes to the `page:loaded` event instead of `location:updated`, ensuring the handler reliably runs once the SDK is ready on every page load.

## [0.1.0]

- Initial release.
