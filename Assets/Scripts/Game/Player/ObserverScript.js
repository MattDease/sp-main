#pragma strict

private var game : Game;
private var gameManager : GameObject;
private var playerScript : PlayerScript;

private var velocity : Vector3 = Vector3.zero;

function Start () {
    gameManager = GameObject.Find("/GameManager");
    game = gameManager.GetComponent(GameSetupScript).game;
    playerScript = gameManager.GetComponent(PlayerScript);

    Camera.main.transparencySortMode = TransparencySortMode.Orthographic;
}

function Update () {
    if(game.getState() != GameState.Playing){
        return;
    }
    var targetPosition : Vector3;
    var team : Team = game.getTeam(playerScript.OBSERVED_TEAM);
    if(!team.isAlive() && game.getMode() == GameMode.Versus){
        playerScript.OBSERVED_TEAM = (playerScript.OBSERVED_TEAM == 0 ? 1 : 0);
    }
    team = game.getTeam(playerScript.OBSERVED_TEAM);
    if(team.isAlive()){
        targetPosition = team.getObserverCameraPosition();
    }
    if(playerScript.OBSERVED_TEAM == 1){
        targetPosition.z += Config.TEAM_DEPTH_OFFSET;
    }
    if(targetPosition != Vector3.zero){
        transform.position = Vector3.SmoothDamp(transform.position, targetPosition, velocity, 0.4);
    }

    if(game.getMode() == GameMode.Versus && Input.GetKeyDown(KeyCode.S)){
        playerScript.OBSERVED_TEAM = (playerScript.OBSERVED_TEAM == 0 ? 1 : 0);
    }
}
