#pragma strict

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    if(Network.isServer){
        var levelManager = GameObject.Find("GameScripts").GetComponent(LevelManager);
        var index : int = -1;
        for(var i : int = 0; i < levelManager.BACKGROUND_OFFSET.Count; i++){
            var depth : float = levelManager.BACKGROUND_OFFSET[i].z;
            if(GameObject.Find("/GameManager").GetComponent(GameSetupScript).game.getMode() == GameMode.Versus){
                depth += Config.TEAM_DEPTH_OFFSET;
            }
            if(transform.position.z == depth){
                index = i;
                break;
            }
        }
        levelManager.onAddPlane(index, gameObject);
    }
}
