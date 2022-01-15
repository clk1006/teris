const dbClient=require("./db.js")
let storage={
    id:"sto",
    state:0,
    activePlayer:0,
    map:{
        tiles:[
            {
                controller:0,
                troops:0,
                troopsMovable:0,
                neighbours:[]
            }
        ],
        continents:[
            {
                tiles:[],
                reward:0
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
const rollDice=(num)=>{
    return Array(num).map((_)=>Math.ceil(Math.random()*6)).sort()
}
const moveTroops=(player,tiles,numTroops,start,target)=>{
    if(tiles[start].neighbours.includes(target)&&tiles[start].controller==player&&tiles[start].troopsMovable>numTroops){
        if(tiles[target].controller==player){
            tiles[start].troops-=numTroops
            tiles[start].troopsMovable-=numTroops
            tiles[target].troops+=numTroops
        }
        else{
            let attackers=numTroops
            let defenders=tiles[target].troops
            while(Math.min(attackers,defenders)>0){
                let numDiceAtt=Math.min(attackers,3)
                let numDiceDef=Math.min(defenders,2)
                let diceAtt=rollDice(numDiceAtt)
                let diceDef=rollDice(numDiceDef)
                diceDef.forEach((x,i)=>{
                    if(x>=diceAtt[i+1]){
                        attackers-=1
                        return
                    }
                    defenders-=1
                })
            }
            tiles[target].troops=Math.max(attackers,defenders)
            tiles[target].troopsMovable=Math.max(attackers,defenders)
            if(defenders==0){
                tiles[target].controller=player
            }
        }
        return [true,tiles]
    }
    else{
        return [false]
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
                res.status(200).send()
            }
            else{
                res.status(404).send()
            }
            break
        case "moveTroops":
            let player=storage.tokens.indexOf(req.query.token)
            if(storage.state==2&&player==storage.activePlayer){
                let ret=moveTroops(player,storage.map.tiles,req.query.numTroops,req.query.start,req.query.target)
                if(ret[0]){
                    storage.map.tiles=ret[1]
                    res.status(200).send()
                }
                else{
                    res.status(404).send("Bad Request")
                }
            }
            else{
                res.status(404).send()
            }
            break
        case "endTurn":
            let player=storage.tokens.indexOf(req.query.token)
            if(player==storage.activePlayer&&storage.state==2){
                storage.map.tiles.forEach((x)=>{
                    if(x.controller==player){
                        x.troopsMovable=x.troops
                    }
                })
                storage.activePlayer++
                if(storage.activePlayer==storage.tokens.length){
                    storage.activePlayer=0
                }
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