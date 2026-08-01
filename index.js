const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// আসল ব্যাকএন্ড বেস ইউআরএল
const OFFICIAL_API_BASE = 'https://api.storymax.app';

app.use(cors());
app.use(express.json());

// ১. কমন হেডার জেনারেটর (আসল অ্যাপের হেডারের সাথে ম্যাচ করে)
const getOfficialHeaders = (req) => {
    return {
        'authorization': req.headers['authorization'] || '',
        'deviceid': req.headers['deviceid'] || 'acac549b0ef02489',
        'appversion': req.headers['appversion'] || '17',
        'platform': '0',
        'os': 'Android 16 (API 36)',
        'ep_session_id': req.headers['ep_session_id'] || '',
        'ts': Math.floor(Date.now() / 1000).toString(),
        'network_type': 'CELLULAR',
        'user-agent': 'ktor-client',
        'accept': 'application/json',
        'content-type': 'application/json'
    };
};

// ==========================================
// 📌 ENDPOINT 1: Fetch Episode List
// ==========================================
app.get('/api/episode/list/:showId', async (req, res) => {
    try {
        const { showId } = req.params;
        const response = await axios.get(`${OFFICIAL_API_BASE}/feedservice/v1/episode/list/${showId}`, {
            headers: getOfficialHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching episode list:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.message,
            data: error.response?.data || null
        });
    }
});

// ==========================================
// 📌 ENDPOINT 2: Fetch Episode Stream Metadata
// ==========================================
app.get('/api/episode/metadata/:showId', async (req, res) => {
    try {
        const { showId } = req.params;
        const { cursor, dir } = req.query;

        let targetUrl = `${OFFICIAL_API_BASE}/feedservice/v1/episode/metadata/${showId}`;
        
        // পেজিনেশন প্যারামিটার থাকলে যোগ করবে
        if (cursor && dir) {
            targetUrl += `?cursor=${cursor}&dir=${dir}`;
        }

        const response = await axios.get(targetUrl, {
            headers: getOfficialHeaders(req)
        });
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching stream metadata:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.message,
            data: error.response?.data || null
        });
    }
});

// ==========================================
// 📌 ENDPOINT 3: Suggested Shows
// ==========================================
app.get('/api/suggested/shows', async (req, res) => {
    try {
        const { showId, shuffle } = req.query;
        const targetUrl = `${OFFICIAL_API_BASE}/feedservice/v1/suggested/shows?showId=${showId}&shuffle=${shuffle || 'false'}`;

        const response = await axios.get(targetUrl, {
            headers: getOfficialHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📌 ENDPOINT 4: Update Watched Progress (POST)
// ==========================================
app.post('/api/shows/watched', async (req, res) => {
    try {
        const response = await axios.post(`${OFFICIAL_API_BASE}/feedservice/v1/shows/watched`, req.body, {
            headers: getOfficialHeaders(req)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// সার্ভার স্টার্ট
app.listen(PORT, () => {
    console.log(`🚀 Proxy Server successfully running on port ${PORT}`);
});
