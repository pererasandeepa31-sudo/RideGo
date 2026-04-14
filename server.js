const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- DATA ---------------- */
let data = {
    users: [],
    drivers: [],
    bookings: [],
    driverLocation: { lat: 6.9271, lng: 79.8612 }
};

if (fs.existsSync("data.json")) {
    try {
        data = JSON.parse(fs.readFileSync("data.json"));
    } catch {}
}

let users = data.users;
let drivers = data.drivers;
let bookings = data.bookings;
let driverLocation = data.driverLocation;

/* ---------------- SAVE ---------------- */
function saveData() {
    fs.writeFileSync("data.json", JSON.stringify({
        users,
        drivers,
        bookings,
        driverLocation
    }, null, 2));
}

/* ---------------- PRICE ---------------- */
function calcPrice(km) {
    return km * 250;
}

/* ---------------- REGISTER ---------------- */
app.post("/register", (req, res) => {
    if (req.body.type === "user") users.push(req.body);
    if (req.body.type === "driver") drivers.push(req.body);

    saveData();
    res.json({ ok: true });
});

/* ---------------- LOGIN ---------------- */
app.post("/login", (req, res) => {
    let list = req.body.type === "user" ? users : drivers;
    let found = list.find(u => u.phone === req.body.phone);

    if (found) return res.json({ success: true, user: found });

    res.json({ success: false });
});

/* ---------------- BOOK RIDE ---------------- */
app.post("/book", (req, res) => {

    const ride = {
        id: Date.now(),
        pickup: req.body.pickup,
        drop: req.body.drop,
        ride: req.body.ride,
        km: req.body.km || 5,
        price: calcPrice(req.body.km || 5),
        status: "pending"
    };

    bookings.push(ride);
    saveData();

    res.json(ride);
});

/* ---------------- BOOKINGS ---------------- */
app.get("/bookings", (req, res) => {
    res.json(bookings);
});

/* ---------------- ACCEPT ---------------- */
app.post("/accept/:id", (req, res) => {

    const id = Number(req.params.id);

    bookings = bookings.map(r => {
        if (r.id === id) {
            return {
                ...r,
                status: "accepted",
                driver: {
                    name: "RideGo Driver",
                    phone: "0770000000",
                    vehicle: "CAB-1234"
                }
            };
        }
        return r;
    });

    saveData();
    res.json({ ok: true });
});

/* ---------------- DRIVER LOCATION ---------------- */
app.post("/location", (req, res) => {
    driverLocation = {
        lat: req.body.lat,
        lng: req.body.lng
    };

    saveData();
    res.json({ ok: true });
});

app.get("/location", (req, res) => {
    res.json(driverLocation);
});

/* ---------------- START ---------------- */
app.listen(3000, () => {
    console.log("🚗 Ride Go FULL SYSTEM RUNNING");
});