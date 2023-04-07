# Addressable DWN

This shows how to run a Decentralized Web Node (DWN) that is publicly addressable. This is useful for demos and testing.

## System Dependencies

This build depends on the [`g++`](https://man7.org/linux/man-pages/man1/g++.1.html) compiler, GNU's C++ compiler impl. When not available on the system, you may find in your error logs:

```
npm ERR! make: g++: No such file or directory
```

To fix, ensure `g++` is available on your system:

### MacOS
Install [Xcode Command Line tools](https://mac.install.guide/commandlinetools/4.html).

### Linux

#### Fedora / RHEL
`sudo dnf install -y g++`

For other platforms, use your appropriate repository manager, for instance `yum`, `apt-get`, or `deb`.

### Windows

In Windows Subsystem for Linux (WSL): `sudo apt-get install build-essential gdb`. (Untested; please open issue or PR to validate/correct and update this documentation!)

## How to Run

```bash
npm install --install-links # --install-links installs `message-store-level-v2` which was built in the [pre-requisites](../README.md#pre-requisites-just-do-once)

node src/index.js
```