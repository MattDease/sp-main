#pragma strict

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    if(Network.isServer){
        var levelManager = GameObject.Find("GameScripts").GetComponent(LevelManager);
        var index : int = -1;
        for(var i : int = 0; i < levelManager.BACKGROUND_OFFSET.Count; i++){
            if(transform.position.z == levelManager.BACKGROUND_OFFSET[i].z){
                index = i;
                break;
            }
        }
        levelManager.onAddPlane(index, gameObject);
    }
}
