const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const bcrypt=require('bcrypt')
const {open} = require('sqlite')
const { request } = require('http')
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

app.post("/teacher/register",async(request,response)=>{
    const {full_name,username,password,email,subject,age,qualification} = request.body
    const hashedPassword = await bcrypt.hash(password,10)
    const selectTeacherQuery = `SELECT * FROM teachers WHERE username = ?`
    const dbUser = await db.get(selectTeacherQuery,[username])
    console.log(dbUser)
    if (dbUser===undefined){
        const createUserQuery = `
        INSERT INTO teachers(full_name,username,password,email,subject,age,qualification)
        VALUES(?,?,?,?,?,?,?) `
        const dbUser = await db.run(createUserQuery,[full_name,username,hashedPassword,email,subject,age,qualification])
        response.send("User created successfully")
    }
    else{
        response.send("User alredy exist")
    }
})

app.post("/teacher/login",async(request,response)=>{
    const {username,password} = request.body 
    const selectedQuery = `SELECT * FROM teachers WHERE username = ?` 
    const selectedDbUser = await db.get(selectedQuery,[username]) 
    if (selectedDbUser!==undefined){
        const isPasswordMatch = await bcrypt.compare(password,selectedDbUser.password) 
        if (isPasswordMatch===true){
            response.send("login successfully")
        }
        else{
            response.send("Invalid Password")
        }
    }
    else{
        response.send("User not Exist")
    }
})

app.get("/teachers",async(request,response)=>{
    const selectAllUser = `SELECT full_name,age,email,subject,qualification,class_section FROM teachers` 
    const dbUsers = await db.all(selectAllUser) 
    console.log(dbUsers)
    response.send(dbUsers)
})

//api for new student registering 
app.post("/student/register",async(request,response)=>{
    const {username,full_name,password,father_name,class_no,phone_number,age} = request.body
    const hashedPassword = await bcrypt.hash(password,10)
    const selectedUserQuery = `SELECT * FROM students WHERE username = ?` 
    const dbUser = await db.get(selectedUserQuery,[username])
    if (dbUser===undefined){
        const newUserQuery = `
        INSERT INTO students(username,full_name,password,father_name,class_no,phone_number,age)
        VALUES(?,?,?,?,?,?,?)`
        const queryResult = await db.run(newUserQuery,[username,full_name,hashedPassword,father_name,class_no,phone_number,age])
        response.send("User created successfully")
    }
    else{
        response.send("User already created")
    }
})

app.get("/students",async(request,response)=>{
    const selectedAllStudents = `SELECT full_name,father_name,class_no,phone_number,age, admit FROM students`
    const students = await db.all(selectedAllStudents)
    console.log(students)
    response.send(students)
})

app.post("/students/login",async(request,response)=>{
    const {username,password} = request.body 
    const selectedQuery = `SELECT * FROM students WHERE username = ?`
    const dbUser = await db.get(selectedQuery,[username])
    if (dbUser===undefined){
        response.send("User not exist")
    }
    else{
        const isPassword = await bcrypt.compare(password,dbUser.password)
        if (isPassword===true){
            response.send("user successfully logged In")
        }
        else{
            response.send("Invalid Password")
        }
    }
})

