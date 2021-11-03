const express = require("express");
const app=express();
const path = require('path');
const fetch =require('cross-fetch');
const User=require('./models/user');
const Quote=require('./models/quotes');
const CurrentLogin=require('./models/currentlogin');
var requestIp = require('request-ip');

require('./db/connection');

// require('dotenv').config();


// const { auth ,requiresAuth } = require('express-openid-connect');
// app.use(
//     auth({
//         authRequired:false,
//         auth0Logout:true,
//         issuerBaseURL: process.env.ISSUER_BASE_URL,
//         baseURL: process.env.BASE_URL,
//         clientID: process.env.CLIENT_ID,
//         secret: process.env.SECRET,
//         // idpLogout: true,
//     })
// );

const partial_path=path.join(__dirname,'./views/partials')

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.get('/',(req,res)=>{
//     res.render(req.oidc.isAuthenticated() ? 'home': 'error');
// })
let LOGIN=false;
let NICKNAME;
let EMAIL;



app.get('/',(req,res)=>{
    
    const user=User.findOne({email:EMAIL})
    .then((result)=>{
        if(result.islogin){
            res.render('home',{login:true});
        }
        else{
            res.render('login',{login:false});
        }
    })
    .catch((error)=>{
        res.render('register',{login:false});
    })
    
    // if(LOGIN){
    //     res.render('home');
    // }
    // else{
    //     res.render('login');
    // }
})
const getimage=async (data)=>{
    const searchimg=data.author;
    const text=searchimg.split(' ');
    const image= await fetch(`https://pixabay.com/api/?key=24162915-439cdea99849b510b56191825&q=${text[0]}+${text[1]}&image_type=photo`)
    const imagedata=await image.json();
    // console.log(imagedata);
    // console.log(imagedata["hits"][0]["webformatURL"]);
    if(imagedata["totalHits"]===0){
        return "https://dynamicdistributors.in/wp-content/uploads/2021/02/114-1149847_avatar-unknown-dp.jpg";
    }
    return (imagedata["hits"][0]["webformatURL"]);
}
app.get('/quote',(req,res)=>{
    const user=User.findOne({email:EMAIL})
    .then((result)=>{
        if(result.islogin){
            async function randomQuote() {
                const response = await fetch('https://api.quotable.io/random')
                const data = await response.json()
                // console.log(`${data.content} —${data.author}`)
                // res.send(`${data.content} —${data.author}`)
                const text=await getimage(data);
                // console.log(text);
                res.render('index',{content:data.content,author:data.author,login:true,email:EMAIL,imageurl:text});
            }
            randomQuote()
        }
        else{
            res.render('login',{login:false});
        }
    })
    .catch((error)=>{
        res.render('register',{login:false});
    })
    // if(LOGIN){
    //     async function randomQuote() {
    //         const response = await fetch('https://api.quotable.io/random')
    //         const data = await response.json()
    //         // console.log(`${data.content} —${data.author}`)
    //         // res.send(`${data.content} —${data.author}`)
    //         res.render('index',{content:data.content,author:data.author});
    //     }
    //     randomQuote()
    // }
    // else{
    //     res.render('login');
    // }
})

app.use(express.urlencoded({extended:true}));
app.post('/save',(req,res)=>{
    // console.log(JSON.stringify(req.body.content));
    // console.log(JSON.stringify(req.body.email));
    // console.log(JSON.stringify(req.body.author));

    const quote=new Quote(req.body);
    const save=quote.save();
    res.redirect('/quote');
})

app.get('/savedquotes',(req,res)=>{
    // console.log(EMAIL);
    const user=User.findOne({email:EMAIL})
    .then((result)=>{
        if(result.islogin){
            const quotes=Quote.find({email:EMAIL},(error,result)=>{
                // console.log(result);
                res.render('savedquotes',{result,login:true});
            })
        }
        else{
            res.render('login',{login:false});
        }
    })
    .catch((error)=>{
        res.render('register',{login:false});
    });
})

app.post('/deletequote',(req,res)=>{
    const quote=Quote.findOneAndDelete({email:req.body.email,content:req.body.content,author:req.body.author})
    .then((result)=>{
        console.log("Successfully removed from the DB!");
    })
    .catch((error)=>{
        console.log("error occurred",error);
    })
    res.redirect('/savedquotes');
})

// app.get('/profile',requiresAuth(),(req,res)=>{
app.get('/profile',(req,res)=>{
    // res.send(JSON.stringify(req.oidc.user));
    const user=User.findOne({email:EMAIL})
    .then((result)=>{
        if(result.islogin){
            res.render('profile',
            {
                // nickname:req.oidc.user.nickname,
                // email:req.oidc.user.email
                nickname:NICKNAME,
                email:EMAIL,
                login:true
            });
        }
        else{
            res.render('login',{login:false});
        }
    })
    .catch((error)=>{
        res.render('register',{login:false});
    })
    // if(LOGIN){
    //     res.render('profile',
    //     {
    //         // nickname:req.oidc.user.nickname,
    //         // email:req.oidc.user.email
    //         nickname:NICKNAME,
    //         email:EMAIL
    //     });
    // }
    // else{
    //     res.render('login');
    // }
    
})

const updateDb=async (EMAIL,login)=>{
    const user=await User.findOneAndUpdate({email:EMAIL},
        {
            $set:{
                islogin:login
            }
        }
    )
    .then((result)=>{
        console.log('DB Updated');
    })
    .catch((error)=>{
        console.log(error)
    });
    
    return user;
}


app.get('/logout',(req,res)=>{
    LOGIN=false;
    const user=User.findOne({email:EMAIL})
    .then((result)=>{
        result.islogin=false;
        updateDb(EMAIL,result.islogin)
    })
    res.render('error',{login:false});
})


app.get('/register',(req,res)=>{
    res.render('register',{login:false});
})

app.use(express.urlencoded({extended:true}));
app.post('/register',async (req,res)=>{
    try{
        const user=new User(req.body);
        const saved=await user.save();
        res.redirect('/login');
    }catch(error){
        res.status(400).send(error);
    }
})

app.get('/login',(req,res)=>{
    res.render('login',{login:false});
})

const addclient=(EMAIL,clientIp)=>{
    const current=new CurrentLogin({email:EMAIL,IP:clientIp})
    current.save();
}
app.post('/login',(req,res)=>{
    
    const user=User.findOne({email:req.body.email})
    .then((result)=>{
        if(result.password===req.body.password){
            LOGIN=true;
            NICKNAME=result.name;
            EMAIL=result.email;
            // result.islogin=true;
            updateDb(EMAIL,true);
            var clientIp = requestIp.getClientIp(req);
            // console.log(clientIp);
            addclient(EMAIL,clientIp);

            // res.send("User logged in successfully!");
            res.render('home',{login:true})
        }
        else{
            // console.log("entered login details",req.body);
            // console.log("Database details",result.email,result.password);
            res.render('login',{login:false});
        }
    })
    
})



const port=process.env.PORT ||3000;
app.listen(port,()=>{
    console.log(`listening on port ${port}`);
});

