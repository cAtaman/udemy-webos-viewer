# Udemy Viewer for LG webOS

Personal, unofficial installed app for the LG 55UQ70006LB (webOS 22). This is a hosted-app launcher: its local menu opens Udemy as the top-level page inside the app. It does not launch LG's Web Browser app and does not use AirPlay. The course interface and video player are Udemy's website.

## What has been verified

- Automated tests cover launcher focus navigation, destination selection, and offline recovery.
- Package creation and metadata inspection are checked during the build.
- **Verified on the TV** (LG 55UQ70006LB, webOS 22, firmware 04.60.91, web engine Chrome 87):
  - The app installs, appears in Apps, and launches.
  - The launcher renders with its styles. In a remote-debugging session, arrow-key presses moved focus between the three buttons and wrapped around.
  - Selecting a button opens Udemy inside the app; Udemy's login page loads.
  - Logging in with Google works.
  - Udemy's pages render half-styled, and the remote's arrow keys don't navigate them. See [Known limitations](#known-limitations).
- **Not yet verified on the TV:** email login, session persistence, course playback, full screen, and Back from Udemy's pages.

This prototype is not a native Udemy client. Top-level navigation replaces the launcher document, so our remote-key handler applies only to the launcher. Once Udemy opens, its own interface handles input, and you need a Magic Remote pointer or a USB/Bluetooth mouse or keyboard to operate it. A successful package build does not prove that Udemy allows sign-in or protected video playback on this TV.

## Install on the TV

You need a computer for installation, an LG developer account, and the computer and TV on the same network. After installation, the app runs on the TV.

1. Create/sign in to an account at https://webostv.developer.lge.com/.
2. On the TV, install **Developer Mode** from **Home → Apps**.
3. Open Developer Mode, sign in, turn **Dev Mode Status** on, and allow the TV to reboot.
4. Reopen Developer Mode and turn **Key Server** on. Note the TV's IP address and the displayed passphrase. Enter the passphrase locally when the CLI asks; do not save it in the project.
5. In a computer terminal:

```sh
git clone https://github.com/cAtaman/udemy-webos-viewer.git
cd udemy-webos-viewer
npm ci
npx ares-setup-device
```

In the interactive device setup, choose **add** and enter:

| Field | Value |
| --- | --- |
| name | `webos_tv` |
| device IP | The address shown on your TV |
| port | `9922` |
| user | `prisoner` |
| password | Leave empty |
| description | `LG 55UQ70006LB` |

Then run:

```sh
npx ares-novacom --device webos_tv --getkey
npx ares-device --system-info --device webos_tv
npm run install:tv
npm run launch:tv
```

If the IPK is not present in `dist/`, run `npm run package` before installation, or use a prebuilt one from a release:

### Install a release build

Each [release](https://github.com/cAtaman/udemy-webos-viewer/releases) has a prebuilt IPK, a `SHA256SUMS` file, and a signed build-provenance attestation. To check that the IPK was built by this repository's release workflow, and then install it:

```sh
gh release download v0.1.1 --repo cAtaman/udemy-webos-viewer --dir dist
gh attestation verify dist/com.ataman.udemyviewer_0.1.1_all.ipk --repo cAtaman/udemy-webos-viewer
npx ares-install --device webos_tv dist/com.ataman.udemyviewer_0.1.1_all.ipk
```

Open **Udemy Viewer** from the TV's Apps menu. Select **Sign in**, sign in directly on Udemy's page, and navigate to your learning library. The launcher does not receive, store, or proxy your password. HTTPS authentication/session handling belongs to Udemy and the TV runtime.

On the launcher, arrow keys move between buttons and OK opens the selection. Back is delegated to the webOS history handler; behavior after Udemy redirects needs device testing. Press Home and relaunch the app if you need to return to the launcher.

**Developer Mode expires.** Extend its session in the TV's Developer Mode app before the displayed remaining time runs out. LG says developer-installed apps are uninstalled when Developer Mode is disabled; this is not a permanent Content Store installation.

## Device acceptance test

1. Confirm Udemy Viewer installs and appears in Apps.
2. Use arrows and OK to open Sign in.
3. Complete login on Udemy. Google login is verified on the TV; email and other providers aren't yet.
4. Open a purchased course and play a lesson for at least two minutes; check picture and sound.
5. Check pause, seek, full screen, subtitles, next lesson, and Back.
6. Close/relaunch and check whether login persists. Persistence is not guaranteed.
7. If login or playback fails, record the on-screen error, firmware version, and exact step. Do not send passwords, cookies, or tokens.

The app cannot repair a Udemy device block or DRM incompatibility, and it does not modify Udemy's website, spoof the TV user agent, extract course videos, or bypass login.

## Known limitations

**Udemy's pages look half-styled on the TV.** The TV's web engine is Chrome 87. Udemy defines its colors with CSS `oklch()` and `color-mix()`, which need Chrome 111 or newer, so the TV drops them. Layout and fonts still apply, but inputs have no borders, buttons have no fill, and links use the browser's default blue. This is not a dark-mode issue, and the app can't fix it: once Udemy opens, the page is Udemy's, and the app has no way to restyle it. Only a newer TV web engine fixes this.

**The remote's arrow keys don't navigate Udemy's pages.** The arrow keys work on the launcher. On Udemy's pages the key presses arrive, but Udemy's site doesn't use them to move focus; it supports keyboard navigation only with Tab, which a TV remote doesn't send. The app can't add arrow-key navigation: it can't run code on Udemy's pages, Udemy's login and learning pages refuse to load inside a frame (`X-Frame-Options: DENY`), and webOS has no app setting for it. To use Udemy, connect one of these:

- An LG Magic Remote (sold separately if your TV came with the basic remote), to point and click. Pressing an arrow key hides the pointer; move or shake the remote to bring it back. If the pointer never appears while the buttons still work, the remote isn't paired: point it at the TV, hold **Home** and **Back** for about 5 seconds until its light blinks, then press the wheel.
- A USB or Bluetooth mouse.
- A USB or Bluetooth keyboard: Tab and Shift+Tab move between controls, and Enter selects.

## Build and inspect

```sh
npm ci
npm test
npm run package
npx ares-package --info dist/com.ataman.udemyviewer_0.1.1_all.ipk
```

To use your own icons in a local build, put `icon.png` (80×80) and `large-icon.png` (130×130) in `local/icons/`. `npm run package` uses them in place of the committed icons. `local/` is gitignored, so they're never committed or used by release builds.

## Run in the simulator

The webOS TV simulator runs the `app/` directory directly, so there is no package or install step. Its web engine is much newer than the TV's Chrome 87, so check changes on the TV too (see [Known limitations](#known-limitations)).

1. Download the webOS TV 26 simulator from https://webostv.developer.lge.com/develop/tools/simulator-installation and unzip it. Keep the app's original name (`webOS_TV_26_Simulator_<version>.app`); `ares-launch` doesn't find it under any other name.
2. Register its location once. The CLI saves the path and launches the app:

   ```sh
   npx ares-launch -s 26 -sp ~/Applications/webOS_TV_26_Simulator_1.5.0 app
   ```

3. After that, launch with:

   ```sh
   npm run launch:sim
   ```

## Inspect

To inspect a running TV app:

```sh
npx ares-inspect --device webos_tv --app com.ataman.udemyviewer
```

Use the inspector locally. Logs may include account/session information; redact them before sharing.

## Remove

```sh
npx ares-install --device webos_tv --remove com.ataman.udemyviewer
```

## References

- Hosted app model: https://webostv.developer.lge.com/develop/getting-started/web-app-types
- Developer Mode setup and expiry: https://webostv.developer.lge.com/develop/getting-started/developer-mode-app
- CLI installation: https://webostv.developer.lge.com/develop/tools/cli-installation
- Package/install commands: https://webostv.developer.lge.com/develop/tools/cli-dev-guide

This project is not affiliated with Udemy or LG.
