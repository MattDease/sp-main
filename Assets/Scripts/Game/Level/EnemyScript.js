#pragma strict

private var speed : float;
private var start : Vector3;
private var end : Vector3;

function OnNetworkInstantiate (info : NetworkMessageInfo) {

}

function startMove(pt1 : Vector3, pt2 : Vector3){
    // TODO adjust based on difficulty
    speed  = Random.Range(0.0, 0.2) +  Config.ENEMY_SPEED;
    start = pt1;
    end = pt2;
}

function Update(){
    if(speed){
        var pt : float = Mathf.PingPong(Time.time * speed, 1);
        gameObject.transform.position = Vector3.Lerp(start, end, pt);
    }
}

function notifyKill(){
    if(Network.isServer){
        kill();
    }
    else{
        networkView.RPC("kill", RPCMode.Server);
    }
}

@RPC
function kill(){
    Network.Destroy(gameObject);
}
