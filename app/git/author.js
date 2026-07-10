// Commit author identity, overridable via env vars (same idea as Git's
// user.name / user.email):
//
//   GITLIGHT_AUTHOR_NAME="Jane Doe" GITLIGHT_AUTHOR_EMAIL="jane@example.com" gitlight commit -m "..."
const DEFAULT_NAME = "Aryan Sharma";
const DEFAULT_EMAIL = "aryanshr293@gmail.com";

function getAuthorIdentity() {
  const name = process.env.GITLIGHT_AUTHOR_NAME || DEFAULT_NAME;
  const email = process.env.GITLIGHT_AUTHOR_EMAIL || DEFAULT_EMAIL;
  return `${name} <${email}>`;
}

module.exports = { getAuthorIdentity };
