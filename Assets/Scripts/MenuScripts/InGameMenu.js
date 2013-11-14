#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var difficultyScript : DifficultyScript;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    difficultyScript = gameManager.GetComponent(DifficultyScript);

}

function OnGUI () {
    GUILayout.Label("~~~~~~~~~THE GAME~~~~~~~~~~");
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed() + " \n" + difficultyScript.getCurrentDifficulty()
);
    if(GUILayout.Button("Leave Game")){
        playerScript.incrementTimesPlayed();
        stateScript.setCurrentMenu(menus.highscore);
        Application.LoadLevel("scene-menu");
    }
}
