const dbClient=require("./db.js")
let storage={
    id:"stoTet",
    state:0,
    score:0,
    tiles:[],
    current:{
        type:0,
        pos:0,
        rot:0
    },
    next:0
}
Array(200).forEach((_)=>{
    storage.tiles.push(0)
})
const getColumns=(curr)=>{
    switch(curr.type){
        case 0:
            return (rot%2==0?4:1)
        case 1:
            return (rot%2==0?3:2)
        case 2:
            return (rot%2==0?3:2)
        case 3:
            return (rot%2==0?3:2)
        case 4:
            return (rot%2==0?3:2)
        case 5:
            return (rot%2==0?3:2)
        case 6:
            return (rot%2==0?2:2)
    }
}
const getScore=(map,player)=>{
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
const dropBlock=(block,tiles)=>{
    let id=tiles.reduce((a,b)=>Math.max(a,b),0)+1
    let columns=getColumns(block)
    let row=19
    let column=pos
    Array(1).forEach((_)=>{
        for(;row>=0;row++){
            for(;column<pos+columns;column++){
                if(tiles[10*row+column]!=0){
                    return
                }
            }
        }
    })
    if(!(row==0&&column==columns+pos-1&&tiles[10*row+column]==0)){
        row++
    }
    Array(columns).forEach((_,col)=>{
        tiles[10*row+col+pos]=id
    })
}
module.exports=async(req,res)=>{
    const client=await dbClient;
    const data=client.db().collection("data");
    if((await data.find({id:"stoTet"}).toArray()).length==0){
        data.insertOne(storage);
    }
    else{
        storage=await data.findOne({id:"stoTet"});
    }
    let player=storage.tokens.indexOf(req.query.token)
    switch(req.query.type){
        case "getState":
            res.status(200).json([score,storage.tiles,storage.current,storage.next])
        default:
            res.status(404).send()
    }
    data.updateOne({id:"stoTet"},{$set:storage});
}