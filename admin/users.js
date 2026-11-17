// Staff accounts for the demo admin area. Only salted PBKDF2 hashes are stored here, never passwords.
// The plain passwords live in the git-ignored autolytics-website-e2e/.env file and in GitHub Actions secrets.
window.AUTOLYTICS_USERS = [
  { username: 'shakeel', role: 'editor', salt: '960b0546548a3091b3ea14121ea4fec7', hash: '7145cc15cad356612aecf1c7fcbea3454d0b196b9e44f93f23f412f90780b939', iterations: 150000 },
  { username: 'reviewer', role: 'viewer', salt: '9be048d01d946031ac60bd0366a5144c', hash: 'e37e410f2f1226b9b68a8382d65eff861de56c659e2d5da102d5814d5f132ec1', iterations: 150000 },
];
