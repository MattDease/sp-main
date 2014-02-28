#pragma strict

private var game : Game;
private var speed : float;
private var distance : float;
private var alive : boolean;
private var startTime : float;
private var start : Vector3;
private var end : Vector3;
private var idle : boolean;
private var isCardinal : boolean;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    alive = true;
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
}

function init(pt1 : Vector3, pt2 : Vector3, cardinal : boolean){
    // TODO adjust based on difficulty
    speed  = Random.Range(0.0, 0.2) + Config.ENEMY_SPEED;
    start = pt1;
    end = pt2;
    distance = Vector3.Distance(pt1, pt2);
    idle = cardinal;
    isCardinal = cardinal;
}

function Update(){
    if(!networkView.isMine || game.getState() != GameState.Playing){
        return;
    }
    if(isCardinal){
        // FIXME add support for two teams
        if(idle && end.x - game.getTeam(0).getLeader().getPosition().x < Config.CARDINAL_TRIGGER_DISTANCE){
            idle = false;
            startTime = Time.time;
        }
        if(!idle){
            var progress : float = ((Time.time - startTime) * speed)/distance;
            transform.position = Vector3.Lerp(start, end, progress);
            if(progress > 0.99){
                notifyKill();
            }
        }
    }
    else if(speed){
        var pt : float = Mathf.PingPong(Time.time * speed, 1);
        transform.position = Vector3.Lerp(start, end, pt);
    }
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
