const dbClient=require("./db.js")
let storage={
    id:"sto",
    state:0,
    activePlayer:0,
    map:{
        tiles:[
            {
                controller,
                troops,
                neighbours:[]
            }
        ],
        continents:[
            {
                tiles:[],
                reward
            }
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
const getTroops=(map,player)=>{
    let troops=3
    map.continents.forEach((x)=>{
        for(let i=0;i<x.tiles.length;i++){
            if(map.tiles[x.tiles[i]].controller!=player){
                return
            }
        }
        troops+=x.reward
    })
    return troops
}
const moveTroops=(player,tiles,numTroops,start,target)=>{
    if(tiles[start].neighbours.includes(target)&&tiles[start].controller==player&&tiles[start].troops>numTroops){
        if(tiles[target].controller==player){
            tiles[start].troops-=numTroops
            tiles[target].troops+=numTroops
        }
        else{
            
        }
    }
    else{
        return false
    }
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
        case "getToken":
            if(storage.state==1){
                let token=createToken(storage.tokens)
                let player=storage.tokens.length
                storage.tokens.push(token)
                res.status(200).json({
                    token:token,
                    id:player
                })
            }
            else{
                res.status(404).send()
            }
            break
        case "openGame":
            storage.state=1
            storage.tokens=[]
            storage.map.tiles=storage.map.tiles.map((x)=>{
                x.controller=-1
                x.troops=0
                return x
            })
            res.status(200).send()
            break
        case "startGame":
            if(storage.state==1&&storage.tokens.length>=2){
                storage.state=2
                storage.map.tiles.map((_,i)=>{
                    return i
                }).sort((a,b)=>{0.5-Math.random()}).forEach((x,i)=>{
                    storage.map.tiles[x].controller=i%(storage.tokens.length)
                })
            }
            else{
                res.status(404).send()
            }
            break
        case "getMap":
            res.status(200).json(storage.map)
            break
        case "getActivePlayer":
            res.status(200).send(storage.activePlayer)
            break
        case "getTroopCount":
            res.status(200).send(getTroops(storage.map,req.query.player))
            break
        default:
            res.status(404).send()
    }
    data.updateOne({id:"sto"},{$set:storage});
}