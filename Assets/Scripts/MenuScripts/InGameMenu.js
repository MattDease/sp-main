#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetup;
private var difficultyScript : DifficultyScript;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetup);
    difficultyScript = gameManager.GetComponent(DifficultyScript);
}

function OnGUI () {
    // TODO - Replace with good UI
    var playerList : List.<Player> = gameSetupScript.playerList;
    GUILayout.Label("~~~~~~~~~THE GAME~~~~~~~~~~");
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed() + " \n" + difficultyScript.getCurrentDifficulty());
    for(var player:Player in playerList){
        GUILayout.Label(" - " + player.name + (player.isSelf ? " (me)" : ""));
    }

    if(GUILayout.Button("Leave Game")){
        Network.Disconnect();
        playerScript.incrementTimesPlayed();
        stateScript.setCurrentMenu(menus.highscore);
        Application.LoadLevel("scene-menu");
    }
}
