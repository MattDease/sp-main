#pragma strict

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    if(Network.isServer){
        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(gameObject);
    }
}
