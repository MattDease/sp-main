#pragma strict

public var spawns : List.<Transform>;
public var tutorialPoints : List.<Transform>;
public var coins : List.<Transform>;

private var player : Player;
private var signType : SignType = SignType.Runner;

private var difficultyManager : DifficultyManager;

public var diff : int = 0;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
    difficultyManager = GameObject.Find("/GameScripts").GetComponent(DifficultyManager);

    switch(difficultyManager.getDifficulty()){
        case GameDifficulty.Tutorial:
            diff = 0;
        break;
        case GameDifficulty.Easy:
            diff = 0;
        break;
        case GameDifficulty.Medium:
            diff = 1;
        break;
        case GameDifficulty.Hard:
             diff = 2;
        break;
        case GameDifficulty.Expert:
            diff = 3;
        break;
    }


    if(player.GetType() == Commander) {
        signType = SignType.Commander;
    }
    else {
        signType = SignType.Runner;
    }
}

@RPC
function initSegment(teamId : int){
    transform.position.z = teamId == player.getTeamId() ? 0 : Config.TEAM_DEPTH_OFFSET;
    if(Network.isServer){
        var enemies : List.<Enemy> = new List.<Enemy>();
        var points : Dictionary.<int, Transform> = new Dictionary.<int, Transform>();
        var prefabs : Dictionary.<int, int> = new Dictionary.<int, int>();

        if(Config.USE_SIGNS && teamId == player.getTeamId()){
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
           // enemies.Add(new Enemy(points[key*2], points[key*2+1], prefabs[key]));
        }

        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(teamId, gameObject, enemies, coins);
    }
}
