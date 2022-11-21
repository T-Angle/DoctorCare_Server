import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './routes/web';
import connectDB from "./config/connectDB";
import cors from "cors";

require('dotenv').config();

let app = express();

// config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 8080;


app.listen(port, () => {
    //callback
    console.log("Backend is running on the port: " + port)
}) 