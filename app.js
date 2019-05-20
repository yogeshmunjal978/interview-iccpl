var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const schemaObj = require("./models/master");
var appmetrics = require('appmetrics');
var monitoring = appmetrics.monitor();
mongoose.connect("mongodb://localhost:27017/intern", { useNewUrlParser: true });
monitoring.on('initialized', function (env) {
    env = monitoring.getEnvironment();
    for (var entry in env) {
        console.log(entry + ':' + env[entry]);
    };
});
monitoring.on('cpu', function (cpu) {
    console.log('[' + new Date(cpu.time) + '] CPU: ' + cpu.process);
});
var userCount = 0;
global.inputErrorResponse=function (res,err) {
    res.end('{"status":-99, "error": '+JSON.stringify(err)+'}')
};
global.globalErrorResponse=function (res,err) {

    res.end(JSON.stringify({"status":-100, "error": String(err), "type":"ref_Error"}))
};
global.errorResponse=function (res,err) {
    res.end(JSON.stringify({"status":-1, "error": String(err)}))
};

global.dbErrorResponse= function (res,err) {
    res.end(JSON.stringify({"status":-1, "error": String(err), "type":"dbError"}))
};
app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.use( express.static( "public" ) );
app.post("/signup",(req,res) =>{
    try{
    userCount++;
    console.log(userCount);
    schemaObj.userModel.findOne({email:req.body.email},(err,user) => {
        try {
            if (err) {
                return dbErrorResponse(res, err);
            }
            if (user) {
                return errorResponse(res,"master already exist")
            } else {
                var newUser = new schemaObj.userModel({
                    email: req.body.email,
                    password: req.body.password,
                    number: req.body.number,
                    type: req.body.type
                });
                newUser.save((err,saved) => {
                    try {
                        if (err) {
                            return dbErrorResponse(res, err);
                        }
                        res.end(JSON.stringify({"status":0,"data":saved}))
                    } catch (e) {
                        return globalErrorResponse(res, e)
                    }
                })

            }
        }catch (e) {
            return globalErrorResponse(res, e)
        }
        }
    )
    }catch (e) {
        return globalErrorResponse(res, e)
    }
    }
);


app.post("/login",(req,res) => {
        try {
            schemaObj.userModel.findOne({
                email: req.body.email
            }, (err, user) => {
                try {
                    if (err) {
                        return dbErrorResponse(res, err);
                    }
                    if (!user) {
                        return errorResponse(res,"user null")
                    } else {
                        if(req.body.password===user.password){
                            return res.end(JSON.stringify({"status":0,"data":user}))
                        }
                        else{
                            return errorResponse(res,"password mismatch")
                        }
                    }
                } catch (e) {
                    return globalErrorResponse(res, e)
                }
            })
        }catch (e) {
            return globalErrorResponse(res, e)
        }
});

app.listen(80, function(){
    console.log("Local server started");
});