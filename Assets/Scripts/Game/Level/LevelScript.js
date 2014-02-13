#pragma strict

public var spawns : List.<Transform>;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    var player : Player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
    if(player.GetType() == Commander){
        Util.Toggle(gameObject.transform.Find("debug_platform3/tut_commander").gameObject, true);
    }
    else{
        Util.Toggle(gameObject.transform.Find("debug_platform3/tut_runner").gameObject, true);
    }
    var enemies : List.<Enemy> = new List.<Enemy>();
    var points : Dictionary.<int, Transform> = new Dictionary.<int, Transform>();
    var prefabs : Dictionary.<int, int> = new Dictionary.<int, int>();
    for(var i : int = 0; i < spawns.Count; i++){
        var point : Transform = spawns[i];
        var parts : String[] = point.name.Split("_"[0]);
        var pair : int = int.Parse(parts[0]);
        points.Add(pair * 2 + int.Parse(parts[2]), point);
        if(!prefabs.ContainsKey(pair)){
            prefabs.Add(pair, int.Parse(parts[1]));
        }
    }
    for(var j : int = 0; j < prefabs.Count; j++){
        enemies.Add(new Enemy(points[j*2], points[j*2+1], prefabs[j]));
    }
    if(Network.isServer){
        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(gameObject, enemies);
    }
}
