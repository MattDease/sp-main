#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetup;
private var difficultyScript : DifficultyScript;

private var isDebug : boolean = Config.debug;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetup);
    difficultyScript = gameManager.GetComponent(DifficultyScript);
}

function OnGUI(){
    if(isDebug){
        OnDebugGUI();
    }
    // TODO - Replace with good UI
    var playerList : Dictionary.<String,Player> = gameSetupScript.playerList;
    GUILayout.Label("~~~~~~~~~THE GAME~~~~~~~~~~");
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed() + " \n" + difficultyScript.getCurrentDifficulty());
    for(var player:Player in playerList.Values){
        GUILayout.Label(" - " + player.name + (player.isSelf ? " (me)" : ""));
    }

    if(GUILayout.Button("Leave Game")){
        Network.Disconnect();
        playerScript.incrementTimesPlayed();
        stateScript.setCurrentMenu(menus.highscore);
        Application.LoadLevel("scene-menu");
    }
}

function OnDebugGUI(){
    GUILayout.BeginArea(Rect (Screen.width - 10 - 200, 10, 200, Screen.height - 10*2));
    GUILayout.BeginVertical(GUILayout.MaxHeight(Screen.height - 10*2));

    GUILayout.Label("Debug Menu");

    if (GUILayout.Button ("Example Button")) {
        // Do whatever
    }

    GUILayout.EndVertical();
    GUILayout.EndArea();
}
