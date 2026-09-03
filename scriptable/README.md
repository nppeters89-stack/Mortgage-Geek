# Scriptable scripts

Source of truth for the phone-side scripts and for the device-token
allowlist.

- `Geek Log.js` is the home/lock screen widget. It authenticates with
  `Authorization: Bearer` using the token stored in the Scriptable
  Keychain under `geeklog-device-token` (setup snippet in the file's
  header comment). It calls exactly `GET /api/geeklog/activity`; the
  server allows the device token on that endpoint and nothing else.
- `AddRealtorContact.js` makes no network calls and holds no secrets;
  it adds a prospect to iOS Contacts from the PWA deep link or the
  share sheet.

To change what the device token may reach, change both the server
allowlist (`authorize` options in the api handlers) and this note.
