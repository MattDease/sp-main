﻿#pragma strict

public var spawns : List.<Transform>;
public var tutorialPoints : List.<Transform>;
public var coins : List.<Transform>;

private var player : Player;
private var signType : SignType = SignType.Runner;

private var difficultyManager : DifficultyManager;
private var playerScript : PlayerScript;

public var diff : int = 0;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    playerScript = GameObject.Find("/GameManager").GetComponent(PlayerScript);
    player = playerScript.getSelf();
    difficultyManager = GameObject.Find("/GameScripts").GetComponent(DifficultyManager);

    if(player.GetType() == Commander) {
        signType = SignType.Commander;
    }
    else {
        signType = SignType.Runner;
    }
}

@RPC
function initSegment(teamId : int){
    if(playerScript.OBSERVER){
        transform.position.z = teamId == 0 ? 0 : Config.TEAM_DEPTH_OFFSET;
    }
    else{
        transform.position.z = teamId == player.getTeamId() ? 0 : Config.TEAM_DEPTH_OFFSET;
    }
    var platformScripts : Component[] = transform.GetComponentsInChildren(PlatformScript);
    if(platformScripts != null){
        for(var script : Component in platformScripts){
            (script as PlatformScript).initPlatform();
        }
    }

    if(Config.USE_SIGNS && teamId == player.getTeamId()){
        var signs : List.<GameObject> = GameObject.Find("/GameScripts").GetComponent(LevelManager).signPrefabs;
        for(var k : int = 0; k < tutorialPoints.Count; k++){
            var locator : Transform = tutorialPoints[k];
            var signIndex : int = int.Parse(locator.name.Split("_"[0])[1]);

            if(signType == SignType.Commander && (signIndex == 1 || signIndex == 5 || signIndex == 6)){
                Instantiate(signs[signIndex], locator.position, Quaternion.identity);
            } else if(player.GetType() == Runner && (signIndex == 0 || signIndex == 2 || signIndex == 3 || signIndex == 4)){
                Instantiate(signs[signIndex], locator.position, Quaternion.identity);
            }
        }
    }

    if(Network.isServer){
        switch(difficultyManager.getDifficulty(teamId)){
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

        var enemies : List.<Enemy> = new List.<Enemy>();
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
           enemies.Add(new Enemy(points[key*2], points[key*2+1], prefabs[key]));
        }

        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(teamId, gameObject, enemies, coins);
    }
}
