#pragma strict

public static class Util{
    private var gameManager : GameObject = GameObject.Find("/GameManager");
    private var playerScript : PlayerScript = gameManager.GetComponent(PlayerScript);
    private var gameSetupScript : GameSetup = gameManager.GetComponent(GameSetup);
    private var stateScript : StateScript = gameManager.GetComponent(StateScript);

    public function GetPlayerById(id : String){
        return gameSetupScript.playerList[id];
    }

}
