exports.properties = {
    port: 8080,
    encryptionKey :"JagaBaliaShreekhetra",
    dbFile:"db.json",
    encryptionEnabled: true,
    // Admin gate (see auth.js). Both must be set for auth to be on; production refuses to start
    // without them. googleClientId must match REACT_APP_GOOGLE_CLIENT_ID in web-app.
    auth: {
        googleClientId: process.env.ZJOURNAL_GOOGLE_CLIENT_ID || "",
        adminEmails: (process.env.ZJOURNAL_ADMIN_EMAILS || "")
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
    },
}
