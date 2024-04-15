require("dotenv").config();
const express = require ("express");
const app = express();
require("./db/conn");
const router = require("./routes/router");
const cors = require("cors")

const port = 7500;

app.use(express.json());// we write this beacuse frontend data will be come on the form of JSON formate and then it retrive in backend part
app.use(cors());     // we write the cors becuse it will run the backend on 3000 and backnd pat run on 7005
app.use(router);

// app.get("/",(req,res)=>{
//     res.send("server start")
// })

app.listen(port,()=> {
    console.log(`Server running ar port no :${port}`)
})


