
require("dotenv").config();

const express = require("express");
const { randomBytes } = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const BASE_URL = (
    process.env.BASE_URL || `http://localhost:${PORT}`
).replace(/\/+$/, "");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_KEY in environment variables."
    );
}

app.use(express.json({ limit: "10kb" }));

// Create stateless Supabase clients
function createServerSupabase(headers = {}) {
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        },
        global: {
            headers
        }
    });
}

// Public Supabase client
const supabase = createServerSupabase();

// Create a Supabase client for an authenticated user
function getUserSupabase(token) {
    return createServerSupabase({
        Authorization: `Bearer ${token}`
    });
}

// Authentication Middleware
async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer\s+(\S+)\s*$/i);

    if (!match) {
        return res.status(401).json({
            error: "Authentication required"
        });
    }

    const token = match[1];

    try {
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                error: "Invalid or expired token"
            });
        }

        req.user = data.user;
        req.supabase = getUserSupabase(token);

        return next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            error: "Unable to verify authentication"
        });
    }
}

// Generate a unique short code
function generateShortCode() {
    return randomBytes(4).toString("hex");
}

// Validate URL
function validateUrl(longUrl) {
    try {
        if (
            typeof longUrl !== "string" ||
            !longUrl.trim() ||
            /\s/.test(longUrl)
        ) {
            return null;
        }

        const parsedUrl = new URL(longUrl);

        if (
            !["http:", "https:"].includes(parsedUrl.protocol) ||
            !parsedUrl.hostname.includes(".") ||
            parsedUrl.username ||
            parsedUrl.password
        ) {
            return null;
        }

        return parsedUrl.href;

    } catch {
        return null;
    }
}

// Health Check
app.get("/", (req, res) => {
    return res.status(200).json({
        message: "URL Shortener API is running!"
    });
});

// Sign Up
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            password.length < 8
        ) {
            return res.status(400).json({
                error: "A valid email and a password of at least 8 characters are required"
            });
        }

        const authClient = createServerSupabase();

        const { data, error } = await authClient.auth.signUp({
            email: email.trim().toLowerCase(),
            password
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(201).json({
            message: "User registered successfully",

            user: data.user
                ? {
                    id: data.user.id,
                    email: data.user.email
                }
                : null,

            emailConfirmationRequired: !data.session,

            session: data.session
                ? {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token
                }
                : null
        });

    } catch (error) {
        console.error("Sign-up error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const authClient = createServerSupabase();

        const { data, error } =
            await authClient.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password
            });

        if (error || !data.session) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        return res.status(200).json({
            message: "Login successful",

            user: {
                id: data.user.id,
                email: data.user.email
            },

            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Refresh Access Token
app.post("/api/auth/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body || {};

        if (
            typeof refreshToken !== "string" ||
            !refreshToken.trim()
        ) {
            return res.status(400).json({
                error: "Refresh token is required"
            });
        }

        const authClient = createServerSupabase();

        const { data, error } = await authClient.auth.refreshSession({
            refresh_token: refreshToken.trim()
        });

        if (error || !data.session) {
            return res.status(401).json({
                error: "Invalid or expired refresh token"
            });
        }

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
        });

    } catch (error) {
        console.error("Token refresh error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Create a Shortened URL
app.post("/api/urls", authenticateUser, async (req, res) => {
    try {
        const { longUrl } = req.body || {};
        const validUrl = validateUrl(longUrl);

        if (!validUrl) {
            return res.status(400).json({
                error: "Invalid URL"
            });
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            const shortCode = generateShortCode();

            const { data, error } = await req.supabase
                .from("urls")
                .insert({
                    long_url: validUrl,
                    short_code: shortCode,
                    user_id: req.user.id
                })
                .select("long_url, short_code")
                .single();

            if (!error) {
                return res.status(201).json({
                    message: "URL shortened successfully",
                    longUrl: data.long_url,
                    shortCode: data.short_code,
                    shortUrl: `${BASE_URL}/${data.short_code}`
                });
            }

            if (error.code !== "23505") {
                console.error("Create URL error:", error);

                return res.status(500).json({
                    error: "Failed to save URL"
                });
            }
        }

        return res.status(500).json({
            error: "Could not generate a unique short code"
        });

    } catch (error) {
        console.error("Create URL error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Get the Authenticated User's URLs
app.get("/api/urls", authenticateUser, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from("urls")
            .select("long_url, short_code, clicks, created_at")
            .eq("user_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Get URLs error:", error);

            return res.status(500).json({
                error: "Failed to retrieve URLs"
            });
        }

        return res.status(200).json({
            count: data.length,
            urls: data
        });

    } catch (error) {
        console.error("Get URLs error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Delete an Authenticated User's URL
app.delete(
    "/api/urls/:shortCode",
    authenticateUser,
    async (req, res) => {
        try {
            const { shortCode } = req.params;

            const { data, error } = await req.supabase
                .from("urls")
                .delete()
                .eq("short_code", shortCode)
                .eq("user_id", req.user.id)
                .select("short_code")
                .maybeSingle();

            if (error) {
                console.error("Delete URL error:", error);

                return res.status(500).json({
                    error: "Failed to delete URL"
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: "Short URL not found"
                });
            }

            return res.status(200).json({
                message: "URL deleted successfully",
                shortCode: data.short_code
            });

        } catch (error) {
            console.error("Delete URL error:", error);

            return res.status(500).json({
                error: "Internal server error"
            });
        }
    }
);

// Public Redirect Route
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        const { data, error } = await supabase.rpc(
            "increment_url_clicks",
            {
                p_short_code: shortCode
            }
        );

        if (error) {
            console.error("Redirect error:", error);

            return res.status(500).json({
                error: "Failed to process short URL"
            });
        }

        if (!data) {
            return res.status(404).json({
                error: "Short URL not found"
            });
        }

        return res.redirect(302, data);

    } catch (error) {
        console.error("Redirect error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Handle Invalid JSON and Other Errors
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            error: "Invalid JSON body"
        });
    }

    console.error("Unhandled application error:", error);

    return res.status(500).json({
        error: "Internal server error"
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on ${BASE_URL}`);
});
