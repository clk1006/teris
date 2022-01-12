const dbClient=require("./db.js")
let storage={
    id:"sto",
    activePlayer:0,
    map:{
        tiles:[

        ],
        continents:[

        ]
    },
    tokens:[
    ]
}
const createToken=(tokens)=>{
    let token="";
    while(token.length<15){
        token+=Math.floor(Math.random()*10);
    }
    if(tokens.includes(token)){
        return createToken(tokens);
    }
    return token;
}
module.exports=async(req,res)=>{
    const client=await dbClient;
    const data=client.db().collection("data");
    if((await data.find({id:"sto"}).toArray()).length==0){
        data.insertOne(storage);
    }
    else{
        storage=await data.findOne({id:"sto"});
    }
    switch(req.query.type){
        case "getMap":
            res.status(200).json(storage.map)
            break
        case "getActivePlayer":
            res.status(200).send(storage.activePlayer)
    }
    data.updateOne({id:"sto"},{$set:storage});
}