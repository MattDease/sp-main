#pragma strict

public static class Util{
    private var gameManager : GameObject = GameObject.Find("/GameManager");
    private var playerScript : PlayerScript = gameManager.GetComponent(PlayerScript);
    private var gameSetupScript : GameSetupScript = gameManager.GetComponent(GameSetupScript);
    private var stateScript : StateScript = gameManager.GetComponent(StateScript);

    public function GetPlayerById(id : String) : Player{
        return gameSetupScript.game.getPlayers()[id];
    }

    // Returns true if the given player object is owned this client
    public function IsNetworkedPlayerMe(player : Player) : boolean{
        return Network.player == player.getNetworkPlayer();
    }

}
