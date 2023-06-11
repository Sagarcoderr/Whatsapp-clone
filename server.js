import express from 'express';

import mongoose from 'mongoose';

import Messages from './dbmessage.js';

import Pusher from 'pusher';

import cors from 'cors';

const app=express();

app.use(express.json());

app.use((req,res,next)=>{
    res.setHeader("Access-control-Allow-Origin","*");
    res.setHeader("Access-control-Allow-Headers","*");
    next();
});

const port=process.env.PORT  || 9000

//password-WB4HzlQTz6JKh4na
// db config


const pusher = new Pusher({
    appId: "1611978",
    key: "9fed2ae3c20ec9f31fed",
    secret: "4521e538f602a079faae",
    cluster: "ap2",
    useTLS: true
  });

  const db=mongoose.connection;

  db.once('open',()=>{
    console.log("DB is connected");

    const messageCollection=db.collection('messagecontents');
    const changeStream=messageCollection.watch();
    changeStream.on('change',(change)=>{
        console.log(change);

        if(change.operationType=='insert')
        {
            const messageDetail=change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetail.name,
                message:messageDetail.message,
            });
        }else{
            console.log("error occured");
        }
    });
  });

const connection_url="mongodb+srv://sagarshukla554:Sagar917018@cluster0.0rqtef5.mongodb.net/whatsappdb?retryWrites=true&w=majority"   //"mongodb+srv://whatappdb_user:whatsapp_user@cluster0.juw4vd7.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url,{
  // useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

app.get('/',function(req,res)
{
    res.status(200).send("<h1>hello</h1>")
});

app.get('/message/sync', function(req,res){
   Messages.find().then((error,result)=>{
    if(error){
        res.status(400).send(error);
    }else{
        res.status(200).send(result);
    }
   });

})


app.post('/messages/new',(req,res)=>{
    const dbMessage=req.body;

    Messages.create(dbMessage).then((error,result)=>{
        if(error){
            res.status(400).send(error);
        }else{
            res.status(200).send(result);
        }
    });
});





app.listen(port,()=>{
    console.log('server is working');
})


