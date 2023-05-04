const { readdirSync } = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");


//Application Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(helmet());


// Routes Middleware
readdirSync("./routes").map(r => app.use("/api/v1", require(`./routes/${r}`)))

//Undefined Route Implementation
app.use("*",(req, res)=>{
    res.status(404).json({status: 'fail' ,data: "Route Undefined"});
})

app.get('/', (req, res)=>{
    res.status(200).send(`
        <div class="container mt-5">
            <div class="jumbotron text-center">
                <h1 class="fs-3">Welcome to My E-Commerce Server</h1>
                <p class="lead">Visit My Website:- 
                <a class="" href="http://localhost:3000/"> My E-Commerce Website</a></p>
            </div>
        </div>
    `);
});

// Server 
const database = process.env.DATABASE_URL
const port = process.env.PORT || 5000;

// Connect to Database and start server
mongoose.set('strictQuery', true);
mongoose
    .connect(database, {autoIndex: true})
    .then(() => {
        app.listen(port, () => {
            console.log(` Server Running on port ${port}`);
        })
    })
    .catch((error) => console.log(error));



