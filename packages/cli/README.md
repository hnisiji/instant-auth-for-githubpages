# @instant-lock/cli

CLI tool for Instant Lock.
This tool encrypts all resources (including images, JS, CSS) in your static site and generates the necessary bootstrap files (Service Worker and Login Page).
The encrypted resources are decrypted in the browser after entering the password, creating a password-protected experience that superficially resembles Basic Authentication.

## Usage

You can run this tool directly using `npx`:

```bash
npx @instant-lock/cli encrypt --input <input-dir> --output <output-dir> --password <password> --title <site-title>
```

### Options

- `-i, --input <dir>`: Input directory containing your static site files (default: "dist")
- `-o, --output <dir>`: Output directory for encrypted files (default: "encrypted_dist")
- `-p, --password <password>`: Password to protect the site
- `-t, --title <title>`: Title for the login page (default: "Protected Site")

## Example

```bash
npx @instant-lock/cli encrypt -i ./docs -o ./encrypted -p mysecretpassword -t "My Private Docs"
```

This will encrypt all files in `./docs` and output them and the password input page to `./encrypted`.

## License

MIT
