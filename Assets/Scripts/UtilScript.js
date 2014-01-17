#pragma strict

public static class Util{
    private var gameManager : GameObject = GameObject.Find("/GameManager");
    private var playerScript : PlayerScript = gameManager.GetComponent(PlayerScript);
    private var gameSetupScript : GameSetupScript = gameManager.GetComponent(GameSetupScript);
    private var stateScript : StateScript = gameManager.GetComponent(StateScript);

    public function GetPlayerById(id : String){
        return gameSetupScript.playerList[id];
    }

}
