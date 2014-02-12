#pragma strict

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    var player : Player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
    if(player.GetType() == Commander){
        Util.Toggle(gameObject.transform.Find("debug_platform3/tut_commander").gameObject, true);
    }
    else{
        Util.Toggle(gameObject.transform.Find("debug_platform3/tut_runner").gameObject, true);
    }
    if(Network.isServer){
        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(gameObject);
    }
}
