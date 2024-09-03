const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const cors = require('cors')
const app=express()
app.use(cors())
app.use(express.json())
const dbpath =path.join(__dirname,'schoolmanagement.db') 
let db =null

const initializeDbAndServer=async()=>{
   try {
    db = await open({
        filename:dbpath,
        driver:sqlite3.Database
    })

    app.listen(3009,()=>{
        console.log('server is listening at port 3009')
    })
   }catch(error){
    console.log(`DB error ${error.message}`)
    process.exit(1)
   }
   
}

initializeDbAndServer()


