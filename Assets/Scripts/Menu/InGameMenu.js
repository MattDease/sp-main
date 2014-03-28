#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);
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
        gameSetupScript.leaveGame();
        return;
    }

    var gameState = stateScript.getGameState();

    GUILayout.Space(10);
    GUILayout.Label("State: " + gameState.ToString());

    switch(gameState){
        case GameState.Uninitialized :
            break;
        case GameState.Loading :
            GUILayout.Space(10);
            GUILayout.Label("Game Starts In: " + gameSetupScript.getCountDown());
            break;
        case GameState.Playing :
            var teams : List.<Team> = gameSetupScript.game.getTeams();
            for(var team : Team in teams){
                GUILayout.Space(10);
                GUILayout.Label("Team " + team.getId() + " - Distance: " + team.getDistance() + " - Coins: " + team.getCoinCount() + (!team.isAlive() ? " - dead" : ""));
                for(var player : Player in team.getTeammates().Values){
                    GUILayout.Label("- " + (player.GetType() == Runner ? "(R) " : "(C) ") + player.getName() + (Util.IsNetworkedPlayerMe(player) ? " (me)" : ""));
                }
            }
            break;
        case GameState.Ended :
            var winner : Team = gameSetupScript.game.getLeadingTeam();
            GUILayout.Space(10);
            GUILayout.Label("Team " + winner.getId() + " Won - Distance: " + winner.getDistance());
            if(gameSetupScript.game.isValid() && GUILayout.Button("Restart Game")){
                // TODO - implement
            }
            break;
        case GameState.Error :
            GUILayout.Space(10);
            GUILayout.Label("Error in game setup");
            break;
    }

    GUILayout.EndVertical();
    GUILayout.EndArea();
}
