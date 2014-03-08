#pragma strict

private var player : Player;
private var alive : boolean;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
    alive = true;
}

@RPC
function initCoin(teamId : int, hostTeam : boolean){
    if(!hostTeam){
        transform.position.z -= Config.TEAM_DEPTH_OFFSET;
    }
    transform.position.z += (teamId == player.getTeamId()) ? 0 : Config.TEAM_DEPTH_OFFSET;
}


function isAlive(){
    return alive;
}

function notifyKill(){
    if(alive){
        if(Network.isServer){
            kill();
        }
        else{
            networkView.RPC("kill", RPCMode.Server);
        }
    }
}

@RPC
function kill(){
    alive = false;
    Util.Toggle(gameObject, false);

    networkView.RPC("syncKill", RPCMode.OthersBuffered);
}

@RPC
function syncKill(){
    alive = false;
    Util.Toggle(gameObject, false);
}
