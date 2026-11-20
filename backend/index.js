
require("dotenv").config();

const express = require("express");
const { randomBytes } = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

function buildShortUrl(shortCode) {
    const baseUrl = BASE_URL.replace(/\/+$/, "");
    return `${baseUrl}/${shortCode}`;
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.use(express.json());

// Generate a unique short code
function generateShortCode() {
    return randomBytes(4).toString("hex");
}

// Validate submitted URLs
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

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "URL Shortener API is running!"
    });
});

// Create a short URL
app.post("/api/urls", async (req, res) => {
    try {
        const validUrl = validateUrl(req.body.longUrl);

        if (!validUrl) {
            return res.status(400).json({
                error: "Invalid URL"
            });
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            const shortCode = generateShortCode();

            const { data, error } = await supabase
                .from("urls")
                .insert({
                    long_url: validUrl,
                    short_code: shortCode
                })
                .select("long_url, short_code, clicks, created_at")
                .single();

            if (!error) {
                return res.status(201).json({
                    message: "URL shortened successfully",
                    longUrl: data.long_url,
                    shortCode: data.short_code,
                    shortUrl: buildShortUrl(data.short_code)
                });
            }

            if (error.code !== "23505") {
                console.error(error);

                return res.status(500).json({
                    error: "Failed to save URL"
                });
            }
        }

        return res.status(500).json({
            error: "Could not generate a unique short code"
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Get all short URLs
app.get("/api/urls", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("urls")
            .select("long_url, short_code, clicks, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);

            return res.status(500).json({
                error: "Failed to retrieve URLs"
            });
        }

        return res.status(200).json({
            count: data.length,
            urls: data.map((url) => ({
                longUrl: url.long_url,
                shortCode: url.short_code,
                shortUrl: buildShortUrl(url.short_code),
                clicks: url.clicks,
                createdAt: url.created_at
            }))
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Delete a short URL
app.delete("/api/urls/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        const { data, error } = await supabase
            .from("urls")
            .delete()
            .eq("short_code", shortCode)
            .select("short_code")
            .maybeSingle();

        if (error) {
            console.error(error);

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
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Public redirect and click tracking
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        const { data, error } = await supabase.rpc(
            "increment_url_clicks",
            { p_short_code: shortCode }
        );

        if (error) {
            console.error(error);

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
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${BASE_URL}`);
});
