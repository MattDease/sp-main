#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;
private var difficultyScript : DifficultyScript;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);
    difficultyScript = gameManager.GetComponent(DifficultyScript);
}

function OnGUI(){
    if(Config.DEBUG){
        OnDebugGUI();
    }
    // TODO - Add good UI

}

function OnDebugGUI(){
    GUILayout.BeginArea(Rect (Screen.width - 10 - 200, 10, 200, Screen.height - 10*2));
    GUILayout.BeginVertical(GUILayout.MaxHeight(Screen.height - 10*2));

    GUILayout.Label("Debug Menu");

    if(GUILayout.Button("Leave Game")){
        Network.Disconnect();
        playerScript.incrementTimesPlayed();
        stateScript.setCurrentMenu(menus.highscore);
        Application.LoadLevel("scene-menu");
    }

    GUILayout.Space(20);
    GUILayout.Label("Connected Players:");
    for(var player:Player in gameSetupScript.playerList.Values){
        GUILayout.Label("- " + player.getName() + (Util.IsNetworkedPlayerMe(player) ? " (me)" : ""));
    }
    GUILayout.Space(20);

    GUILayout.Label("Difficulty: " + difficultyScript.getCurrentDifficulty());
    GUILayout.Space(20);
    GUILayout.Label("Times Played: " + playerScript.getTimesPlayed());

    GUILayout.EndVertical();
    GUILayout.EndArea();
}
