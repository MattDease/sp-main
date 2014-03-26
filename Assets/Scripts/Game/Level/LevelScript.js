#pragma strict

public var spawns : List.<Transform>;
public var tutorialPoints : List.<Transform>;
public var coins : List.<Transform>;

private var enemies : List.<Enemy> = new List.<Enemy>();
private var player : Player;
private var signType : SignType = SignType.Runner;

// TODO - use real difficulty.
private var diff : int = 0;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();

    if(player.GetType() == Commander) {
        signType = SignType.Commander;
    }
    else {
        signType = SignType.Runner;
    }

    if(Config.USE_SIGNS){
        var signs : List.<GameObject> = GameObject.Find("/GameScripts").GetComponent(LevelManager).signPrefabs;
        for(var k : int = 0; k < tutorialPoints.Count; k++){
            var locator : Transform = tutorialPoints[k];
            var signIndex : int = int.Parse(locator.name.Split("_"[0])[1]);

            if(signType == SignType.Commander && (signIndex == 1 || signIndex == 5 || signIndex == 6)){
                Instantiate(signs[signIndex], locator.position, Quaternion.identity);
            } else if(player.GetType() == Runner && (signIndex == 0 || signIndex == 2 || signIndex == 3 )){
                Instantiate(signs[signIndex], locator.position, Quaternion.identity);
            }
        }
    }

    if(Network.isServer){
        var points : Dictionary.<int, Transform> = new Dictionary.<int, Transform>();
        var prefabs : Dictionary.<int, int> = new Dictionary.<int, int>();

        for(var i : int = 0; i < spawns.Count; i++){
            var point : Transform = spawns[i];
            // parts array contains [garbage, pairId, enemyType, start/end, difficulty]
            var parts : String[] = point.name.Split("_"[0]);

            if(int.Parse(parts[4]) <= diff){
                var pair : int = int.Parse(parts[1]);
                points.Add(pair * 2 + int.Parse(parts[3]), point);
                if(!prefabs.ContainsKey(pair)){
                    prefabs.Add(pair, int.Parse(parts[2]));
                }
            }
        }
        for(var key : int in prefabs.Keys){
          //  enemies.Add(new Enemy(points[key*2], points[key*2+1], prefabs[key]));
        }


    }
}

@RPC
function initSegment(teamId : int){
    transform.position.z = teamId == player.getTeamId() ? 0 : Config.TEAM_DEPTH_OFFSET;
    if(Network.isServer){
        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(teamId, gameObject, enemies, coins);
    }
}
