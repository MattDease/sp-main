#pragma strict

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    if(Network.isServer){
        Debug.Log(GameObject.Find("GameScripts").GetComponent(LevelManager));
        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(gameObject);
    }
}
