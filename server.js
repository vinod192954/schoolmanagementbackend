const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const bcrypt=require('bcrypt')
const {open} = require('sqlite')
const app=express()
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

app.post("/principal/register",async (request,response)=>{
    const {username,password,email} = request.body 
    const hashedPassword = await bcrypt.hash(password,10);
    const createUserQuery = `
    INSERT INTO 
    principal(username,password,email) 
    VALUES (?,?,?)`
    const dbResponse = await db.run(createUserQuery,[username,hashedPassword,email]) 
    response.send("User created successully")

})

app.post("/principal/login/",async(request,response)=>{
    try{
    const {username,password} = request.body
    const selectUserQuery = `SELECT * FROM principal WHERE username = ?` 
    const dbUser = await db.get(selectUserQuery,[username])
    
    if (dbUser!==undefined){
        const isPasswordMatch = await bcrypt.compare(password,dbUser.password)
        if (isPasswordMatch===true){
            response.send("login successfully")
        }
        else{
            response.send("Invalid Password")
    }
   
    }
    else{
        response.send("Invalid User")
    }
    }catch(error){
        console.log("error message:",error.message)    
    }
})

app.post("/teacher/register",async(request,reponse)=>{
    const {username,password,email,subject} = request.body
    const selectTeacherQuery = `SELECT * FROM teachers WHERE username = ?`
    const dbUser = await  db.get(selectTeacherQuery)
    if (dbUser!==undefined){
        
    }
})

