const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d0ctt95.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const timeSlotCollection = client.db("appointment-project").collection("timeSlot");
        const bookedAppointmentCollection = client.db("appointment-project").collection("booked-appointment");
        const usersCollection = client.db("appointment-project").collection("users");

        app.get('/timeSlots', async (req, res) => {
            const query = {}
            const result = await timeSlotCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/timeSlot/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await timeSlotCollection.findOne(query)
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const bookingData = req.body;
            const query = {
                bookingDate: bookingData.bookingDate,
                email: bookingData.email,
            }
            // console.log(query);
            const alreadyBooked = await bookedAppointmentCollection.find(query).toArray();
            if (alreadyBooked.length) {
                return res.send({ acknowledged: false })
            }
            const result = await bookedAppointmentCollection.insertOne(bookingData);
            res.send(result)
        })

        app.get('/allBookings', async (req, res) => {
            const result = await bookedAppointmentCollection.find({}).toArray();
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const result = await bookedAppointmentCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedAppointmentCollection.findOne(query)
            res.send(result)
        })

        app.put('/update', async (req, res) => {
            const id = req.query.id;
            const data = req.body;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: data,
            }
            const result = await bookedAppointmentCollection.updateOne(query, updatedDoc, options)
            res.send(result);
        })

        app.put('/updateStatus', async (req, res) => {
            const id = req.query.id;
            const status = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: status,
            }
            const result = await bookedAppointmentCollection.updateOne(query, updatedDoc, options);
            res.send(result)
        })


        app.delete('/delete', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedAppointmentCollection.deleteOne(query);
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = {
                displayName: user?.displayName,
                email: user?.email,
            }
            // console.log(query);
            const alreadyHave = await usersCollection.find(query).toArray();
            if (alreadyHave.length) {
                return res.send({ acknowledged: false })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send('appointment server is running')
})
app.listen(port, (req, res) => {
    console.log(`server is running on port ${port}`);
})