/*
* Configuration of the app
* Host and DB
* */

let dbHost = process.env.dbHost || "localhost";

module.exports = {
    name:"Ameen",
    title:"Ameen",
    http:{
        host:"localhost",
        port: 4000
    },
    author:"Guba Techack",
    version:"1.0.0",
    db:{
        connectionUri:"mongodb://" + dbHost + ":27017/ameen"
    }
};